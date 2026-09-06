"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Plus, Loader2, DollarSign, MapPin, RefreshCw, User, Activity } from "lucide-react";

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'transfers'>('inventory');
  const [assets, setAssets] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const [form, setForm] = useState({ name: '', category: 'equipment', condition: 'good', current_value: '', status: 'available' });
  const [transferForm, setTransferForm] = useState({ receiver_id: '', location: '', notes: '', condition_at_transfer: 'good' });

  useEffect(() => { 
    fetchData(); 
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Employees for Custodian dropdown
    const { data: empData } = await supabase.from('users').select('id, first_name, last_name').eq('role', 'field_employee');
    if (empData) setEmployees(empData);

    if (activeTab === 'inventory') {
      const { data, error } = await supabase.from('assets').select(`
        *,
        custodian:employees(id, users(first_name, last_name))
      `).order('created_at', { ascending: false });
      if (!error && data) setAssets(data);
      else setAssets([]);
    } else {
      const { data, error } = await supabase.from('asset_transfers').select(`
        *,
        asset:assets(name, asset_number),
        sender:employees(id, users(first_name, last_name)),
        receiver:employees(id, users(first_name, last_name))
      `).order('transfer_time', { ascending: false });
      if (!error && data) setTransfers(data);
      else setTransfers([]);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();

    const payload = {
      tenant_id: profile?.tenant_id,
      asset_number: `AST-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      name: form.name,
      category: form.category,
      current_value: parseFloat(form.current_value) || 0,
      condition: form.condition,
      status: form.status,
      purchase_date: new Date().toISOString().split('T')[0]
    };
    
    const { error } = await supabase.from('assets').insert([payload]);
    if (!error) {
      fetchData();
      setShowModal(false);
      setForm({ name: '', category: 'equipment', condition: 'good', current_value: '', status: 'available' });
    } else {
      alert("Error adding asset: " + error.message);
    }
    setIsAdding(false);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setIsAdding(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    // Attempt to find current user's employee record to use as sender
    const { data: empData } = await supabase.from('employees').select('id').eq('user_id', user!.id).single();
    const senderId = empData?.id || null;

    const payload = {
      asset_id: selectedAsset.id,
      sender_id: senderId,
      receiver_id: transferForm.receiver_id || null,
      location: transferForm.location,
      notes: transferForm.notes,
      condition_at_transfer: transferForm.condition_at_transfer,
      status: 'completed'
    };

    const { error: tError } = await supabase.from('asset_transfers').insert([payload]);
    if (!tError) {
      // Update the asset's current custodian and condition
      await supabase.from('assets').update({ 
        custodian_id: transferForm.receiver_id || null,
        condition: transferForm.condition_at_transfer,
        status: transferForm.receiver_id ? 'assigned' : 'available'
      }).eq('id', selectedAsset.id);
      
      fetchData();
      setShowTransferModal(false);
      setSelectedAsset(null);
      setTransferForm({ receiver_id: '', location: '', notes: '', condition_at_transfer: 'good' });
    } else {
      alert("Error transferring asset: " + tError.message);
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Enterprise Asset Management</h1>
          <p className="text-slate-gray font-medium mt-1">Manage fixed assets, inventory, and chain of custody</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('inventory')} className={`pb-3 font-semibold text-sm ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Asset Inventory
        </button>
        <button onClick={() => setActiveTab('transfers')} className={`pb-3 font-semibold text-sm ${activeTab === 'transfers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Chain of Custody
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'inventory' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Code / Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Custodian</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></td></tr>
                ) : assets.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-slate-500"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold text-lg">No assets recorded.</p></td></tr>
                ) : assets.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900">{a.name}</p>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">{a.asset_number || a.asset_code}</p>
                    </td>
                    <td className="p-4 text-slate-600 capitalize">{a.category || 'N/A'}</td>
                    <td className="p-4">
                      {a.custodian?.users ? (
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {a.custodian.users.first_name} {a.custodian.users.last_name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${a.condition === 'excellent' ? 'bg-emerald-100 text-emerald-700' : a.condition === 'poor' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {a.condition || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${a.status === 'available' ? 'bg-blue-100 text-blue-700' : a.status === 'assigned' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <button onClick={() => { setSelectedAsset(a); setShowTransferModal(true); }} className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 flex items-center gap-1.5 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Time</th>
                  <th className="p-4">Asset</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 pr-6">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></td></tr>
                ) : transfers.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-slate-500"><Activity className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold text-lg">No transfers recorded.</p></td></tr>
                ) : transfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-700">{new Date(t.transfer_time).toLocaleString()}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{t.asset?.name || 'Unknown'}</p>
                      <p className="font-mono text-[11px] text-slate-400 mt-0.5">{t.asset?.asset_number}</p>
                    </td>
                    <td className="p-4 text-slate-600">{t.sender?.users ? `${t.sender.users.first_name} ${t.sender.users.last_name}` : 'Warehouse'}</td>
                    <td className="p-4 font-medium text-slate-800">{t.receiver?.users ? `${t.receiver.users.first_name} ${t.receiver.users.last_name}` : 'Warehouse'}</td>
                    <td className="p-4 text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t.location || 'N/A'}</td>
                    <td className="p-4 pr-6 capitalize"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">{t.condition_at_transfer}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">Add Fixed Asset</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Asset Name <span className="text-red-500">*</span></label><input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="equipment">Equipment</option><option value="vehicle">Vehicle</option><option value="electronics">Electronics</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Condition</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Current Value ($)</label><input required type="number" min="0" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={form.current_value} onChange={e => setForm({...form, current_value: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="available">Available</option><option value="in_maintenance">Maintenance</option><option value="retired">Retired</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="cal-btn-primary flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1 font-display">Transfer Asset Custody</h3>
            <p className="text-sm text-slate-500 mb-5">Asset: <span className="font-semibold text-slate-800">{selectedAsset.name} ({selectedAsset.asset_number})</span></p>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Custodian (Employee)</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={transferForm.receiver_id} onChange={e => setTransferForm({...transferForm, receiver_id: e.target.value})}>
                  <option value="">Warehouse / Unassigned</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Location</label>
                <input required type="text" placeholder="e.g. Headquarters / Client Site A" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={transferForm.location} onChange={e => setTransferForm({...transferForm, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition at Transfer</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={transferForm.condition_at_transfer} onChange={e => setTransferForm({...transferForm, condition_at_transfer: e.target.value})}>
                  <option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="broken">Broken</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-y" value={transferForm.notes} onChange={e => setTransferForm({...transferForm, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowTransferModal(false); setSelectedAsset(null); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="cal-btn-primary flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
