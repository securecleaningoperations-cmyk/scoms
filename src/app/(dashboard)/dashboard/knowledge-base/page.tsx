"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Search, CheckCircle2, Clock, Archive, Eye, EyeOff,
  Bot, Loader2, X, Tag, Edit3, Trash2, Copy, Check, Sparkles, AlertCircle, FileText
} from "lucide-react";

const CATEGORIES = [
  'all', 'sales', 'customer_service', 'employee_support',
  'recruiting', 'vendor_inquiry', 'billing', 'general',
  'emergency', 'routing'
];

const STATUSES = ['all', 'draft', 'in_review', 'approved', 'published', 'unpublished', 'archived'];

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  in_review: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-blue-100 text-blue-800 border-blue-200',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  unpublished: 'bg-slate-100 text-slate-600 border-slate-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
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
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'general',
    visibility: 'internal',
    tags: '',
    content: '',
    approved_for_ai: false
  });

  // Edit Form State
  const [editForm, setEditForm] = useState<{
    title: string;
    category: string;
    visibility: string;
    tags: string;
    content: string;
    approved_for_ai: boolean;
  }>({
    title: '',
    category: 'general',
    visibility: 'internal',
    tags: '',
    content: '',
    approved_for_ai: false
  });

  // Fetch entries with API endpoint & fallback
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kb-entries?category=${filterCat}&status=${filterStatus}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setEntries(data);
        // Auto-select first item if current selection is invalid or null
        setSelected((prev: any) => {
          if (prev && data.some((d: any) => d.id === prev.id)) {
            return data.find((d: any) => d.id === prev.id);
          }
          return data.length > 0 ? data[0] : null;
        });
      }
    } catch (err) {
      console.error('Error fetching KB entries:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCat, filterStatus]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // When selected changes, sync editForm
  const handleSelectEntry = (entry: any) => {
    setSelected(entry);
    setIsEditing(false);
    setEditForm({
      title: entry.title || '',
      category: entry.category || 'general',
      visibility: entry.visibility || 'internal',
      tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
      content: entry.content || '',
      approved_for_ai: !!entry.approved_for_ai
    });
  };

  // Create new entry
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.content.trim()) return;

    setSaving(true);
    const tagsArray = createForm.tags
      ? createForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch('/api/kb-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          tags: tagsArray
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to create entry');
      }

      const { data } = await res.json();
      setShowCreate(false);
      setCreateForm({
        title: '',
        category: 'general',
        visibility: 'internal',
        tags: '',
        content: '',
        approved_for_ai: false
      });

      setEntries(prev => [data, ...prev]);
      handleSelectEntry(data);
    } catch (err: any) {
      alert('Error creating entry: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Update existing entry
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setSaving(true);
    const tagsArray = editForm.tags
      ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch('/api/kb-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          ...editForm,
          tags: tagsArray
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to update entry');
      }

      const { data } = await res.json();
      setSelected(data);
      setEntries(prev => prev.map(item => item.id === data.id ? data : item));
      setIsEditing(false);
    } catch (err: any) {
      alert('Error saving changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${selected?.title}"?`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/kb-entries?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to delete entry');
      }

      const remaining = entries.filter(e => e.id !== id);
      setEntries(remaining);
      setSelected(remaining.length > 0 ? remaining[0] : null);
      setIsEditing(false);
    } catch (err: any) {
      alert('Error deleting entry: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Status transitions
  const handleStatusTransition = async (newStatus: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/kb-entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selected.id,
          status: newStatus,
          approved_for_ai: newStatus === 'published' ? true : selected.approved_for_ai
        })
      });

      if (!res.ok) throw new Error('Status transition failed');
      const { data } = await res.json();
      setSelected(data);
      setEntries(prev => prev.map(item => item.id === data.id ? data : item));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyContent = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`${selected.title}\n\n${selected.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = entries.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden font-sans bg-slate-50">
      
      {/* 1. LEFT PANEL: SEARCH & ENTRY LIST */}
      <div className="w-[360px] sm:w-[400px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Knowledge Base</h1>
                <p className="text-xs text-slate-400">AI-governed operational repository</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {filtered.length} docs
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search SOPs, policies, answers..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white font-medium text-slate-700"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white font-medium text-slate-700"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Status' : s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Knowledge Entry</span>
          </button>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs">Loading repository...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-4 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-25" />
              <p className="text-sm font-bold text-slate-600">No entries found</p>
              <p className="text-xs text-slate-400 mt-1">Create an entry or adjust your filters.</p>
            </div>
          ) : (
            filtered.map(e => {
              const isSel = selected?.id === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => handleSelectEntry(e)}
                  className={`w-full text-left p-4 transition-all ${
                    isSel
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      STATUS_STYLES[e.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {e.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {e.approved_for_ai && (
                        <span title="Approved for AI Engine" className="text-indigo-600 flex items-center gap-0.5 font-bold">
                          <Bot className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="capitalize">{e.category?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {e.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {e.content}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT PANEL: VIEW / EDIT ARTICLE */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
            <BookOpen className="w-16 h-16 opacity-20" />
            <h3 className="text-lg font-bold text-slate-700">Select an entry</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm text-center">
              Click any article on the left to read, edit, delete, or approve it for the SCOMS AI Engine.
            </p>
          </div>
        ) : isEditing ? (
          /* EDIT MODE */
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-indigo-200 shadow-md p-6 sm:p-8 space-y-6 animate-in fade-in-50 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Edit Knowledge Base Entry</h2>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full text-base font-semibold border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Visibility Audience
                  </label>
                  <select
                    value={editForm.visibility}
                    onChange={e => setEditForm(p => ({ ...p, visibility: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="internal">Internal Only (Staff & Dispatch)</option>
                    <option value="ai_only">AI Engine Knowledge Base</option>
                    <option value="customer_portal">Customer Portal (Public Clients)</option>
                    <option value="employee_portal">Employee Portal (Field Technicians)</option>
                    <option value="public">Public Commercial FAQ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. sops, chemicals, hospital, safety"
                  value={editForm.tags}
                  onChange={e => setEditForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Content Body & Procedures <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={10}
                  value={editForm.content}
                  onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit_approved_ai"
                  checked={editForm.approved_for_ai}
                  onChange={e => setEditForm(p => ({ ...p, approved_for_ai: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="edit_approved_ai" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
                  Approve for AI Phone Agent & Autopilot Decision Engine
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-150">
            
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      STATUS_STYLES[selected.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {selected.status}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md capitalize">
                      {selected.category?.replace(/_/g, ' ')}
                    </span>
                    {selected.approved_for_ai && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" /> AI Approved
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      v{selected.version_number || 1}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {selected.title}
                  </h2>
                </div>

                {/* Primary Action Buttons: Edit, Delete, Copy */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyContent}
                    className="p-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition"
                    title="Copy Article Text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditForm({
                        title: selected.title || '',
                        category: selected.category || 'general',
                        visibility: selected.visibility || 'internal',
                        tags: Array.isArray(selected.tags) ? selected.tags.join(', ') : (selected.tags || ''),
                        content: selected.content || '',
                        approved_for_ai: !!selected.approved_for_ai
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Article</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting}
                    className="p-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Entry"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Workflow Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">Lifecycle Action:</span>

                {selected.status === 'draft' && (
                  <button
                    onClick={() => handleStatusTransition('in_review')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" /> Submit for Review
                  </button>
                )}

                {(selected.status === 'draft' || selected.status === 'in_review') && (
                  <button
                    onClick={() => handleStatusTransition('approved')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Article
                  </button>
                )}

                {selected.status === 'approved' && (
                  <button
                    onClick={() => handleStatusTransition('published')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Publish to AI & Repositories
                  </button>
                )}

                {selected.status === 'published' && (
                  <button
                    onClick={() => handleStatusTransition('unpublished')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Unpublish
                  </button>
                )}

                {selected.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusTransition('archived')}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                )}
              </div>
            </div>

            {/* Content Display Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Body</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {selected.content?.split(/\s+/).filter(Boolean).length || 0} words
                </span>
              </div>

              <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                {selected.content}
              </div>

              {/* Tags */}
              {selected.tags && (Array.isArray(selected.tags) ? selected.tags.length > 0 : selected.tags) && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {(Array.isArray(selected.tags) ? selected.tags : String(selected.tags).split(',')).map((tag: string, i: number) => (
                    <span key={i} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visibility</p>
                <p className="text-xs font-semibold text-slate-800 mt-1 capitalize">
                  {selected.visibility?.replace(/_/g, ' ') || 'Internal'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Clearance</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {selected.approved_for_ai ? 'Approved' : 'Restricted'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Modified</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {selected.updated_at ? new Date(selected.updated_at).toLocaleDateString() : 'Just now'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CREATE ENTRY MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">New Knowledge Base Entry</h3>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hospital-Grade Terminal Cleaning Protocol"
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={createForm.category}
                    onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'all').map(c => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Visibility Audience
                  </label>
                  <select
                    value={createForm.visibility}
                    onChange={e => setCreateForm(p => ({ ...p, visibility: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="internal">Internal Only (Staff & Dispatch)</option>
                    <option value="ai_only">AI Engine Knowledge Base</option>
                    <option value="customer_portal">Customer Portal (Public Clients)</option>
                    <option value="employee_portal">Employee Portal (Field Technicians)</option>
                    <option value="public">Public Commercial FAQ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. sops, chemicals, hospital, safety"
                  value={createForm.tags}
                  onChange={e => setCreateForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Article Content & Procedures <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Enter detailed company policies, step-by-step cleaning procedures, customer FAQ answers, or regulatory standards..."
                  value={createForm.content}
                  onChange={e => setCreateForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="create_approved_ai"
                  checked={createForm.approved_for_ai}
                  onChange={e => setCreateForm(p => ({ ...p, approved_for_ai: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="create_approved_ai" className="text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
                  Mark as approved for AI Phone Agent & Autopilot Training
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Knowledge Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
