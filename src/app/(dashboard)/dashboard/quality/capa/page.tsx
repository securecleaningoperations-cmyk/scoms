"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle, Plus, Search, Loader2, X, AlertCircle,
  Save, ChevronRight, CheckCircle2, User, FileText,
  Thermometer, CheckCircle
} from 'lucide-react';

interface CapaAction {
  id: string;
  inspection_id: string | null;
  title: string;
  description: string;
  assigned_to: string | null;
  due_date: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  root_cause: string | null;
  corrective_action: string | null;
  preventive_action: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-blue-100 text-blue-700',
  closed: 'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
  root_cause: '',
  corrective_action: '',
  preventive_action: '',
  status: 'open'
};

export default function CAPAPage() {
  const [capas, setCapas] = useState<CapaAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCapa, setEditingCapa] = useState<CapaAction | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const fetchCapas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase.from('capa_actions').select('*').order('created_at', { ascending: false });
      if (err) throw err;
      setCapas(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCapas(); }, [fetchCapas]);

  const openCreate = () => { setEditingCapa(null); setForm(EMPTY_FORM); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        assigned_to: form.assigned_to || null,
        due_date: form.due_date || null,
        root_cause: form.root_cause || null,
        corrective_action: form.corrective_action || null,
        preventive_action: form.preventive_action || null,
        tenant_id: profile?.tenant_id,
        status: form.status,
      };

      if (editingCapa) {
        const { error: err } = await supabase.from('capa_actions').update(payload).eq('id', editingCapa.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('capa_actions').insert({ ...payload, status: 'open' });
        if (err) throw err;
      }
      setShowModal(false);
      fetchCapas();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async (capa: CapaAction) => {
    const flow: CapaAction['status'][] = ['open', 'in_progress', 'resolved', 'closed'];
    const currentIdx = flow.indexOf(capa.status);
    if (currentIdx >= flow.length - 1) return;
    const nextStatus = flow[currentIdx + 1];
    
    // Approval threshold logic: only users with specific roles can close a CAPA
    if (nextStatus === 'closed') {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single();
      if (!['super_admin', 'corporate_admin', 'quality_manager'].includes(profile?.role || '')) {
         alert('Only Quality Managers and Administrators can close a CAPA.');
         return;
      }
    }

    await supabase.from('capa_actions').update({ status: nextStatus }).eq('id', capa.id);
    fetchCapas();
  };

  const filtered = capas.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-display tracking-tight">CAPA Tracking</h1>
          <p className="text-sm text-slate-500 mt-1">Corrective & Preventive Action workflows for operational assurance</p>
        </div>
        <button onClick={openCreate} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New CAPA
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-md shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search CAPA..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 pl-6">ID / Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No CAPAs found.</p>
              </td></tr>
            ) : filtered.map((capa) => (
              <tr key={capa.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <p className="font-semibold text-slate-900">{capa.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{capa.id.slice(0,13)}...</p>
                </td>
                <td className="p-4 text-slate-600 line-clamp-2">{capa.description}</td>
                <td className="p-4 font-medium text-slate-700">{capa.due_date ? new Date(capa.due_date).toLocaleDateString() : 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${STATUS_STYLES[capa.status]}`}>
                    {STATUS_LABELS[capa.status]}
                  </span>
                </td>
                <td className="p-4 pr-6 flex gap-2">
                  {capa.status !== 'closed' && (
                    <button onClick={() => advanceStatus(capa)} className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                      Advance Status
                    </button>
                  )}
                  <button onClick={() => { 
                      setEditingCapa(capa); 
                      setForm({ 
                        title: capa.title, description: capa.description, assigned_to: capa.assigned_to || '', 
                        due_date: capa.due_date || '', root_cause: capa.root_cause || '', 
                        corrective_action: capa.corrective_action || '', preventive_action: capa.preventive_action || '', status: capa.status 
                      }); 
                      setShowModal(true); 
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 font-display">{editingCapa ? 'Update CAPA' : 'New CAPA Request'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                {editingCapa && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Investigation & Action</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-600 mb-1">Root Cause</label>
                    <textarea rows={2} value={form.root_cause} onChange={e => setForm(p => ({ ...p, root_cause: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-slate-600 mb-1">Corrective Action (Fixing the immediate problem)</label>
                    <textarea rows={2} value={form.corrective_action} onChange={e => setForm(p => ({ ...p, corrective_action: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-slate-600 mb-1">Preventive Action (Fixing the system)</label>
                    <textarea rows={2} value={form.preventive_action} onChange={e => setForm(p => ({ ...p, preventive_action: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 cal-btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingCapa ? 'Update CAPA' : 'Submit CAPA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
