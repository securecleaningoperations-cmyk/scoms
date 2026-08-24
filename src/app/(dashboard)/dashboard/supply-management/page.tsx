'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Package, Plus, Search, Loader2, X, AlertCircle, Save,
  CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Filter
} from 'lucide-react';

interface SupplyRequest {
  id: string;
  request_number: string | null;
  item_name: string;
  quantity: number;
  unit: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  location_note: string | null;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  ordered: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const STATUS_FLOW: Record<string, string> = {
  pending: 'approved',
  approved: 'ordered',
  ordered: 'delivered',
};

export default function SupplyManagementPage() {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ item_name: '', quantity: '1', unit: '', priority: 'normal', location_note: '', notes: '' });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('supply_requests').select('*').order('created_at', { ascending: false });
      if (filterStatus !== 'all') q = q.eq('status', filterStatus);
      if (filterPriority !== 'all') q = q.eq('priority', filterPriority);
      const { data, error: err } = await q;
      if (err) throw err;
      setRequests(data ?? []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [filterStatus, filterPriority]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item_name.trim()) return;
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      const { data: emp } = await supabase.from('employees').select('id').eq('user_id', user!.id).single();
      const reqNum = `SR-${Date.now().toString().slice(-6)}`;
      const { error: err } = await supabase.from('supply_requests').insert({
        item_name: form.item_name.trim(),
        quantity: parseInt(form.quantity) || 1,
        unit: form.unit || null,
        priority: form.priority,
        location_note: form.location_note || null,
        notes: form.notes || null,
        status: 'pending',
        request_number: reqNum,
        requested_by: emp?.id ?? null,
        tenant_id: profile?.tenant_id,
      });
      if (err) throw err;
      setShowCreate(false);
      setForm({ item_name: '', quantity: '1', unit: '', priority: 'normal', location_note: '', notes: '' });
      fetchRequests();
    } catch (e: any) { setError(e.message); }
    finally { setCreating(false); }
  };

  const advanceStatus = async (req: SupplyRequest) => {
    const next = STATUS_FLOW[req.status];
    if (!next) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('supply_requests').update({
      status: next,
      ...(next === 'approved' ? { approved_by: user!.id, approved_at: new Date().toISOString() } : {}),
    }).eq('id', req.id);
    fetchRequests();
  };

  const cancelRequest = async (id: string) => {
    await supabase.from('supply_requests').update({ status: 'cancelled' }).eq('id', id);
    fetchRequests();
  };

  const filtered = requests.filter(r =>
    r.item_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.location_note ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: requests.length,
    urgent: requests.filter(r => r.priority === 'urgent' && r.status === 'pending').length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Supply Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage field supply requests from employees</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-slate-900' },
          { label: 'Urgent Pending', value: stats.urgent, color: stats.urgent > 0 ? 'text-red-600' : 'text-slate-400' },
          { label: 'Pending Approval', value: stats.pending, color: stats.pending > 0 ? 'text-amber-600' : 'text-slate-400' },
          { label: 'Approved / Ordered', value: stats.approved, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
          <option value="all">All Statuses</option>
          {['pending', 'approved', 'ordered', 'delivered', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
          <option value="all">All Priorities</option>
          {['urgent', 'high', 'normal', 'low'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Requests ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No supply requests found</p>
            {requests.length === 0 && <p className="text-sm text-slate-400 mt-1">Employees can request supplies from the mobile app</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(req => (
              <div key={req.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
                    <Package className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{req.item_name}</p>
                      <span className="text-xs text-slate-500">× {req.quantity}{req.unit ? ` ${req.unit}` : ''}</span>
                      {req.request_number && <span className="text-[11px] text-slate-400 font-mono">{req.request_number}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY_STYLES[req.priority]}`}>{req.priority}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[req.status]}`}>{req.status}</span>
                      {req.location_note && <span className="text-xs text-slate-500">{req.location_note}</span>}
                      <span className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.notes && <p className="text-xs text-slate-500 mt-1 italic">{req.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {STATUS_FLOW[req.status] && (
                    <button onClick={() => advanceStatus(req)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors capitalize">
                      → {STATUS_FLOW[req.status]}
                    </button>
                  )}
                  {req.status === 'pending' && (
                    <button onClick={() => cancelRequest(req.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">New Supply Request</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name <span className="text-red-500">*</span></label>
                <input required type="text" value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))}
                  placeholder="e.g. Disinfectant Spray, Mop Heads, Paper Towels"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input type="text" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                    placeholder="e.g. bottles, boxes"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                  {['urgent', 'high', 'normal', 'low'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Site</label>
                <input type="text" value={form.location_note} onChange={e => setForm(p => ({ ...p, location_note: e.target.value }))}
                  placeholder="Where is it needed?"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional details..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
