"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Video, Plus, Loader2, Link as LinkIcon } from "lucide-react";
import { JitsiMeetViewer } from "@/components/JitsiMeetViewer";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', scheduled_time: '' });

  useEffect(() => { fetchMeetings(); }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .in('type', ['meeting', 'zoom'])
      .order('scheduled_at', { ascending: false });
    
    if (!error && data) {
      setMeetings(data);
    } else {
      console.error(error);
      setMeetings([]);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const roomUUID = Math.random().toString(36).substring(2, 10);
    const meetUrl = `SCOMS-Meeting-${roomUUID}`;

    const newMeeting = {
      title: form.title,
      scheduled_at: form.scheduled_time,
      meet_url: meetUrl,
      type: 'meeting',
      status: 'scheduled'
    };
    
    const { data, error } = await supabase
      .from('communications')
      .insert([newMeeting])
      .select();
      
    if (!error && data) {
      setMeetings(prev => [data[0], ...prev]);
      setShowModal(false);
      setForm({ title: '', scheduled_time: '' });
    } else {
      console.error("Error creating meeting", error);
      alert("Error scheduling meeting: " + (error?.message || "Unknown error"));
    }
    setIsAdding(false);
  };

  if (activeMeeting) {
    const meetLink = `https://meet.jit.si/${activeMeeting}`;
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-50 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center mb-4 bg-white p-4 shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-signal-blue" />
              {activeMeeting}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-500 font-mono">{meetLink}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(meetLink);
                  alert('Meeting link copied to clipboard!');
                }}
                className="text-xs text-signal-blue font-medium hover:underline"
              >
                Copy Link
              </button>
            </div>
          </div>
          <button onClick={() => setActiveMeeting(null)} className="px-6 py-2.5 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            Leave Meeting
          </button>
        </div>
        <div className="flex-1 rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 relative">
          <JitsiMeetViewer roomName={activeMeeting} displayName="SCOMS User" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Video Meetings</h1>
          <p className="text-slate-gray font-medium mt-1">Schedule and join client or team video conferences</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Time</th>
                <th className="p-4">Room / URL</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : meetings.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-gray"><Video className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No upcoming meetings.</p></td></tr>
              ) : meetings.map(m => (
                <tr key={m.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-ink-navy">{m.title}</td>
                  <td className="p-4 text-sm text-slate-gray">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : 'No date set'}</td>
                  <td className="p-4 text-sm font-mono text-mist-gray flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> {m.meet_url}</td>
                  <td className="p-4">
                    <button onClick={() => setActiveMeeting(m.meet_url)} className="px-3 py-1 bg-signal-blue text-white rounded text-xs font-semibold hover:bg-blue-700 transition">Join Now</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Schedule Video Meeting</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Time</label><input required type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
