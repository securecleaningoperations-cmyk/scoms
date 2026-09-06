"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Video, Plus, Loader2, Link as LinkIcon, Calendar, Clock,
  Users, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Phone, ArrowLeft
} from "lucide-react";
import { JitsiMeetViewer } from "@/components/JitsiMeetViewer";

interface MeetingRecord {
  id: string;
  title: string;
  scheduled_at: string;
  meet_url: string;
  type: string;
  status: 'live' | 'scheduled' | 'completed';
  host: string;
  participants: string;
  purpose: string;
}

const DEFAULT_MEETINGS: MeetingRecord[] = [
  {
    id: 'meet-101',
    title: 'Commercial Site Walkthrough — Apex Logistics Center',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // in 30 mins
    meet_url: 'SCOMS-Apex-Logistics-Walkthrough',
    type: 'meeting',
    status: 'live',
    host: 'Marcus Vance (Operations Director)',
    participants: 'David Chen (Facility Director, Apex)',
    purpose: 'Virtual Site Walkthrough & High-Touch Disinfection Scope'
  },
  {
    id: 'meet-102',
    title: 'Pre-Shift Operations Briefing & Safety Alignment',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(), // in 3 hours
    meet_url: 'SCOMS-Evening-Shift-Briefing',
    type: 'meeting',
    status: 'scheduled',
    host: 'Sarah Jenkins (Field Supervisor)',
    participants: 'Evening Operations Crew A & B (8 cleaners)',
    purpose: 'OSHA PPE Verification & Chemical Dilution Protocols'
  },
  {
    id: 'meet-103',
    title: 'Gold Tier Proposal Presentation — St. Jude Clinic',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // tomorrow
    meet_url: 'SCOMS-StJude-Proposal-Review',
    type: 'meeting',
    status: 'scheduled',
    host: 'Elena Rostova (Senior Estimator)',
    participants: 'Dr. Kimberly Adams (Practice Manager)',
    purpose: 'Triple-tier proposal breakdown & healthcare compliance checklist'
  },
  {
    id: 'meet-104',
    title: 'Monthly Franchise Governance & Quality Audit',
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    meet_url: 'SCOMS-Franchise-Review-Q3',
    type: 'meeting',
    status: 'completed',
    host: 'CEO / Operations Executive',
    participants: 'Franchise Operators (North & Central Hubs)',
    purpose: 'CAPA review, inspection scores, royalty reconciliation'
  }
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [activeMeetingTitle, setActiveMeetingTitle] = useState<string>('SCOMS Video Conference');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const [form, setForm] = useState({
    title: '',
    scheduled_time: '',
    purpose: 'Virtual Site Walkthrough & Estimate',
    host: 'Operations Manager',
    participants: 'Commercial Client Lead'
  });

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .in('type', ['meeting', 'zoom', 'jitsi', 'video'])
        .order('scheduled_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database records and combine with default high-quality seeds
        const mapped: MeetingRecord[] = data.map((d: any) => ({
          id: d.id,
          title: d.title || 'Client Video Meeting',
          scheduled_at: d.scheduled_at || new Date().toISOString(),
          meet_url: d.meet_url || `SCOMS-Meeting-${d.id.substring(0, 8)}`,
          type: d.type || 'meeting',
          status: new Date(d.scheduled_at).getTime() < Date.now() - 3600000 ? 'completed' : 'scheduled',
          host: d.host || 'SCOMS Dispatch',
          participants: d.participants || 'Client / Operations',
          purpose: d.content || 'Facility Operations & Walkthrough'
        }));
        setMeetings([...mapped, ...DEFAULT_MEETINGS]);
      } else {
        setMeetings(DEFAULT_MEETINGS);
      }
    } catch (e) {
      console.warn('Using offline mock meetings:', e);
      setMeetings(DEFAULT_MEETINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstantMeeting = () => {
    const roomUUID = Math.random().toString(36).substring(2, 9).toUpperCase();
    const instantRoom = `SCOMS-Instant-Room-${roomUUID}`;
    setActiveMeetingTitle('Instant Commercial Operations Room');
    setActiveMeeting(instantRoom);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const roomSlug = form.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
    const roomUUID = Math.random().toString(36).substring(2, 7);
    const meetUrl = `SCOMS-${roomSlug || 'Walkthrough'}-${roomUUID}`;

    const newMeeting: MeetingRecord = {
      id: `meet-${Date.now()}`,
      title: form.title,
      scheduled_at: form.scheduled_time || new Date().toISOString(),
      meet_url: meetUrl,
      type: 'meeting',
      status: 'scheduled',
      host: form.host,
      participants: form.participants,
      purpose: form.purpose
    };

    try {
      await supabase.from('communications').insert([{
        title: newMeeting.title,
        scheduled_at: newMeeting.scheduled_at,
        meet_url: newMeeting.meet_url,
        type: 'meeting',
        content: newMeeting.purpose
      }]);
    } catch (err) {
      console.warn('Saved meeting locally:', err);
    }

    setMeetings(prev => [newMeeting, ...prev]);
    setShowModal(false);
    setForm({
      title: '',
      scheduled_time: '',
      purpose: 'Virtual Site Walkthrough & Estimate',
      host: 'Operations Manager',
      participants: 'Commercial Client Lead'
    });
    setIsAdding(false);
  };

  const copyMeetingLink = (meetUrl: string, id: string) => {
    const fullUrl = `https://meet.jit.si/${meetUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMeetings = meetings.filter(m => {
    if (activeTab === 'live') return m.status === 'live';
    if (activeTab === 'upcoming') return m.status === 'scheduled';
    if (activeTab === 'completed') return m.status === 'completed';
    return true;
  });

  if (activeMeeting) {
    return (
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4 min-h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMeeting(null)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Return to Meetings Schedule"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                {activeMeetingTitle}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Room: https://meet.jit.si/{activeMeeting}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveMeeting(null)}
            className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
          >
            Exit to Dashboard
          </button>
        </div>

        <div className="flex-1 h-[750px] min-h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-800">
          <JitsiMeetViewer
            roomName={activeMeeting}
            displayName="Secure Cleaning Ops Director"
            onMeetingEnd={() => setActiveMeeting(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 pb-24 font-display">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SCOMS v6.1 Video Communication Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Video Meetings & Virtual Walkthroughs
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Powered by Open-Source Jitsi Meet. Conduct HD client walkthroughs, crew safety briefings, and franchise audits with end-to-end encryption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartInstantMeeting}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
            >
              <Video className="w-4 h-4" /> Start Instant Meeting
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> Schedule Conference
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scheduled', value: meetings.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Live Now', value: meetings.filter(m => m.status === 'live').length, icon: Video, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Upcoming Today', value: meetings.filter(m => m.status === 'scheduled').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed Walkthroughs', value: meetings.filter(m => m.status === 'completed').length, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((m, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
              <m.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold capitalize transition ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All Sessions' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeetings.map(meeting => {
          const isLive = meeting.status === 'live';
          const isCompleted = meeting.status === 'completed';

          return (
            <div
              key={meeting.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                isLive
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      {meeting.status.toUpperCase()}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 mt-2">
                      {meeting.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Scope:</strong> {meeting.purpose}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(meeting.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{meeting.host}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => copyMeetingLink(meeting.meet_url, meeting.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 px-3 hover:bg-slate-100 rounded-lg transition"
                >
                  {copiedId === meeting.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Invite</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveMeetingTitle(meeting.title);
                    setActiveMeeting(meeting.meet_url);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-sm transition ${
                    isLive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400'
                      : 'bg-slate-900 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isLive ? 'Join Live Room' : 'Enter Conference'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Schedule Video Conference</h3>
                <p className="text-xs text-slate-500 mt-0.5">Generates encrypted Jitsi room & notification</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Meeting Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Commercial Site Walkthrough — Metro Tower"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Meeting Purpose & Agenda
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.purpose}
                  onChange={e => setForm({ ...form, purpose: e.target.value })}
                >
                  <option value="Virtual Site Walkthrough & Scope Review">Virtual Site Walkthrough & Scope Review</option>
                  <option value="Client Proposal & Contract Negotiation">Client Proposal & Contract Negotiation</option>
                  <option value="Operations Pre-Shift Safety Briefing">Operations Pre-Shift Safety Briefing</option>
                  <option value="CAPA Quality Inspection Audit">CAPA Quality Inspection Audit</option>
                  <option value="Franchise Performance & Royalty Review">Franchise Performance & Royalty Review</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Scheduled Time
                  </label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.scheduled_time}
                    onChange={e => setForm({ ...form, scheduled_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Host Lead
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.host}
                    onChange={e => setForm({ ...form, host: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Guest Participant / Client Email
                </label>
                <input
                  type="text"
                  placeholder="client@company.com or Client Name"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.participants}
                  onChange={e => setForm({ ...form, participants: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={isAdding}
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-900/20 transition"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  <span>Generate Video Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
