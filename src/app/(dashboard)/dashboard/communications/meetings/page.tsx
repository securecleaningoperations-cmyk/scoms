"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Video, Plus, Loader2, Link as LinkIcon, Calendar, Clock,
  Users, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Phone, ArrowLeft, Radio,
  Edit3, Trash2
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
    id: 'meet-all-hands',
    title: '🏢 SCOMS Company-Wide All-Hands Hall (Open to All Roles)',
    scheduled_at: new Date().toISOString(),
    meet_url: 'SCOMS-All-Hands-Company-Wide',
    type: 'meeting',
    status: 'live',
    host: 'Corporate Leadership & Executive Operations',
    participants: 'Super Admins, Field Cleaners, Franchisees, & Clients',
    purpose: 'Permanent company-wide virtual auditorium for all-hands operations, shift sync, and training'
  },
  {
    id: 'meet-101',
    title: 'Commercial Site Walkthrough — Apex Logistics Center',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    meet_url: 'SCOMS-Apex-Logistics-Walkthrough',
    type: 'meeting',
    status: 'live',
    host: 'Marcus Vance (Operations Director)',
    participants: 'David Chen (Facility Director, Apex)',
    purpose: 'Virtual Site Walkthrough & High-Touch Disinfection Scope Review'
  },
  {
    id: 'meet-102',
    title: 'Pre-Shift Operations Briefing & Safety Alignment',
    scheduled_at: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
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
    scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
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
    scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    meet_url: 'SCOMS-Franchise-Review-Q3',
    type: 'meeting',
    status: 'completed',
    host: 'Executive Franchise Director',
    participants: 'Dallas, Phoenix, and Atlanta Franchise Operators',
    purpose: 'CAPA quality review, inspection scores, and royalty reconciliation'
  }
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRecord | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [activeMeetingTitle, setActiveMeetingTitle] = useState<string>('SCOMS Video Conference');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const [form, setForm] = useState({
    title: '',
    scheduled_time: '',
    purpose: 'Virtual Site Walkthrough & Scope Review',
    host: 'Operations Manager',
    participants: 'Commercial Client / Staff'
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
        setMeetings([...DEFAULT_MEETINGS.slice(0, 1), ...mapped, ...DEFAULT_MEETINGS.slice(1)]);
      } else {
        setMeetings(DEFAULT_MEETINGS);
      }
    } catch {
      setMeetings(DEFAULT_MEETINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAllHands = () => {
    setActiveMeetingTitle('SCOMS Company-Wide All-Hands Video Hall');
    setActiveMeeting('SCOMS-All-Hands-Company-Wide');
  };

  const handleStartInstantMeeting = () => {
    const roomUUID = Math.random().toString(36).substring(2, 8).toUpperCase();
    const instantRoom = `SCOMS-Operations-Room-${roomUUID}`;
    setActiveMeetingTitle('Instant Operations Video Room');
    setActiveMeeting(instantRoom);
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setForm({
      title: '',
      scheduled_time: '',
      purpose: 'Virtual Site Walkthrough & Scope Review',
      host: 'Operations Manager',
      participants: 'Commercial Client / Staff'
    });
    setShowModal(true);
  };

  const openEditModal = (meeting: MeetingRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setForm({
      title: meeting.title,
      scheduled_time: meeting.scheduled_at ? new Date(meeting.scheduled_at).toISOString().slice(0, 16) : '',
      purpose: meeting.purpose,
      host: meeting.host,
      participants: meeting.participants
    });
    setShowModal(true);
  };

  const handleDeleteMeeting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this scheduled meeting?')) return;
    setMeetings(prev => prev.filter(m => m.id !== id));
    try {
      await supabase.from('communications').delete().eq('id', id);
    } catch (err) {
      console.warn('Saved meeting deletion locally:', err);
    }
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    if (editingMeeting) {
      const updated: MeetingRecord = {
        ...editingMeeting,
        title: form.title,
        scheduled_at: form.scheduled_time || editingMeeting.scheduled_at,
        host: form.host,
        participants: form.participants,
        purpose: form.purpose
      };
      setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? updated : m));
      try {
        await supabase.from('communications').update({
          title: updated.title,
          scheduled_at: updated.scheduled_at,
          content: updated.purpose
        }).eq('id', editingMeeting.id);
      } catch (err) {
        console.warn('Updated meeting locally:', err);
      }
    } else {
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
    }

    setShowModal(false);
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

  // Full Screen Meeting Mode: Fixes Screenshot 2 squashed layout completely!
  if (activeMeeting) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col w-screen h-screen overflow-hidden">
        {/* Meeting Header Bar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMeeting(null)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="Return to Meetings Schedule"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                <span>{activeMeetingTitle}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs font-mono text-slate-400">
              https://meet.jit.si/{activeMeeting}
            </span>
            <button
              onClick={() => copyMeetingLink(activeMeeting, 'active-room')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition"
            >
              {copiedId === 'active-room' ? 'Copied Link!' : 'Copy Invite Link'}
            </button>
            <button
              onClick={() => setActiveMeeting(null)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Full-Height Jitsi Meeting Component */}
        <div className="flex-1 w-full h-[calc(100vh-56px)] relative overflow-hidden bg-black">
          <JitsiMeetViewer
            roomName={activeMeeting}
            displayName="SCOMS Team Member"
            onMeetingEnd={() => setActiveMeeting(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto space-y-8 pb-24 font-display">
      {/* Permanent Company-Wide All-Hands Room Hero Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Permanent All-Hands Hall Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              SCOMS Company-Wide All-Hands Video Hall
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Open to all corporate executives, operations managers, field cleaning staff, franchise owners, and clients. Join with 1 click anytime for daily operational syncs, safety briefings, or client reviews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleJoinAllHands}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Join Company All-Hands</span>
            </button>

            <button
              onClick={handleStartInstantMeeting}
              className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg transition"
            >
              <Video className="w-4 h-4" />
              <span>Start Instant Room</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl font-bold text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scheduled', value: meetings.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Live Rooms', value: meetings.filter(m => m.status === 'live').length, icon: Video, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition ${
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
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                isLive
                  ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isLive
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isLive && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      {meeting.status.toUpperCase()}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                      {meeting.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => openEditModal(meeting, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Meeting Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMeeting(meeting.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Scheduled Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Scope & Objectives:</strong> {meeting.purpose}
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
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 px-3 hover:bg-slate-100 rounded-xl transition"
                >
                  {copiedId === meeting.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Invite Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveMeetingTitle(meeting.title);
                    setActiveMeeting(meeting.meet_url);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition ${
                    isLive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                      : 'bg-slate-900 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isLive ? 'Join Room Now' : 'Enter Conference'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule / Edit Conference Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingMeeting ? 'Edit Video Conference' : 'Schedule Video Conference'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted Jitsi room with calendar invite</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4 pt-4">
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
                  Meeting Purpose & Objectives
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
                  <span>{editingMeeting ? 'Save Changes' : 'Generate Video Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
