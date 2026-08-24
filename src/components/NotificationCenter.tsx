'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, X, CheckCheck, AlertTriangle, Info, AlertCircle, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  subject: string | null;
  message: string | null;
  status: 'pending' | 'sent' | 'read' | 'failed';
  priority: 'normal' | 'important' | 'urgent' | 'emergency';
  created_at: string;
  action_url: string | null;
  reference_type: string | null;
}

const PRIORITY_ICONS: Record<string, React.ElementType> = {
  emergency: AlertTriangle,
  urgent: AlertCircle,
  important: Info,
  normal: Info,
};

const PRIORITY_COLORS: Record<string, string> = {
  emergency: 'text-red-600 bg-red-50',
  urgent: 'text-orange-600 bg-orange-50',
  important: 'text-amber-600 bg-amber-50',
  normal: 'text-blue-600 bg-blue-50',
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    const notifs = data ?? [];
    setNotifications(notifs as Notification[]);
    setUnreadCount(notifs.filter((n: any) => n.status !== 'read').length);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Realtime subscription
    let sub: any;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      sub = supabase.channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        }, () => fetchNotifications())
        .subscribe();
    });
    return () => { if (sub) supabase.removeChannel(sub); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', id);
    fetchNotifications();
  };

  const markAllRead = async () => {
    const ids = notifications.filter(n => n.status !== 'read').map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from('notifications').update({ status: 'read', read_at: new Date().toISOString() }).in('id', ids);
    fetchNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            ) : notifications.map(n => {
              const Icon = PRIORITY_ICONS[n.priority] ?? Info;
              const isUnread = n.status !== 'read';
              return (
                <div
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.action_url) window.location.href = n.action_url; }}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${isUnread ? 'bg-blue-50/30' : ''}`}
                >
                  <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${PRIORITY_COLORS[n.priority]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-${isUnread ? 'semibold' : 'medium'} text-slate-800 truncate`}>{n.subject ?? 'Notification'}</p>
                    {n.message && <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  {n.action_url && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-1" />}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <a href="/dashboard/settings" className="text-xs text-blue-600 hover:underline font-medium">Manage notification preferences</a>
          </div>
        </div>
      )}
    </div>
  );
}
