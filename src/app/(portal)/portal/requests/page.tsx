"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser, getServiceRequests, submitServiceRequest } from "@/lib/services/customerPortal";
import { ClipboardList, Plus, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-600',
  acknowledged: 'bg-blue-100 text-blue-700',
  in_review: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-50 text-slate-400',
};

const CATEGORIES = ['additional_cleaning','missed_service','schedule_change','special_instructions','emergency_cleaning','general_question','other'];

export default function PortalRequestsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ category: 'additional_cleaning', priority: 'normal', title: '', description: '', requested_date: '', location_id: '' });

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      setPortalUser(pu);
      const reqs = await getServiceRequests(pu.client_id);
      setRequests(reqs);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    setSaving(true);
    try {
      await submitServiceRequest({ client_id: portalUser.client_id, ...form, location_id: form.location_id || undefined });
      setSuccess('Your request has been submitted successfully. Our team will follow up shortly.');
      setShowForm(false);
      setForm({ category: 'additional_cleaning', priority: 'normal', title: '', description: '', requested_date: '', location_id: '' });
      const reqs = await getServiceRequests(portalUser.client_id);
      setRequests(reqs);
    } catch (err: any) { setFormError(err.message); }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-9 h-9 animate-spin text-blue-500" /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PortalSidebar clientName={portalUser?.clients?.name} />
      <main className="pl-64 flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
              <p className="text-slate-500 text-sm mt-0.5">Submit and track requests for your locations.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>

          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-700"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Requests List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {requests.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No service requests yet.</p>
                <p className="text-sm mt-1">Click "New Request" to submit your first request.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.map(r => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{r.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[r.status] ?? 'bg-slate-100 text-slate-500'}`}>
                        {r.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="capitalize">{r.category?.replace(/_/g, ' ')}</span>
                      <span className="capitalize">Priority: {r.priority}</span>
                      {r.request_number && <span>{r.request_number}</span>}
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.description && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.description}</p>}
                    {r.resolution_notes && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-0.5">Resolution:</p>
                        <p className="text-sm text-emerald-800">{r.resolution_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">New Service Request</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700"><AlertCircle className="w-4 h-4" />{formError}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Brief summary of your request"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {['low','normal','high','urgent'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Please describe your request in detail..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Requested Date (optional)</label>
                <input type="date" value={form.requested_date} onChange={e => setForm(p => ({ ...p, requested_date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
