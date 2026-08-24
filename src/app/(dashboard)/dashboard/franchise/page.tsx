"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Plus, Loader2, FileText, MapPin, User, DollarSign } from "lucide-react";

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', owner_name: '', address: '', phone: '', email: '', revenue_share: '' });

  useEffect(() => { fetchFranchises(); }, []);

  const fetchFranchises = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('franchise_locations').select('*').order('created_at', { ascending: false });
    if (!error && data) setFranchises(data);
    else setFranchises([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const payload = {
      name: form.name,
      franchise_code: `FRN-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
      owner_name: form.owner_name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      revenue_share: parseFloat(form.revenue_share) || 10.0,
      status: 'active'
    };
    const { error } = await supabase.from('franchise_locations').insert([payload]);
    if (!error) {
      fetchFranchises();
      setShowModal(false);
      setForm({ name: '', owner_name: '', address: '', phone: '', email: '', revenue_share: '' });
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Franchise Network</h1>
          <p className="text-slate-gray font-medium mt-1">Manage locations and owners</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Franchise
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Code / Name</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rev Share</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : franchises.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-gray"><Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No franchises yet.</p></td></tr>
              ) : franchises.map(f => (
                <tr key={f.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-ink-navy">{f.name}</p>
                    <p className="font-mono text-xs text-mist-gray">{f.franchise_code}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-gray flex items-center gap-2"><User className="w-3.5 h-3.5" /> {f.owner_name}</td>
                  <td className="p-4 text-sm text-slate-gray"><div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> <span className="truncate max-w-[200px]">{f.address}</span></div></td>
                  <td className="p-4 font-bold text-emerald-600 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {f.revenue_share}%</td>
                  <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-semibold ${f.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">New Franchise Location</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Franchise Name</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.owner_name} onChange={e => setForm({...form, owner_name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input required type="tel" className="w-full border rounded-lg px-3 py-2" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input required type="email" className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Revenue Share (%)</label><input required type="number" step="0.1" className="w-full border rounded-lg px-3 py-2" value={form.revenue_share} onChange={e => setForm({...form, revenue_share: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Franchise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
