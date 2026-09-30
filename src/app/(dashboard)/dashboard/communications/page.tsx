"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Video, Phone, Mail, Plus, Loader2, Search, Calendar, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CommunicationsPage() {
  const [comms, setComms] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "meetings" | "notifications">("timeline");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: c }, { data: n }] = await Promise.all([
        supabase.from('communications').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      setComms(c || []);
      setNotifications(n || []);
    } catch {
      setComms([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const typeIcon = (t: string) => ({
    meet: <Video className="w-4 h-4 text-blue-500" />,
    jitsi: <Video className="w-4 h-4 text-blue-500" />,
    email: <Mail className="w-4 h-4 text-purple-500" />,
    call: <Phone className="w-4 h-4 text-emerald-500" />,
    meeting: <Calendar className="w-4 h-4 text-amber-500" />,
  }[t] || <MessageSquare className="w-4 h-4 text-slate-gray" />);

  const safeFormatDate = (val: any) => {
    if (!val) return 'Recent';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  const safeFormatDateTime = (val: any) => {
    if (!val) return 'Scheduled';
    try {
      const d = new Date(val);
      return isNaN(d.getTime()) ? 'Scheduled' : d.toLocaleString();
    } catch {
      return 'Scheduled';
    }
  };

  const typeBg = (t: string) => ({
    meet: 'bg-blue-50',
    jitsi: 'bg-blue-50',
    email: 'bg-purple-50',
    call: 'bg-emerald-50',
    meeting: 'bg-amber-50',
  }[t] || 'bg-pebble');

  const filtered = comms.filter(c =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.type || '').toLowerCase().includes(search.toLowerCase())
  );

  const meetings = filtered.filter(c => c.type === 'meet' || c.type === 'jitsi' || c.type === 'meeting' || c.type === 'video');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] sm:text-[38px] font-bold font-display text-ink-navy tracking-tight">Communication Center</h1>
          <p className="text-slate-gray font-medium mt-1">Live employee chat, video meetings & operational timeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/communications/chat"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Open Team Chat</span>
          </Link>
          <Link
            href="/dashboard/communications/meetings"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/20 transition flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Meetings Platform</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total", value: comms.length, icon: MessageSquare, color: "text-signal-blue" },
          { label: "Video Meetings", value: comms.filter(c => c.type === 'meet' || c.type === 'jitsi' || c.type === 'video').length, icon: Video, color: "text-blue-500" },
          { label: "Calls", value: comms.filter(c => c.type === 'call').length, icon: Phone, color: "text-emerald-500" },
          { label: "Unread Notifications", value: notifications.filter(n => !n.read_at).length, icon: Bell, color: "text-amber-500" },
        ].map(m => (
          <div key={m.label} className="cal-card p-6">
            <m.icon className={`w-5 h-5 ${m.color} mb-3`} />
            <p className="text-sm text-slate-gray">{m.label}</p>
            <p className="text-3xl font-bold text-ink-navy font-display mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="border-b border-hairline bg-paper p-5 flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {(["timeline", "meetings", "notifications"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${activeTab === t ? 'bg-signal-blue text-white' : 'text-slate-gray hover:bg-pebble'}`}>{t}</button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mist-gray" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 text-sm border border-hairline rounded-lg bg-cloud focus:outline-none focus:border-signal-blue w-60" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
        ) : activeTab === "timeline" ? (
          <div className="divide-y divide-hairline">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-gray"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No communications yet.</p></div>
            ) : filtered.map(c => (
              <div key={c.id} className="p-5 flex items-start gap-4 hover:bg-cloud/50 transition-colors">
                <div className={`w-9 h-9 rounded-lg ${typeBg(c.type)} flex items-center justify-center flex-shrink-0`}>{typeIcon(c.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-ink-navy text-sm">{c.title || c.type?.replace('_', ' ')}</p>
                    <span className="text-xs text-mist-gray">{safeFormatDate(c.created_at)}</span>
                  </div>
                  {c.notes && <p className="text-sm text-slate-gray mt-1 truncate">{c.notes}</p>}
                  {c.meet_url && (
                    <a href={`/dashboard/communications/meetings?join=${c.meet_url}`} className="inline-flex items-center gap-1.5 mt-2 text-xs text-signal-blue font-semibold hover:underline">
                      <Video className="w-3 h-3" /> Join Meeting
                    </a>
                  )}
                </div>
                <span className={`cal-badge text-xs capitalize ${(c.type === 'meet' || c.type === 'jitsi' || c.type === 'video') ? 'bg-blue-50 text-blue-700' : 'bg-pebble text-slate-gray'}`}>{c.type === 'jitsi' ? 'video' : c.type}</span>
              </div>
            ))}
          </div>
        ) : activeTab === "meetings" ? (
          <div className="divide-y divide-hairline">
            {meetings.length === 0 ? (
              <div className="p-12 text-center text-slate-gray"><Video className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No meetings scheduled.</p></div>
            ) : meetings.map(m => (
              <div key={m.id} className="p-5 flex items-start gap-4 hover:bg-cloud/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Video className="w-4 h-4 text-blue-600" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-ink-navy text-sm">{m.title}</p>
                  <p className="text-xs text-mist-gray mt-0.5">{safeFormatDateTime(m.scheduled_at)}</p>
                  {m.notes && <p className="text-sm text-slate-gray mt-1">{m.notes}</p>}
                  {m.meet_url && (
                    <a href={`/dashboard/communications/meetings?join=${m.meet_url}`} className="inline-flex items-center gap-1.5 mt-2 text-xs bg-signal-blue text-white px-3 py-1 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                      <Video className="w-3 h-3" /> Join Meeting
                    </a>
                  )}
                </div>
                <span className="cal-badge bg-blue-50 text-blue-700 text-xs">{m.status || 'scheduled'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-hairline">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-gray"><Bell className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No notifications.</p></div>
            ) : notifications.map(n => (
              <div key={n.id} className={`p-5 flex items-start gap-4 ${!n.read_at ? 'bg-signal-blue/5' : 'hover:bg-cloud/50'} transition-colors`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read_at ? 'bg-signal-blue' : 'bg-mist-gray'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-ink-navy text-sm">{n.subject || n.type}</p>
                  <p className="text-sm text-slate-gray mt-0.5">{n.message}</p>
                  <p className="text-xs text-mist-gray mt-1">{safeFormatDateTime(n.created_at)}</p>
                </div>
                <span className="cal-badge text-xs">{n.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
