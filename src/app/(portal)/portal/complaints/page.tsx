"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { getPortalUser, getComplaints, submitComplaint } from "@/lib/services/customerPortal";
import { AlertCircle, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-slate-100 text-slate-600', acknowledged: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700', action_taken: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-emerald-100 text-emerald-700', closed: 'bg-slate-50 text-slate-400',
};
const COMP_CATEGORIES = ['quality_issue','missed_area','damaged_property','staff_conduct','billing_issue','communication_issue','safety_concern','other'];

export default function PortalComplaintsPage() {
  const router = useRouter();
  const [portalUser, setPortalUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ category: 'quality_issue', priority: 'normal', title: '', description: '', incident_date: '' });

  useEffect(() => {
    const init = async () => {
      const pu = await getPortalUser();
      if (!pu) { router.push('/portal/login'); return; }
      setPortalUser(pu);
      setComplaints(await getComplaints(pu.client_id));
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await submitComplaint({ client_id: portalUser.client_id, ...form, incident_date: form.incident_date || undefined });
    setSuccess('Your complaint has been submitted. A coordinator will respond within 1 business day.');
    setShowForm(false);
    setForm({ category: 'quality_issue', priority: 'normal', title: '', description: '', incident_date: '' });
    setComplaints(await getComplaints(portalUser.client_id));
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
              <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
              <p className="text-slate-500 text-sm mt-0.5">Report issues and track their resolution.</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-red-700 shadow-sm">
              <Plus className="w-4 h-4" /> Report Issue
            </button>
          </div>
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {complaints.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No complaints on record.</p>
                <p className="text-sm mt-1">Use "Report Issue" if you experience any service concerns.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {complaints.map(c => (
                  <div key={c.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[c.status] ?? 'bg-slate-100 text-slate-500'}`}>{c.status?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="capitalize">{c.category?.replace(/_/g, ' ')}</span>
                      {c.incident_date && <span>Incident: {new Date(c.incident_date).toLocaleDateString()}</span>}
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {c.customer_visible_update && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 mb-0.5">Update from our team:</p>
                        <p className="text-sm text-blue-800">{c.customer_visible_update}</p>
                      </div>
                    )}
                    {c.satisfaction_rating && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
                        {'★'.repeat(c.satisfaction_rating)}{'☆'.repeat(5 - c.satisfaction_rating)} Your Rating
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-slate-900">Report a Complaint</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {COMP_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Please describe the issue in as much detail as possible..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Incident</label>
                <input type="date" value={form.incident_date} onChange={e => setForm(p => ({ ...p, incident_date: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
