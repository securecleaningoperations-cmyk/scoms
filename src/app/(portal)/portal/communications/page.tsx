"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Video, Calendar, MessageSquare, Phone, User, Clock,
  ArrowRight, ShieldCheck, CheckCircle2, Copy, Check
} from "lucide-react";
import { JitsiMeetViewer } from "@/components/JitsiMeetViewer";

export default function ClientCommunicationsPage() {
  const [activeMeeting, setActiveMeeting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const clientMeeting = {
    title: 'Bi-Weekly Cleaning Quality Inspection & Walkthrough',
    scheduled_at: 'Today at 2:00 PM EST',
    room: 'SCOMS-ClientWalkthrough-MetroCenter',
    lead: 'Marcus Vance, Operations Director',
    leadPhone: '(800) 555-0199 ext. 4',
    leadEmail: 'marcus.v@securecleaningoperations.com'
  };

  const copyRoom = () => {
    navigator.clipboard.writeText(`https://meet.jit.si/${clientMeeting.room}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeMeeting) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              {clientMeeting.title}
            </h2>
            <p className="text-xs text-slate-500">Live with {clientMeeting.lead}</p>
          </div>
          <button
            onClick={() => setActiveMeeting(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            Leave Video Room
          </button>
        </div>
        <div className="h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <JitsiMeetViewer
            roomName={activeMeeting}
            displayName="Commercial Client"
            onMeetingEnd={() => setActiveMeeting(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 font-display">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Client Portal</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Communications & Video Walkthroughs</h1>
          <p className="text-sm text-slate-500 mt-1">Connect directly with your Secure Cleaning Operations management team.</p>
        </div>
        <Link
          href="/portal/appointments"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-sm transition"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Virtual Walkthrough</span>
        </Link>
      </div>

      {/* Hero: Active / Next Video Walkthrough */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Video Meeting Room Ready
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">{clientMeeting.title}</h2>
          <p className="text-sm text-slate-300">
            Meet directly with your facility director to review high-touch surfaces, review electronic inspection logs, or adjust shift scopes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{clientMeeting.scheduled_at}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{clientMeeting.lead}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveMeeting(clientMeeting.room)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/40 transition hover:scale-[1.02]"
            >
              <Video className="w-4 h-4" />
              <span>Join Encrypted Video Call</span>
            </button>
            <button
              onClick={copyRoom}
              className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Room Link' : 'Copy Room Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Assigned Team & Recent Updates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dedicated Support Team */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Dedicated Account Team
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <p className="font-bold text-slate-900 text-sm">Marcus Vance</p>
            <p className="text-xs text-slate-500">Regional Operations Lead</p>
            <div className="text-xs text-slate-600 space-y-1 pt-1 font-mono">
              <p>📞 {clientMeeting.leadPhone}</p>
              <p>✉️ {clientMeeting.leadEmail}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <p className="font-bold text-slate-900 text-sm">24/7 Dispatch Hotline</p>
            <p className="text-xs text-slate-500">Emergency callbacks within 30 minutes</p>
            <p className="text-xs font-mono text-emerald-700 font-bold">📞 1-800-555-SCOMS</p>
          </div>
        </div>

        {/* Message Log */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" /> Communication Timeline
          </h3>
          <div className="space-y-3">
            {[
              {
                title: 'Virtual Walkthrough Confirmed',
                time: 'Yesterday at 4:15 PM',
                desc: 'Meeting link generated for bi-weekly inspection review with Marcus Vance.',
                badge: 'Video Meeting'
              },
              {
                title: 'Monthly Restroom Deep-Sanitization Report Posted',
                time: 'Sept 4, 2026',
                desc: 'Digital ATP swab test results and signed inspection checklist uploaded to your documents repository.',
                badge: 'Report'
              },
              {
                title: 'Special Request Acknowledged: Carpet Extraction',
                time: 'Aug 29, 2026',
                desc: 'Crew scheduled for Saturday 8:00 AM extraction in executive conference room B.',
                badge: 'Operations'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">{item.badge}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.desc}</p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0 font-medium">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
