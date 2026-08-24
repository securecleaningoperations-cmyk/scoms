"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, Plus, Loader2, Search, Eye, Download, Clock, X, CheckCircle, File, Trash2, Video } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = "documents";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"repository" | "templates">("repository");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDocModal, setShowDocModal] = useState(false);
  const [showTplModal, setShowTplModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docForm, setDocForm] = useState({ name: "", category: "employee" });
  const [tplForm, setTplForm] = useState({ name: "", category: "employee" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: d }, { data: t }] = await Promise.all([
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('document_templates').select('*').order('created_at', { ascending: false }),
    ]);
    setDocuments(d || []);
    setTemplates(t || []);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!docForm.name) setDocForm(p => ({ ...p, name: f.name.replace(/\.[^/.]+$/, "") }));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { alert("Please select a file."); return; }
    setIsAdding(true);
    setUploading(true);

    const filePath = `uploads/${docForm.category}/${Date.now()}_${selectedFile.name}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(filePath, selectedFile, { upsert: true });

    let publicUrl = "";
    if (!upErr) {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      publicUrl = urlData?.publicUrl || "";
    }
    setUploading(false);

    const { error } = await supabase.from('documents').insert([{
      name: docForm.name || selectedFile.name,
      category: docForm.category,
      file_path: publicUrl || filePath,
      version: 1,
      status: 'active',
      is_original: true,
      tags: [docForm.category, 'uploaded', `${(selectedFile.size / 1048576).toFixed(2)} MB`],
      retention_period_years: docForm.category === 'financial' ? 7 : docForm.category === 'employee' ? 5 : 3,
    }]);

    if (!error) {
      setShowDocModal(false);
      setDocForm({ name: "", category: "employee" });
      setSelectedFile(null);
      fetchData();
    } else {
      alert("Save error: " + error.message);
    }
    setIsAdding(false);
  };

  const handleDownload = async (doc: any) => {
    // If we have a real Supabase URL, open it directly
    if (doc.file_path?.startsWith("http")) {
      window.open(doc.file_path, "_blank");
      return;
    }
    // Try to get signed URL from storage
    if (doc.file_path && !doc.file_path.startsWith("/")) {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 60);
      if (data?.signedUrl) { window.open(data.signedUrl, "_blank"); return; }
    }
    // Fallback: generate a proper text receipt
    const blob = new Blob([
      `SCOMS ENTERPRISE — DOCUMENT RECORD\n====================================\nName: ${doc.name}\nID: ${doc.id}\nCategory: ${doc.category}\nStatus: ${doc.status}\nVersion: v${doc.version}\nCreated: ${new Date(doc.created_at || Date.now()).toLocaleString()}\n\nNote: Original file was not uploaded to Supabase Storage.\nPlease re-upload via Documents > Upload Document.`
    ], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(doc.name || "document").replace(/[^a-z0-9]/gi, "_")}_receipt.txt`;
    a.click();
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Delete this document record?")) return;
    setDeletingId(id);
    await supabase.from('documents').delete().eq('id', id);
    await fetchData();
    setDeletingId(null);
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const { error } = await supabase.from('document_templates').insert([{
      name: tplForm.name,
      category: tplForm.category,
      content: `[LETTERHEAD]\n\nDate: {{date}}\n\nDear {{recipient_name}},\n\n[Body...]\n\nSincerely,\n{{sender_name}}\nSecure Cleaning Operations Inc.`,
      fields: [{ key: 'date', label: 'Date', type: 'date' }, { key: 'recipient_name', label: 'Recipient Name', type: 'text' }, { key: 'sender_name', label: 'Sender Name', type: 'text' }],
      is_active: true,
    }]);
    if (!error) { setShowTplModal(false); setTplForm({ name: "", category: "employee" }); fetchData(); }
    else alert("Error: " + error.message);
    setIsAdding(false);
  };

  const handleUseTemplate = (t: any) => {
    const content = (t.content || "").replace(/{{date}}/g, new Date().toLocaleDateString()).replace(/{{recipient_name}}/g, "[Recipient]").replace(/{{sender_name}}/g, "[Sender]");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(t.name || "template").replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
  };

  const categories = ['all', 'employee', 'client', 'vendor', 'corporate', 'financial', 'operations'];
  const filtered = documents.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === 'all' || d.category === categoryFilter)
  );
  const catColor = (c: string) => ({ employee: 'bg-blue-50 text-blue-700', client: 'bg-emerald-50 text-emerald-700', vendor: 'bg-purple-50 text-purple-700', corporate: 'bg-amber-50 text-amber-700', financial: 'bg-red-50 text-red-700', operations: 'bg-slate-100 text-slate-700' }[c] || 'bg-slate-100 text-slate-700');
  const statusColor = (s: string) => ({ active: 'bg-emerald-50 text-emerald-700', pending_signature: 'bg-amber-50 text-amber-700', signed: 'bg-blue-50 text-blue-700', archived: 'bg-slate-100 text-slate-600' }[s] || 'bg-slate-100 text-slate-600');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24 font-sans">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-[38px] font-bold text-slate-900 tracking-tight">Document Management</h1>
          <p className="text-slate-500 font-medium mt-1">Files stored in Supabase Storage • Real-time records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => tab === 'templates' ? setShowTplModal(true) : setShowDocModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm">
            {tab === 'templates' ? <Plus className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            {tab === 'templates' ? 'New Template' : 'Upload Document'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[{ label: "Total", value: documents.length }, { label: "Active", value: documents.filter(d => d.status === 'active').length }, { label: "Pending", value: documents.filter(d => d.status === 'pending_signature').length }, { label: "Templates", value: templates.length }].map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <FileText className="w-5 h-5 text-blue-600 mb-3" />
            <p className="text-sm text-slate-500">{m.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(["repository", "templates"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>

      {tab === "repository" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none w-64" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map(c => <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${categoryFilter === c ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{c}</button>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200"><th className="p-4 pl-6">Document</th><th className="p-4">Category</th><th className="p-4">Version</th><th className="p-4">Status</th><th className="p-4">Retention</th><th className="p-4 pr-6 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-slate-500"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No documents yet. Upload your first document.</p></td></tr>
                  : filtered.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-4 pl-6"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div><div><p className="font-semibold text-slate-900 text-sm">{d.name}</p><p className="text-xs text-slate-400 font-mono">{d.id?.split('-')[0]?.toUpperCase()}</p></div></div></td>
                      <td className="p-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${catColor(d.category)}`}>{d.category}</span></td>
                      <td className="p-4 text-sm text-slate-600">v{d.version}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColor(d.status)}`}>{d.status?.replace('_', ' ')}</span></td>
                      <td className="p-4"><div className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3 h-3" />{d.retention_period_years || 5}yr</div></td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setViewingDoc(d)} className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleDownload(d)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Download"><Download className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteDoc(d.id)} disabled={deletingId === d.id} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? <div className="col-span-3 p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
            : templates.length === 0 ? <div className="col-span-3 p-12 text-center text-slate-500"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No templates yet.</p></div>
            : templates.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4"><FileText className="w-5 h-5 text-blue-600" /></div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{t.name}</h3>
                <p className="text-xs text-slate-400 capitalize mb-3">{t.category} category</p>
                <div className="flex gap-1 mb-4">{(t.fields || []).slice(0, 3).map((f: any) => <span key={f.key} className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded">{f.label}</span>)}</div>
                <button onClick={() => handleUseTemplate(t)} className="w-full py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                  Use Template (Download)
                </button>
              </div>
            ))}
        </div>
      )}

      {/* View Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl p-6">
            <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div><h3 className="font-bold text-slate-900 text-lg">{viewingDoc.name}</h3><p className="text-xs text-slate-400">ID: {viewingDoc.id}</p></div>
              </div>
              <button onClick={() => setViewingDoc(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border mb-4 text-sm">
              <div><span className="text-xs text-slate-400 block">Category</span><strong className="capitalize">{viewingDoc.category}</strong></div>
              <div><span className="text-xs text-slate-400 block">Status</span><strong className="text-emerald-600 capitalize">{viewingDoc.status}</strong></div>
              <div><span className="text-xs text-slate-400 block">Version</span><strong>v{viewingDoc.version}</strong></div>
              <div><span className="text-xs text-slate-400 block">Retention</span><strong>{viewingDoc.retention_period_years || 5} yrs</strong></div>
            </div>
            {viewingDoc.file_path?.startsWith("http") ? (
              <a href={viewingDoc.file_path} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 mb-3">
                Open File in New Tab
              </a>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-3">File not stored in Supabase Storage. Re-upload to enable direct viewing.</div>
            )}
            <button onClick={() => handleDownload(viewingDoc)} className="w-full border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-900">Upload Document</h3><button onClick={() => setShowDocModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select File *</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="*/*" />
                <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 cursor-pointer bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center transition-all">
                  {selectedFile ? (
                    <div className="flex items-center gap-3 w-full"><div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600"><File className="w-5 h-5" /></div><div className="flex-1 overflow-hidden"><p className="font-semibold text-sm truncate">{selectedFile.name}</p><p className="text-xs text-slate-400">{(selectedFile.size / 1048576).toFixed(2)} MB</p></div><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                  ) : <><Upload className="w-8 h-8 mb-2 text-blue-600" /><p className="text-sm font-semibold">Click to choose any file</p><p className="text-xs text-slate-400 mt-1">PDF, DOCX, Video, Image — stored in Supabase</p></>}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label><input type="text" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} placeholder="e.g. Q3 Report" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 capitalize" value={docForm.category} onChange={e => setDocForm({ ...docForm, category: e.target.value })}>{['employee', 'client', 'vendor', 'corporate', 'financial', 'operations'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {uploading ? "Uploading..." : "Save to Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTplModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-900">Create Template</h3><button onClick={() => setShowTplModal(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label><input required type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900" value={tplForm.name} onChange={e => setTplForm({ ...tplForm, name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 capitalize" value={tplForm.category} onChange={e => setTplForm({ ...tplForm, category: e.target.value })}>{['employee', 'client', 'vendor', 'corporate', 'financial', 'operations'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTplModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
