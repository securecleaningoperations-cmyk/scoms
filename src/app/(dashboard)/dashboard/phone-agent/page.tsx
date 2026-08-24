"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCallSessions, getCallSession, getCallStats, getCallTranscripts } from "@/lib/services/callSessions";
import { Phone, PhoneIncoming, PhoneOutgoing, Users, Bot, Clock, AlertTriangle, CheckCircle2, ChevronRight, Loader2, X, Mic, FileText, Tag, ArrowUpRight } from "lucide-react";

const CALLER_TYPE_COLORS: Record<string, string> = {
  new_customer: 'bg-blue-100 text-blue-700',
  existing_customer: 'bg-emerald-100 text-emerald-700',
  employee: 'bg-purple-100 text-purple-700',
  applicant: 'bg-amber-100 text-amber-700',
  vendor: 'bg-slate-100 text-slate-600',
  unknown: 'bg-slate-100 text-slate-500',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  'in_progress': 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  abandoned: 'bg-amber-100 text-amber-700',
  transferred: 'bg-purple-100 text-purple-700',
};

export default function PhoneAgentPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const [sess, st] = await Promise.all([
        getCallSessions(100, filterType).catch(e => { console.error(e); return []; }), 
        getCallStats().catch(e => { console.error(e); return null; })
      ]);
      setSessions(sess);
      setStats(st);
    } catch (e: any) {
      console.error(e);
      alert("Error fetching AI Call data: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const openDetail = async (session: any) => {
    setSelectedSession(session);
    setLoadingDetail(true);
    try {
      const [detail, tx] = await Promise.all([
        getCallSession(session.id), 
        getCallTranscripts(session.id).catch(() => [])
      ]);
      setSessionDetail(detail);
      setTranscripts(tx);
    } catch (e: any) {
      console.error(e);
      alert("Error fetching call session details: " + e.message + "\n\n(This might happen if AI Call sub-tables like call_consent_logs are missing from the database)");
    } finally {
      setLoadingDetail(false);
    }
  };

  const fmt = (secs: number | null) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}m ${s}s`;
  };

  const displayed = sessions.filter(s => filterStatus === 'all' || s.status === filterStatus);

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden font-sans">
      {/* Left Panel */}
      <div className="w-[420px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-violet-100 rounded-lg"><Phone className="w-5 h-5 text-violet-600" /></div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">AI Phone Agent</h1>
              <p className="text-xs text-slate-400">Call Intelligence Dashboard</p>
            </div>
          </div>
          {/* Stats mini */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Total', val: stats.total, color: 'text-slate-900' },
                { label: 'Completed', val: stats.completed, color: 'text-emerald-600' },
                { label: 'Escalated', val: stats.escalated, color: 'text-amber-600' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {/* Filters */}
          <div className="flex gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
              <option value="all">All Types</option>
              {['new_customer','existing_customer','employee','applicant','vendor','unknown'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
              <option value="all">All Status</option>
              {['completed','in_progress','abandoned','failed','transferred'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-violet-400" /></div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Phone className="w-9 h-9 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No call sessions found</p>
              <p className="text-xs mt-1">Sessions appear here after Twilio webhooks are configured</p>
            </div>
          ) : displayed.map(s => (
            <button key={s.id} onClick={() => openDetail(s)}
              className={`w-full text-left px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3 ${selectedSession?.id === s.id ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''}`}>
              <div className="mt-0.5 flex-shrink-0">
                {s.direction === 'inbound'
                  ? <PhoneIncoming className="w-4 h-4 text-emerald-500" />
                  : <PhoneOutgoing className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${CALLER_TYPE_COLORS[s.caller_type] ?? 'bg-slate-100 text-slate-500'}`}>
                    {(s.caller_type ?? 'unknown').replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">{s.started_at ? new Date(s.started_at).toLocaleString() : '—'}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">{s.from_number ?? 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_COLORS[s.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {s.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{fmt(s.duration_seconds)}</span>
                  {s.escalated_to_human && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                </div>
                {s.intent && <p className="text-[10px] text-slate-400 mt-0.5 truncate">Intent: {s.intent}</p>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {!selectedSession ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Phone className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">Select a call session</p>
            <p className="text-sm mt-1">View transcripts, extracted entities, and AI summaries</p>
          </div>
        ) : loadingDetail ? (
          <div className="flex justify-center pt-24"><Loader2 className="w-9 h-9 animate-spin text-violet-400" /></div>
        ) : sessionDetail && (
          <div className="p-6 space-y-6 max-w-3xl mx-auto">
            {/* Session Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {sessionDetail.direction === 'inbound'
                      ? <PhoneIncoming className="w-5 h-5 text-emerald-500" />
                      : <PhoneOutgoing className="w-5 h-5 text-blue-500" />}
                    <h2 className="text-xl font-bold text-slate-900">{sessionDetail.from_number}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${CALLER_TYPE_COLORS[sessionDetail.caller_type] ?? 'bg-slate-100 text-slate-500'}`}>
                      {(sessionDetail.caller_type ?? 'unknown').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">Call SID: <span className="font-mono text-xs">{sessionDetail.call_sid ?? 'N/A'}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${STATUS_COLORS[sessionDetail.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {sessionDetail.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Duration', val: fmt(sessionDetail.duration_seconds) },
                  { label: 'Language', val: sessionDetail.language ?? 'en' },
                  { label: 'Workflow', val: sessionDetail.workflow ?? '—' },
                  { label: 'Consent', val: sessionDetail.recording_consent ?? '—' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{m.label}</p>
                    <p className="text-sm font-bold text-slate-900 capitalize">{m.val}</p>
                  </div>
                ))}
              </div>
              {sessionDetail.escalated_to_human && (
                <div className="mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-700">Escalated to human: {sessionDetail.escalation_reason ?? 'No reason recorded'}</p>
                </div>
              )}
            </div>

            {/* AI Summary */}
            {sessionDetail.ai_summary && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-slate-900">AI Summary</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{sessionDetail.ai_summary}</p>
                {sessionDetail.intent && (
                  <div className="mt-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500">Detected Intent:</span>
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">{sessionDetail.intent}</span>
                    {sessionDetail.sentiment && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${sessionDetail.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700' : sessionDetail.sentiment === 'negative' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {sessionDetail.sentiment}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Linked Outcomes */}
            {(sessionDetail.lead_created_id || sessionDetail.ticket_created_id || sessionDetail.applicant_created_id) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">Linked Records Created</h3>
                <div className="flex flex-wrap gap-2">
                  {sessionDetail.lead_created_id && (
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      Lead created <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                  {sessionDetail.ticket_created_id && (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      Support ticket created <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                  {sessionDetail.applicant_created_id && (
                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      Applicant created <ArrowUpRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Extracted Entities */}
            {sessionDetail.call_extracted_entities?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" /> Extracted Entities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sessionDetail.call_extracted_entities.map((e: any) => (
                    <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">{e.entity_type}</p>
                      <p className="text-sm font-semibold text-slate-800">{e.entity_value}</p>
                      {e.confidence && <p className="text-[10px] text-slate-400">{(e.confidence * 100).toFixed(0)}% confidence</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Call Transcript
                <span className="text-xs font-normal text-slate-400">({transcripts.length} messages)</span>
              </h3>
              {transcripts.length === 0 ? (
                <p className="text-sm text-slate-400">No transcript available for this call.</p>
              ) : (
                <div className="space-y-3">
                  {transcripts.map(t => (
                    <div key={t.id} className={`flex gap-3 ${t.speaker === 'ai' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.speaker === 'ai' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.speaker === 'ai' ? 'AI' : 'C'}
                      </div>
                      <div className={`max-w-[75%] rounded-xl p-3 text-sm ${t.speaker === 'ai' ? 'bg-violet-50 text-violet-900' : 'bg-slate-50 text-slate-800'}`}>
                        {t.message}
                        <p className="text-[10px] text-slate-400 mt-1">{t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
