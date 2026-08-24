"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { addPayrollRunAction } from "@/app/actions";
import { DollarSign, Plus, Loader2, Clock, TrendingUp, X } from "lucide-react";

export default function PayrollPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    pay_period_start: '',
    pay_period_end: '',
    total_gross: '',
    total_deductions: '',
  });

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('payroll_runs').select('*').order('created_at', { ascending: false });
    if (!error && data) setRuns(data);
    else setRuns([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const gross = parseFloat(form.total_gross) || 0;
    const deductions = parseFloat(form.total_deductions) || 0;
    const payload = {
      pay_period_start: form.pay_period_start,
      pay_period_end: form.pay_period_end,
      status: 'draft',
      total_gross: gross,
      total_deductions: deductions,
      total_net: gross - deductions,
    };
    const result = await addPayrollRunAction(payload);
    if (result.success) {
      setShowModal(false);
      setForm({ pay_period_start: '', pay_period_end: '', total_gross: '', total_deductions: '' });
      fetchRuns();
    } else {
      alert('Failed: ' + result.error);
    }
    setIsAdding(false);
  };

  const handleSubmitForApproval = async (runId: string) => {
    await supabase.from('payroll_runs').update({ status: 'pending_approval' }).eq('id', runId);
    fetchRuns();
  };

  const handleApprove = async (runId: string) => {
    await supabase.from('payroll_runs').update({ status: 'paid' }).eq('id', runId);
    fetchRuns();
  };

  const totalGross = runs.reduce((s, r) => s + (r.total_gross || 0), 0);
  const totalNet = runs.reduce((s, r) => s + (r.total_net || 0), 0);

  const statusBadge = (s: string) => ({
    draft: 'bg-pebble text-slate-gray',
    pending_approval: 'bg-amber-50 text-amber-700',
    approved: 'bg-blue-50 text-blue-700',
    paid: 'bg-emerald-50 text-emerald-700',
  }[s] || 'bg-pebble text-slate-gray');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Payroll System</h1>
          <p className="text-slate-gray font-medium mt-1">Batch payroll runs with supervisor approval workflow</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm">
          <Plus className="w-4 h-4" /> New Pay Run
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Runs", value: runs.length, icon: DollarSign },
          { label: "Total Gross", value: `$${(totalGross / 1000).toFixed(0)}k`, icon: TrendingUp },
          { label: "Total Net", value: `$${(totalNet / 1000).toFixed(0)}k`, icon: DollarSign },
          { label: "Pending Approval", value: runs.filter(r => r.status === 'pending_approval').length, icon: Clock },
        ].map(m => (
          <div key={m.label} className="cal-card p-6">
            <m.icon className="w-5 h-5 text-signal-blue mb-3" />
            <p className="text-sm text-slate-gray">{m.label}</p>
            <p className="text-3xl font-bold text-ink-navy font-display mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="p-5 border-b border-hairline bg-paper"><h2 className="font-bold text-ink-navy font-display">Pay Run History</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Period</th>
                <th className="p-4">Gross Pay</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Pay</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-gray"><DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No payroll runs yet.</p></td></tr>
              ) : runs.map(r => (
                <tr key={r.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="text-sm font-semibold text-ink-navy">{r.pay_period_start} → {r.pay_period_end}</p>
                  </td>
                  <td className="p-4 font-semibold font-display text-ink-navy">${(r.total_gross || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm text-red-500">-${(r.total_deductions || 0).toLocaleString()}</td>
                  <td className="p-4 font-bold font-display text-emerald-600">${(r.total_net || 0).toLocaleString()}</td>
                  <td className="p-4"><span className={`cal-badge text-xs ${statusBadge(r.status)}`}>{r.status?.replace('_', ' ')}</span></td>
                  <td className="p-4 pr-6">
                    {r.status === 'draft' && (
                      <button onClick={() => handleSubmitForApproval(r.id)} className="text-xs text-blue-600 font-semibold hover:underline">Submit for Approval</button>
                    )}
                    {r.status === 'pending_approval' && (
                      <button onClick={() => handleApprove(r.id)} className="text-xs text-emerald-600 font-semibold hover:underline">Approve & Mark Paid</button>
                    )}
                    {r.status === 'paid' && (
                      <span className="text-xs text-emerald-600 font-semibold">✓ Paid</span>
                    )}
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Payroll Run</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Period Start *</label><input required type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.pay_period_start} onChange={e => setForm({...form, pay_period_start: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Period End *</label><input required type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2" value={form.pay_period_end} onChange={e => setForm({...form, pay_period_end: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Gross ($) *</label><input required type="number" min="0" step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. 45000" value={form.total_gross} onChange={e => setForm({...form, total_gross: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Deductions ($)</label><input type="number" min="0" step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2" placeholder="e.g. 11250" value={form.total_deductions} onChange={e => setForm({...form, total_deductions: e.target.value})} /></div>
              {form.total_gross && (
                <div className="p-3 bg-emerald-50 rounded-xl text-sm text-emerald-800 font-semibold">
                  Net Pay: ${((parseFloat(form.total_gross)||0) - (parseFloat(form.total_deductions)||0)).toLocaleString()}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Pay Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
