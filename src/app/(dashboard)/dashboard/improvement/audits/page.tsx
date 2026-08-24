"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ClipboardCheck, Plus, Loader2, FileText, AlertTriangle } from "lucide-react";

export default function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', score: '', location: '' });

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
    if (!error && data) setAudits(data);
    else setAudits([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const score = parseFloat(form.score) || 0;
    let status = 'passed';
    if (score < 75) status = 'failed';
    else if (score < 90) status = 'action_required';

    const payload = {
      audit_number: `AUD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      title: form.title,
      score: score,
      location: form.location,
      status: status
    };
    
    const { error } = await supabase.from('audits').insert([payload]);
    if (!error) {
      fetchAudits();
      setShowModal(false);
      setForm({ title: '', score: '', location: '' });
    }
    setIsAdding(false);
  };

  const statusBadge = (s: string) => ({
    passed: 'bg-emerald-100 text-emerald-700',
    action_required: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  }[s] || 'bg-slate-100 text-slate-700');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Audit Management</h1>
          <p className="text-slate-gray font-medium mt-1">Track compliance and facility audits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Audit
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Audit # / Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : audits.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-gray"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No audits logged yet.</p></td></tr>
              ) : audits.map(a => (
                <tr key={a.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-ink-navy">{a.title}</p>
                    <p className="font-mono text-xs text-mist-gray">{a.audit_number}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-gray">{a.location}</td>
                  <td className="p-4 font-bold text-emerald-600">{a.score}%</td>
                  <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge(a.status)}`}>{a.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Log New Audit</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Score (0-100)</label>
                <input required type="number" min="0" max="100" className="w-full border rounded-lg px-3 py-2" value={form.score} onChange={e => setForm({...form, score: e.target.value})} />
                <p className="text-xs text-slate-500 mt-1">Status will be automatically assigned based on the score.</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
