"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'cleaning_contract', value: '', billing_frequency: 'monthly' });

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contracts').select('*, clients(name)').order('created_at', { ascending: false });
    if (!error && data) setContracts(data);
    else setContracts([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const value = parseFloat(form.value) || 0;
    const payload = {
      contract_number: `CTR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: form.title,
      type: form.type,
      status: 'draft',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      value: value,
      billing_frequency: form.billing_frequency,
      auto_renew: true,
      signed_by_client: false,
      signed_by_company: false,
    };
    const { error } = await supabase.from('contracts').insert([payload]);
    if (!error) {
      fetchContracts();
      setShowModal(false);
      setForm({ title: '', type: 'cleaning_contract', value: '', billing_frequency: 'monthly' });
    }
    setIsAdding(false);
  };

  const statusBadge = (s: string) => ({
    draft: 'bg-pebble text-slate-gray',
    pending_signature: 'bg-amber-50 text-amber-700',
    active: 'bg-emerald-50 text-emerald-700',
    expired: 'bg-red-50 text-red-700',
    terminated: 'bg-pebble text-red-600',
  }[s] || 'bg-pebble text-slate-gray');

  const typeBadge = (t: string) => ({
    cleaning_contract: 'bg-blue-50 text-blue-700',
    master_service: 'bg-purple-50 text-purple-700',
    statement_of_work: 'bg-emerald-50 text-emerald-700',
    amendment: 'bg-amber-50 text-amber-700',
    renewal: 'bg-sky-50 text-sky-700',
  }[t] || 'bg-pebble text-slate-gray');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Contract Management</h1>
          <p className="text-slate-gray font-medium mt-1">Service agreements, MSAs, SOWs & renewals</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Contract
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Contract</th>
                <th className="p-4">Client</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Billing</th>
                <th className="p-4">Term</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-gray"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No contracts yet.</p></td></tr>
              ) : contracts.map(c => (
                <tr key={c.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-semibold text-ink-navy text-sm">{c.title}</p>
                    <p className="text-xs font-mono text-mist-gray mt-0.5">{c.contract_number}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-gray">{c.clients?.name || '—'}</td>
                  <td className="p-4"><span className={`cal-badge text-xs capitalize ${typeBadge(c.type)}`}>{c.type?.replace(/_/g, ' ')}</span></td>
                  <td className="p-4 font-bold font-display text-emerald-600">${(c.value || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-gray capitalize">{c.billing_frequency}</td>
                  <td className="p-4 text-xs text-mist-gray">{c.start_date} → {c.end_date}</td>
                  <td className="p-4 pr-6"><span className={`cal-badge text-xs ${statusBadge(c.status)}`}>{c.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Contract</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Contract Title</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Type</label><select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="cleaning_contract">Cleaning Contract</option><option value="master_service">MSA</option><option value="statement_of_work">SOW</option><option value="amendment">Amendment</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Value ($)</label><input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Billing Frequency</label><select className="w-full border rounded-lg px-3 py-2" value={form.billing_frequency} onChange={e => setForm({...form, billing_frequency: e.target.value})}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
