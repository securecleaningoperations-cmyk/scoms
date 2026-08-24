"use client";

import { useState, useEffect, useCallback } from "react";
import { getKbEntries, createKbEntry, updateKbEntry, approveKbEntry, publishKbEntry } from "@/lib/services/callSessions";
import { BookOpen, Plus, Search, CheckCircle2, Clock, Archive, Eye, EyeOff, Bot, Loader2, X, ChevronDown, Tag, Edit3 } from "lucide-react";

const CATEGORIES = ['all','sales','customer_service','employee_support','recruiting','vendor_inquiry','billing','general','emergency','routing'];
const STATUSES = ['all','draft','in_review','approved','published','unpublished','archived'];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-emerald-100 text-emerald-700',
  unpublished: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-50 text-slate-400',
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: 'general', title: '', content: '', visibility: 'internal', approved_for_ai: false });
  const [editForm, setEditForm] = useState<any>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getKbEntries(filterStatus === 'all' ? undefined : filterStatus, filterCat === 'all' ? undefined : filterCat);
      setEntries(data);
    } catch (e: any) {
      console.error(e);
      alert("Database Error (Fetch): " + e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCat]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createKbEntry({ ...form });
      setShowCreate(false);
      setForm({ category: 'general', title: '', content: '', visibility: 'internal', approved_for_ai: false });
      fetch();
    } catch (e: any) {
      console.error(e);
      alert("Database Error (Create): " + e.message + "\n\nThis usually means the table is missing or RLS is blocking the insert.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await updateKbEntry(selected.id, editForm);
      setIsEditing(false);
      setSelected({ ...selected, ...editForm });
      fetch();
    } catch (e: any) {
      console.error(e);
      alert("Database Error (Update): " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    try {
      await approveKbEntry(selected.id);
      setSelected({ ...selected, status: 'approved' });
      fetch();
    } catch (e: any) {
      alert("Database Error (Approve): " + e.message);
    }
  };

  const handlePublish = async () => {
    if (!selected) return;
    try {
      await publishKbEntry(selected.id);
      setSelected({ ...selected, status: 'published' });
      fetch();
    } catch (e: any) {
      alert("Database Error (Publish): " + e.message);
    }
  };

  const handleUnpublish = async () => {
    if (!selected) return;
    try {
      await updateKbEntry(selected.id, { status: 'unpublished' });
      setSelected({ ...selected, status: 'unpublished' });
      fetch();
    } catch (e: any) {
      alert("Database Error (Unpublish): " + e.message);
    }
  };

  const filtered = entries.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-0px)] overflow-hidden font-sans">
      {/* Left Panel */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Knowledge Base</h1>
              <p className="text-xs text-slate-400">AI-governed company knowledge</p>
            </div>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex gap-2">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="w-full mt-2 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="w-9 h-9 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No entries found</p>
            </div>
          ) : filtered.map(e => (
            <button key={e.id} onClick={() => { setSelected(e); setIsEditing(false); setEditForm(null); }}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${selected?.id === e.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${STATUS_STYLES[e.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {e.status}
                </span>
                <div className="flex items-center gap-1">
                  {e.approved_for_ai && <span title="AI-approved"><Bot className="w-3 h-3 text-indigo-500" /></span>}
                  <span className="text-[10px] text-slate-400">{e.category?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{e.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{e.content?.substring(0, 80)}…</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">Select an entry</p>
            <p className="text-sm mt-1">View, edit, approve, or publish knowledge base content</p>
          </div>
        ) : (
          <div className="p-6 max-w-3xl mx-auto space-y-5">
            {/* Entry Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {isEditing ? (
                    <input value={editForm.title} onChange={e => setEditForm((p: any) => ({ ...p, title: e.target.value }))}
                      className="w-full text-xl font-bold text-slate-900 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400" />
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_STYLES[selected.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {selected.status}
                    </span>
                    <span className="text-xs text-slate-400">{selected.category?.replace(/_/g, ' ')}</span>
                    {selected.approved_for_ai && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        <Bot className="w-3 h-3" /> AI-approved
                      </span>
                    )}
                    <span className="text-xs text-slate-400">v{selected.version_number}</span>
                  </div>
                </div>
                <button onClick={() => { setIsEditing(!isEditing); setEditForm({ title: selected.title, content: selected.content, category: selected.category, visibility: selected.visibility, approved_for_ai: selected.approved_for_ai }); }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selected.status === 'draft' && (
                  <button onClick={handleApprove} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {selected.status === 'approved' && (
                  <button onClick={handlePublish} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                    <Eye className="w-3.5 h-3.5" /> Publish to AI
                  </button>
                )}
                {selected.status === 'published' && (
                  <button onClick={handleUnpublish} className="flex items-center gap-1.5 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50">
                    <EyeOff className="w-3.5 h-3.5" /> Unpublish
                  </button>
                )}
                {!selected.approved_for_ai && selected.status === 'published' && (
                  <button onClick={async () => { await updateKbEntry(selected.id, { approved_for_ai: true }); setSelected({ ...selected, approved_for_ai: true }); fetch(); }}
                    className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                    <Bot className="w-3.5 h-3.5" /> Enable for AI
                  </button>
                )}
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && editForm && (
              <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Edit Entry</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                      <select value={editForm.category} onChange={e => setEditForm((p: any) => ({ ...p, category: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Visibility</label>
                      <select value={editForm.visibility} onChange={e => setEditForm((p: any) => ({ ...p, visibility: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        {['internal','ai_only','customer_portal','employee_portal','public'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Content</label>
                    <textarea rows={8} value={editForm.content} onChange={e => setEditForm((p: any) => ({ ...p, content: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editForm.approved_for_ai} onChange={e => setEditForm((p: any) => ({ ...p, approved_for_ai: e.target.checked }))} />
                    <span className="text-sm font-medium text-slate-700">Approved for AI use</span>
                  </label>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Content Preview */}
            {!isEditing && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3">Content</h3>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.content}</div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Metadata</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Visibility', val: selected.visibility?.replace(/_/g, ' ') ?? '—' },
                  { label: 'Version', val: `v${selected.version_number}` },
                  { label: 'Created', val: selected.created_at ? new Date(selected.created_at).toLocaleDateString() : '—' },
                  { label: 'Updated', val: selected.updated_at ? new Date(selected.updated_at).toLocaleDateString() : '—' },
                  { label: 'Approved At', val: selected.approved_at ? new Date(selected.approved_at).toLocaleDateString() : '—' },
                  { label: 'Published At', val: selected.published_at ? new Date(selected.published_at).toLocaleDateString() : '—' },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 font-semibold uppercase">{m.label}</p>
                    <p className="font-semibold text-slate-700 capitalize">{m.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">New Knowledge Entry</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                  <select value={form.visibility} onChange={e => setForm(p => ({ ...p, visibility: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {['internal','ai_only','customer_portal','employee_portal','public'].map(v => <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content <span className="text-red-500">*</span></label>
                <textarea required rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Enter the knowledge content, FAQ answer, policy text, or response guidance..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.approved_for_ai} onChange={e => setForm(p => ({ ...p, approved_for_ai: e.target.checked }))} />
                <span className="text-sm font-medium text-slate-700">Mark as approved for AI use (requires approved status)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
