"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Plus, Loader2, FileText } from "lucide-react";

export default function QualityPage() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ score: '', notes: '', status: 'passed' });

  useEffect(() => { fetchInspections(); }, []);

  const fetchInspections = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('qa_inspections').select('*').order('created_at', { ascending: false });
    if (!error && data) setInspections(data);
    else setInspections([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const payload = {
      inspector_id: "system",
      score: parseFloat(form.score) || 0,
      status: form.status,
      notes: form.notes
    };
    const { error } = await supabase.from('qa_inspections').insert([payload]);
    if (!error) {
      fetchInspections();
      setShowModal(false);
      setForm({ score: '', notes: '', status: 'passed' });
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Quality Control</h1>
          <p className="text-slate-gray font-medium mt-1">Manage inspections and compliance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Inspection
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : inspections.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-gray"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No inspections yet.</p></td></tr>
              ) : inspections.map(i => (
                <tr key={i.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6 font-mono text-sm text-mist-gray">{i.id.slice(0,8)}</td>
                  <td className="p-4 font-bold text-ink-navy">{i.score}%</td>
                  <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-semibold ${i.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{i.status}</span></td>
                  <td className="p-4 text-sm text-slate-gray truncate max-w-[300px]">{i.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">New Quality Inspection</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Score (0-100)</label><input required type="number" min="0" max="100" className="w-full border rounded-lg px-3 py-2" value={form.score} onChange={e => setForm({...form, score: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="passed">Passed</option><option value="failed">Failed</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Notes</label><textarea className="w-full border rounded-lg px-3 py-2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
