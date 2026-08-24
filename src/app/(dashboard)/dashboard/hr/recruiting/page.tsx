"use client";

import { useState, useEffect, useCallback } from "react";
import { getApplicants, updateApplicantStatus, scheduleInterview, getPipelineSummary } from "@/lib/services/hrRecruiting";
import { Users, UserCheck, Phone, Calendar, CheckCircle2, XCircle, Clock, ChevronRight, Loader2, X, Plus, Filter, Bot } from "lucide-react";

const STAGES = ['new','screening','phone_screened','interview_scheduled','interviewed','offer_extended','hired','rejected'] as const;
const STAGE_COLORS: Record<string, string> = {
  new: 'bg-slate-100 text-slate-600',
  screening: 'bg-amber-100 text-amber-700',
  phone_screened: 'bg-blue-100 text-blue-700',
  interview_scheduled: 'bg-indigo-100 text-indigo-700',
  interviewed: 'bg-violet-100 text-violet-700',
  offer_extended: 'bg-orange-100 text-orange-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};
const AI_REC_STYLES: Record<string, string> = {
  proceed: 'text-emerald-600 bg-emerald-50',
  hold: 'text-amber-600 bg-amber-50',
  reject: 'text-red-600 bg-red-50',
  needs_review: 'text-blue-600 bg-blue-50',
};

export default function RecruitingPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', phone: '', position_applied: '', source: 'manual' });
  const [schedForm, setSchedForm] = useState({ interview_type: 'phone', scheduled_at: '', duration_minutes: '30', location_or_link: '', interviewer_id: '' });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [apps, pipe] = await Promise.all([getApplicants(filterStatus), getPipelineSummary()]);
    setApplicants(apps);
    setPipeline(pipe);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !newStatus) return;
    setSaving(true);
    await updateApplicantStatus(selected.id, newStatus, stageNotes || undefined, rejectReason || undefined);
    setSaving(false);
    setShowStatusModal(false);
    setSelected({ ...selected, status: newStatus, stage_notes: stageNotes, rejection_reason: rejectReason });
    fetchAll();
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await scheduleInterview({ applicant_id: selected.id, ...schedForm, duration_minutes: parseInt(schedForm.duration_minutes) });
    setSaving(false);
    setShowSchedule(false);
    setSelected({ ...selected, status: 'interview_scheduled' });
    fetchAll();
  };

  const pipelineMap = pipeline.reduce((acc: Record<string, number>, p: any) => { acc[p.status] = parseInt(p.count); return acc; }, {});
  const totalPipeline = pipeline.reduce((s: number, p: any) => s + parseInt(p.count), 0);

  const handleAddApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { createApplicant } = await import('@/lib/services/hrRecruiting');
    await createApplicant(addForm);
    setSaving(false);
    setShowAddModal(false);
    setAddForm({ first_name: '', last_name: '', email: '', phone: '', position_applied: '', source: 'manual' });
    fetchAll();
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto font-sans bg-slate-50 min-h-full pb-24 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-6 h-6 text-purple-600" /></div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruiting Pipeline</h1>
          </div>
          <p className="text-slate-500 font-medium">AI-assisted applicant management and interview scheduling.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none shadow-sm">
            <option value="all">All Stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={() => setShowAddModal(true)} className="cal-btn-primary flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition">
            <Plus className="w-4 h-4" /> Add Applicant
          </button>
        </div>
      </div>

      {/* Pipeline Stats */}
      {pipeline.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Applicants', val: totalPipeline, color: 'text-slate-900' },
            { label: 'Active Pipeline', val: pipeline.filter((p: any) => !['hired','rejected','archived'].includes(p.status)).reduce((s: number, p: any) => s + parseInt(p.count), 0), color: 'text-blue-600' },
            { label: 'Hired', val: pipelineMap['hired'] ?? 0, color: 'text-emerald-600' },
            { label: 'From AI Phone', val: pipeline.reduce((s: number, p: any) => s + parseInt(p.from_ai_phone ?? 0), 0), color: 'text-violet-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Stage Bar */}
      {pipeline.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Stage Breakdown</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STAGES.filter(s => pipelineMap[s] > 0).map(s => (
              <button key={s} onClick={() => setFilterStatus(s === filterStatus ? 'all' : s)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${filterStatus === s ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <span className={`inline-block px-1.5 py-0.5 rounded ${STAGE_COLORS[s]}`}>{pipelineMap[s]}</span>
                <span className="ml-1.5 text-slate-600">{s.replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Applicants</h2>
        </div>
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
        ) : applicants.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">No applicants yet.</p>
            <p className="text-sm mt-1">Applicants appear when AI phone calls identify job seekers or when manually added.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applicants.map(a => (
              <button key={a.id} onClick={() => setSelected(a)}
                className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4 ${selected?.id === a.id ? 'bg-purple-50' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                  {(a.first_name?.[0] ?? a.email?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-slate-900">{[a.first_name, a.last_name].filter(Boolean).join(' ') || a.email || 'Unknown'}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STAGE_COLORS[a.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {a.status?.replace(/_/g, ' ')}
                    </span>
                    {a.ai_recommendation && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${AI_REC_STYLES[a.ai_recommendation] ?? ''}`}>
                        <Bot className="w-2.5 h-2.5" /> {a.ai_recommendation.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{a.position_applied ?? 'Position N/A'}</span>
                    {a.source && <span className="capitalize">{a.source.replace(/_/g, ' ')}</span>}
                    {a.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.phone}</span>}
                    {a.interview_schedules?.length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600 font-medium"><Calendar className="w-3 h-3" /> Interview scheduled</span>
                    )}
                  </div>
                  {a.stage_notes && <p className="text-xs text-slate-400 mt-0.5 italic truncate">{a.stage_notes}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      {selected && (
        <div className="fixed inset-y-0 right-0 w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-40">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">{[selected.first_name, selected.last_name].filter(Boolean).join(' ') || selected.email}</h3>
            <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Status */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {[
                { label: 'Status', val: selected.status?.replace(/_/g, ' '), style: STAGE_COLORS[selected.status] },
                { label: 'Position', val: selected.position_applied ?? '—' },
                { label: 'Source', val: selected.source?.replace(/_/g, ' ') ?? '—' },
                { label: 'Location Pref', val: selected.location_preference ?? '—' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{r.label}</span>
                  <span className={`font-semibold capitalize ${r.style ? `px-1.5 py-0.5 rounded text-xs ${r.style}` : 'text-slate-900'}`}>{r.val}</span>
                </div>
              ))}
            </div>
            {/* Contact */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {selected.email && <p className="text-sm text-slate-700"><span className="font-semibold text-slate-500">Email:</span> {selected.email}</p>}
              {selected.phone && <p className="text-sm text-slate-700"><span className="font-semibold text-slate-500">Phone:</span> {selected.phone}</p>}
            </div>
            {/* AI Screening */}
            {(selected.ai_recommendation || selected.ai_screening_summary) && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <p className="text-xs font-bold text-indigo-700 mb-2 flex items-center gap-1"><Bot className="w-3.5 h-3.5" /> AI Screening Results</p>
                {selected.ai_recommendation && (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${AI_REC_STYLES[selected.ai_recommendation] ?? ''}`}>
                    {selected.ai_recommendation.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
                {selected.ai_screening_summary && <p className="text-sm text-slate-700 mt-2 leading-relaxed">{selected.ai_screening_summary}</p>}
              </div>
            )}
            {/* Notes */}
            {selected.stage_notes && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1">Stage Notes</p>
                <p className="text-sm text-slate-700">{selected.stage_notes}</p>
              </div>
            )}
            {/* Interviews */}
            {selected.interview_schedules?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Scheduled Interviews</p>
                {selected.interview_schedules.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-slate-700"><Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {i.scheduled_at ? new Date(i.scheduled_at).toLocaleString() : '—'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${i.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {i.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
            <button onClick={() => { setNewStatus(selected.status); setStageNotes(''); setRejectReason(''); setShowStatusModal(true); }}
              className="flex-1 bg-purple-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-purple-700">
              Update Status
            </button>
            <button onClick={() => setShowSchedule(true)}
              className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50 flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Update Applicant Status</h3>
              <button onClick={() => setShowStatusModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                <select required value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {STAGES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stage Notes</label>
                <textarea rows={3} value={stageNotes} onChange={e => setStageNotes(e.target.value)}
                  placeholder="Add context about this status change..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              {newStatus === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rejection Reason</label>
                  <textarea rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowStatusModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Schedule Interview</h3>
              <button onClick={() => setShowSchedule(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
                <select value={schedForm.interview_type} onChange={e => setSchedForm(p => ({ ...p, interview_type: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {['phone','in_person','video','panel'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time <span className="text-red-500">*</span></label>
                <input required type="datetime-local" value={schedForm.scheduled_at} onChange={e => setSchedForm(p => ({ ...p, scheduled_at: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                <input type="number" min="15" value={schedForm.duration_minutes} onChange={e => setSchedForm(p => ({ ...p, duration_minutes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Link</label>
                <input type="text" value={schedForm.location_or_link} onChange={e => setSchedForm(p => ({ ...p, location_or_link: e.target.value }))}
                  placeholder="Office address or video call link"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowSchedule(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Applicant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Add New Applicant</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleAddApplicant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">First Name</label><input required type="text" value={addForm.first_name} onChange={e => setAddForm(p => ({ ...p, first_name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label><input required type="text" value={addForm.last_name} onChange={e => setAddForm(p => ({ ...p, last_name: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input required type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="text" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Position Applied</label><input required type="text" value={addForm.position_applied} onChange={e => setAddForm(p => ({ ...p, position_applied: e.target.value }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
