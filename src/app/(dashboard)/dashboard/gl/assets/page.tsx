"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Loader2, DollarSign, MapPin } from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', value: '', status: 'active' });

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (!error && data) setAssets(data);
    else setAssets([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const payload = {
      asset_code: `AST-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      name: form.name,
      location: form.location,
      value: parseFloat(form.value) || 0,
      status: form.status,
      purchase_date: new Date().toISOString().split('T')[0]
    };
    const { error } = await supabase.from('assets').insert([payload]);
    if (!error) {
      fetchAssets();
      setShowModal(false);
      setForm({ name: '', location: '', value: '', status: 'active' });
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Fixed Assets</h1>
          <p className="text-slate-gray font-medium mt-1">Manage equipment, vehicles, and facilities</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Code / Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Value</th>
                <th className="p-4">Purchase Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-gray"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No assets recorded.</p></td></tr>
              ) : assets.map(a => (
                <tr key={a.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-ink-navy">{a.name}</p>
                    <p className="font-mono text-xs text-mist-gray">{a.asset_code}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-gray flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {a.location}</td>
                  <td className="p-4 font-bold text-emerald-600 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {(a.value || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-gray">{a.purchase_date}</td>
                  <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-semibold ${a.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add Fixed Asset</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Value ($)</label><input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
