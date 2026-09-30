"use client";

import React, { useState, useEffect, Suspense, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import {
  Video, Plus, Loader2, Link as LinkIcon, Calendar, Clock,
  Users, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Phone, ArrowLeft, Radio,
  Edit3, Trash2, ExternalLink, ShieldCheck, Search, Share2, VideoOff, Mic, MicOff,
  Monitor, Settings, HelpCircle, Layers, CheckSquare, MessageSquare, Download, Save, PhoneOff
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
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

// Resilient default meetings if database is offline or empty
const DEFAULT_MEETINGS: MeetingRecord[] = [
  {
    id: 'meet-seed-1',
    title: 'Commercial Site Walkthrough & Scope Review — Apex Logistics',
    scheduled_at: new Date(Date.now() + 3600000 * 2).toISOString(),
    meet_url: 'SCOMS-Apex-Logistics-Walkthrough',
    type: 'meeting',
    status: 'scheduled',
    host: 'Marcus Vance (Field Lead)',
    participants: 'David Chen (Facility Director), Operations Lead',
    purpose: 'Review high-touch surface sanitization scope, cleanroom certification, and emergency callback protocol.'
  },
  {
    id: 'meet-seed-2',
    title: 'Pre-Shift Chemical Safety & Biohazard Standards Briefing',
    scheduled_at: new Date(Date.now() - 1800000).toISOString(),
    meet_url: 'SCOMS-Daily-Safety-Sync',
    type: 'meeting',
    status: 'live',
    host: 'Elena Rostova (Compliance Inspector)',
    participants: 'All Shift Technicians & Cleaning Crew Leads',
    purpose: 'OSHA 1910 alignment, quaternary disinfectant contact times, and PPE compliance checklist.'
  },
  {
    id: 'meet-seed-3',
    title: 'Bi-Weekly Commercial Inspection Review — Metro Tech Center',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    meet_url: 'SCOMS-Metro-Tech-Inspection',
    type: 'meeting',
    status: 'scheduled',
    host: 'Sarah Jenkins (Operations Manager)',
    participants: 'Property Management Team & Lead Supervisor',
    purpose: 'ATP surface swab results, floor scrub cycle schedule, and quarterly consumables audit.'
  },
  {
    id: 'meet-seed-4',
    title: 'Executive Platform & Operations Leadership Sync',
    scheduled_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    meet_url: 'SCOMS-Executive-Leadership-Sync',
    type: 'meeting',
    status: 'completed',
    host: 'David Vance (Super Admin)',
    participants: 'Franchise Directors & Operations Heads',
    purpose: 'Review Q1 SLA uptime, labor gross margins, and enterprise customer expansion roadmap.'
  }
];

// Helper: safe date formatting that NEVER throws RangeError
function safeFormatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "Scheduled";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Scheduled";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Scheduled";
  }
}

function safeFormatDate(dateStr?: string | null): string {
  if (!dateStr) return "Scheduled";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Scheduled";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return "Scheduled";
  }
}

// Error Boundary Wrapper
class MeetingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Meeting component error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto my-12 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Video className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Meeting Room Console</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            A temporary session issue was caught. You can reset the meeting console safely below.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition shadow-md"
            >
              Reload Console
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MeetingsPage() {
  return (
    <MeetingErrorBoundary>
      <Suspense
        fallback={
          <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Loading SCOMS Meeting Center...</p>
          </div>
        }
      >
        <MeetingsComponent />
      </Suspense>
    </MeetingErrorBoundary>
  );
}

function MeetingsComponent() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRecord | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [activeMeetingTitle, setActiveMeetingTitle] = useState<string>('SCOMS Video Conference');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [joinInputCode, setJoinInputCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    title: '',
    scheduled_time: '',
    purpose: 'Virtual Site Walkthrough & Scope Review',
    host: 'Operations Manager',
    participants: 'Commercial Client / Staff'
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  // Load meetings from Supabase with safe localStorage fallback
  useEffect(() => {
    fetchMeetings();
  }, []);

  // Handle URL join parameter safely without infinite loops
  useEffect(() => {
    if (!searchParams) return;
    const joinParam = searchParams.get('join');
    if (joinParam && !activeMeeting) {
      setActiveMeeting(joinParam);
      setActiveMeetingTitle('SCOMS Live Video Conference');
    }
  }, [searchParams]);

  const fetchMeetings = async () => {
    setLoading(true);
    let loadedList: MeetingRecord[] = [];

    // Check localStorage cache first for fast display
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('scoms_meetings_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedList = parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read cached meetings:', e);
      }
    }

    // Attempt to fetch from Supabase
    try {
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .in('type', ['meeting', 'zoom', 'jitsi', 'video'])
        .order('scheduled_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MeetingRecord[] = data.map((d: any) => {
          const safeId = String(d.id || `meet-${Math.random()}`);
          const safeTime = d.scheduled_at || d.created_at || new Date().toISOString();
          let meetingStatus: 'live' | 'scheduled' | 'completed' = 'scheduled';

          try {
            const timeDiff = Date.now() - new Date(safeTime).getTime();
            if (timeDiff > 7200000) {
              meetingStatus = 'completed';
            } else if (timeDiff >= -900000 && timeDiff <= 3600000) {
              meetingStatus = 'live';
            } else {
              meetingStatus = 'scheduled';
            }
          } catch {
            meetingStatus = 'scheduled';
          }

          return {
            id: safeId,
            title: d.title || 'Commercial Video Meeting',
            scheduled_at: safeTime,
            meet_url: d.meet_url || d.zoom_join_url || `SCOMS-Meeting-${safeId.substring(0, 8)}`,
            type: d.type || 'meeting',
            status: meetingStatus,
            host: d.host || 'SCOMS Dispatch Lead',
            participants: typeof d.participants === 'string' ? d.participants : 'Operations Team & Client',
            purpose: d.notes || d.content || 'Facility Operations & Walkthrough Review'
          };
        });

        // Merge with defaults if few
        if (mapped.length > 0) {
          loadedList = mapped;
        }
      }
    } catch (err) {
      console.warn('Using local meetings data fallback:', err);
    }

    if (loadedList.length === 0) {
      loadedList = DEFAULT_MEETINGS;
    }

    setMeetings(loadedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('scoms_meetings_cache', JSON.stringify(loadedList));
      } catch {}
    }
    setLoading(false);
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

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputCode.trim()) return;
    let room = joinInputCode.trim();
    // Support pasting full URL like https://meet.jit.si/SCOMS-Room-123
    if (room.includes('meet.jit.si/')) {
      room = room.split('meet.jit.si/')[1].split('?')[0].split('#')[0];
    }
    setActiveMeetingTitle(`SCOMS Conference (${room})`);
    setActiveMeeting(room);
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
    let timeVal = '';
    try {
      if (meeting.scheduled_at) {
        timeVal = new Date(meeting.scheduled_at).toISOString().slice(0, 16);
      }
    } catch {}
    setForm({
      title: meeting.title,
      scheduled_time: timeVal,
      purpose: meeting.purpose,
      host: meeting.host,
      participants: meeting.participants
    });
    setShowModal(true);
  };

  const handleDeleteMeeting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this scheduled meeting?')) return;
    const updated = meetings.filter(m => m.id !== id);
    setMeetings(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('scoms_meetings_cache', JSON.stringify(updated));
      } catch {}
    }
    try {
      await supabase.from('communications').delete().eq('id', id);
    } catch (err) {
      console.warn('Deleted meeting locally:', err);
    }
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    if (editingMeeting) {
      const updatedMeeting: MeetingRecord = {
        ...editingMeeting,
        title: form.title,
        scheduled_at: form.scheduled_time || editingMeeting.scheduled_at,
        host: form.host,
        participants: form.participants,
        purpose: form.purpose
      };
      const updatedList = meetings.map(m => m.id === editingMeeting.id ? updatedMeeting : m);
      setMeetings(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('scoms_meetings_cache', JSON.stringify(updatedList));
      }

      try {
        await supabase.from('communications').update({
          title: updatedMeeting.title,
          scheduled_at: updatedMeeting.scheduled_at,
          notes: updatedMeeting.purpose
        }).eq('id', editingMeeting.id);
      } catch (err) {
        console.warn('Updated meeting in cache:', err);
      }
    } else {
      const roomSlug = form.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
      const roomUUID = Math.random().toString(36).substring(2, 7).toUpperCase();
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

      const updatedList = [newMeeting, ...meetings];
      setMeetings(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('scoms_meetings_cache', JSON.stringify(updatedList));
      }

      try {
        await supabase.from('communications').insert([{
          title: newMeeting.title,
          scheduled_at: newMeeting.scheduled_at,
          zoom_join_url: newMeeting.meet_url,
          type: 'meeting',
          notes: newMeeting.purpose
        }]);
      } catch (err) {
        console.warn('Saved meeting in local cache:', err);
      }
    }

    setShowModal(false);
    setIsAdding(false);
  };

  const copyMeetingLink = (meetUrl: string, id: string) => {
    const fullUrl = `https://meet.jit.si/${meetUrl}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.title.toLowerCase().includes(q) ||
        m.host.toLowerCase().includes(q) ||
        m.participants.toLowerCase().includes(q) ||
        m.purpose.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeTab === 'live') return m.status === 'live';
    if (activeTab === 'upcoming') return m.status === 'scheduled';
    if (activeTab === 'completed') return m.status === 'completed';
    return true;
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // FULL SCREEN ACTIVE MEETING STAGE (Teams / Jitsi Meet Experience)
  // ═════════════════════════════════════════════════════════════════════════════
  if (activeMeeting) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col w-screen h-screen overflow-hidden">
        {/* Teams-Style Top Bar */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActiveMeeting(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition flex items-center gap-2 text-xs font-bold shrink-0"
              title="Return to Meetings Schedule"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave & Return</span>
            </button>
            <div className="h-4 w-px bg-slate-800 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {activeMeetingTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => copyMeetingLink(activeMeeting, 'active-room')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
            >
              {copiedId === 'active-room' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copy Invite Link</span>
                </>
              )}
            </button>
            <button
              onClick={() => setActiveMeeting(null)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-rose-950/30 flex items-center gap-1.5"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Embedded High-Quality Jitsi Video Conference */}
        <div className="flex-1 w-full h-[calc(100vh-56px)] relative overflow-hidden bg-black">
          <JitsiMeetViewer
            roomName={activeMeeting}
            displayName="SCOMS Operations Member"
            onMeetingEnd={() => setActiveMeeting(null)}
          />
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // DASHBOARD MEETING CONSOLE
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 pb-24">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SCOMS Enterprise Video Hall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Video Meetings & Virtual Walkthroughs
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Encrypted enterprise video platform for operations syncs, facility safety briefings, and live client walkthroughs. Join with one click or schedule upcoming meetings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleJoinAllHands}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition hover:scale-[1.02]"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Join All-Hands Hall</span>
            </button>

            <button
              onClick={handleStartInstantMeeting}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-950/40 transition hover:scale-[1.02]"
            >
              <Video className="w-4 h-4" />
              <span>Meet Now (Instant)</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs sm:text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Join by Meeting Code / URL Bar & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Join by Code Form */}
        <form onSubmit={handleJoinByCode} className="w-full md:w-auto flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter meeting room code or Jitsi link to join..."
              value={joinInputCode}
              onChange={e => setJoinInputCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!joinInputCode.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl transition"
          >
            Join Room
          </button>
        </form>

        {/* Search Bar */}
        <div className="w-full md:w-72 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meetings or staff..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className={`p-3 rounded-xl ${m.bg} ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{m.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          {(['all', 'live', 'upcoming', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'all' ? 'All Sessions' : tab}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Showing {filteredMeetings.length} of {meetings.length} sessions
        </p>
      </div>

      {/* Meetings Schedule Cards */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-xs text-slate-500 font-semibold mt-2">Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No meetings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no meetings matching your filter. Start an instant room or schedule a new meeting walkthrough.
          </p>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition shadow-xs"
          >
            Schedule a Meeting
          </button>
        </div>
      ) : (
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
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
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-snug">
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

                  <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    <strong className="text-slate-800 font-bold">Objectives: </strong>
                    {meeting.purpose}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{safeFormatDateTime(meeting.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{meeting.host}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => copyMeetingLink(meeting.meet_url, meeting.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 px-3 hover:bg-slate-100 rounded-xl transition"
                  >
                    {copiedId === meeting.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveMeetingTitle(meeting.title);
                      setActiveMeeting(meeting.meet_url);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition ${
                      isLive
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20'
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
      )}

      {/* Schedule / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingMeeting ? 'Edit Video Conference' : 'Schedule Video Conference'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted video meeting room with calendar link</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Meeting Purpose & Objectives
                </label>
                <select
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
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
