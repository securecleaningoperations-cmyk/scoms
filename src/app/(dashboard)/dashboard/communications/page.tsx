"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Video, Phone, Mail, Plus, Loader2, Search, Calendar, Bell } from "lucide-react";

export default function CommunicationsPage() {
  const [comms, setComms] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "notifications" | "meetings">("timeline");
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: c }, { data: n }] = await Promise.all([
      supabase.from('communications').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setComms(c || []);
    setNotifications(n || []);
    setLoading(false);
  };

  const handleScheduleMeeting = () => {
    // Redirect to the dedicated meetings page instead of injecting fake data
    window.location.href = "/dashboard/communications/meetings";
  };

  const typeIcon = (t: string) => ({
    meet: <Video className="w-4 h-4 text-blue-500" />,
    jitsi: <Video className="w-4 h-4 text-blue-500" />,
    email: <Mail className="w-4 h-4 text-purple-500" />,
    call: <Phone className="w-4 h-4 text-emerald-500" />,
    meeting: <Calendar className="w-4 h-4 text-amber-500" />,
  }[t] || <MessageSquare className="w-4 h-4 text-slate-gray" />);

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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Communication Center</h1>
          <p className="text-slate-gray font-medium mt-1">Video meetings, emails, calls & notifications</p>
        </div>
        <button onClick={handleScheduleMeeting} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
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
                    <span className="text-xs text-mist-gray">{new Date(c.created_at).toLocaleDateString()}</span>
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
                  <p className="text-xs text-mist-gray mt-0.5">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : 'No date set'}</p>
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
                  <p className="text-xs text-mist-gray mt-1">{new Date(n.created_at).toLocaleString()}</p>
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
