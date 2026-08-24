'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  FileText, Plus, Search, ChevronDown, ChevronUp, CheckCircle2,
  Clock, Archive, Edit3, Loader2, X, AlertCircle, Eye, Save,
  Shield, Tag, Calendar, User
} from 'lucide-react';

interface SOP {
  id: string;
  title: string;
  category: string;
  scope: string | null;
  version: number;
  status: 'draft' | 'active' | 'archived';
  content: string | null;
  effective_date: string | null;
  review_date: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  corporate: 'Corporate',
  regional: 'Regional',
  franchise: 'Franchise',
  client: 'Client-Specific',
  location: 'Location',
  task: 'Task',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-amber-100 text-amber-700',
};

const EMPTY_FORM = {
  title: '',
  category: 'corporate',
  scope: '',
  content: '',
  effective_date: '',
  review_date: '',
  client_id: '',
};

export default function SOPManagementPage() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSOPs = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('sops').select('*').order('updated_at', { ascending: false });
      if (filterStatus !== 'all') q = q.eq('status', filterStatus);
      if (filterCategory !== 'all') q = q.eq('category', filterCategory);
      const { data, error: err } = await q;
      if (err) throw err;
      setSops(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchSOPs(); }, [fetchSOPs]);

  useEffect(() => {
    supabase.from('clients').select('id,name').order('name').limit(100).then(r => setClients(r.data ?? []));
  }, []);

  const openCreate = () => { setEditingSOP(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (sop: SOP) => {
    setEditingSOP(sop);
    setForm({
      title: sop.title,
      category: sop.category,
      scope: sop.scope ?? '',
      content: sop.content ?? '',
      effective_date: sop.effective_date ?? '',
      review_date: sop.review_date ?? '',
      client_id: sop.client_id ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
      const payload = {
        title: form.title.trim(),
        category: form.category,
        scope: form.scope || null,
        content: form.content || null,
        effective_date: form.effective_date || null,
        review_date: form.review_date || null,
        client_id: form.client_id || null,
        tenant_id: profile?.tenant_id,
        updated_at: new Date().toISOString(),
      };

      if (editingSOP) {
        // Save version snapshot before updating
        await supabase.from('sop_versions').insert({
          sop_id: editingSOP.id,
          version_number: editingSOP.version,
          content: editingSOP.content,
          change_summary: 'Updated via SOP Management',
          tenant_id: profile?.tenant_id,
          created_by: user!.id,
        });
        const { error: err } = await supabase.from('sops').update({ ...payload, version: editingSOP.version + 1 }).eq('id', editingSOP.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('sops').insert({ ...payload, status: 'draft', version: 1, created_by: user!.id });
        if (err) throw err;
      }
      setShowModal(false);
      fetchSOPs();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (sop: SOP, newStatus: 'draft' | 'active' | 'archived') => {
    await supabase.from('sops').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', sop.id);
    fetchSOPs();
  };

  const filtered = sops.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.scope ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: sops.length,
    active: sops.filter(s => s.status === 'active').length,
    draft: sops.filter(s => s.status === 'draft').length,
    archived: sops.filter(s => s.status === 'archived').length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SOP Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage Standard Operating Procedures across all levels</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New SOP
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total SOPs', value: stats.total, color: 'text-slate-900' },
          { label: 'Active', value: stats.active, color: 'text-emerald-600' },
          { label: 'Draft', value: stats.draft, color: 'text-slate-500' },
          { label: 'Archived', value: stats.archived, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SOPs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-slate-800 bg-transparent"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500">
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* SOP Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">SOPs ({filtered.length})</h2>
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No SOPs found</p>
            <p className="text-sm text-slate-400 mt-1">Create your first SOP to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(sop => (
              <div key={sop.id}>
                <div className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{sop.title}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLES[sop.status]}`}>{sop.status}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{CATEGORY_LABELS[sop.category] ?? sop.category}</span>
                        <span className="text-[11px] text-slate-400">v{sop.version}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {sop.scope && <span className="text-xs text-slate-500 flex items-center gap-1"><Tag className="w-3 h-3" />{sop.scope}</span>}
                        {sop.effective_date && <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Effective: {new Date(sop.effective_date).toLocaleDateString()}</span>}
                        {sop.review_date && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />Review: {new Date(sop.review_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {sop.status === 'draft' && (
                      <button onClick={() => handleStatusChange(sop, 'active')} className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                        Publish
                      </button>
                    )}
                    {sop.status === 'active' && (
                      <button onClick={() => handleStatusChange(sop, 'archived')} className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        Archive
                      </button>
                    )}
                    <button onClick={() => openEdit(sop)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpandedId(expandedId === sop.id ? null : sop.id)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      {expandedId === sop.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {expandedId === sop.id && sop.content && (
                  <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
                    <div className="mt-4 bg-white rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SOP Content</p>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{sop.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{editingSOP ? 'Edit SOP' : 'Create New SOP'}</h3>
                {editingSOP && <p className="text-xs text-slate-400">Editing will create version {editingSOP.version + 1}</p>}
              </div>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Office Cleaning Standard Procedure"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scope / Tags</label>
                  <input type="text" value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))}
                    placeholder="e.g. Restrooms, Healthcare"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              {form.category === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link to Client</label>
                  <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date</label>
                  <input type="date" value={form.effective_date} onChange={e => setForm(p => ({ ...p, effective_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Review Date</label>
                  <input type="date" value={form.review_date} onChange={e => setForm(p => ({ ...p, review_date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Procedure Content</label>
                <textarea rows={10} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Write the full SOP content here. Describe step-by-step procedures, safety requirements, quality standards..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-y" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingSOP ? 'Save New Version' : 'Create SOP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
