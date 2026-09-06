"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, FileText, CheckCircle2, AlertCircle, Search, Plus, Loader2, DollarSign, Briefcase } from 'lucide-react';

export default function SubcontractorsPage() {
  const [activeTab, setActiveTab] = useState<'subcontractors' | 'invoices'>('subcontractors');
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', status: 'pending' });

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invForm, setInvForm] = useState({ subcontractor_id: '', amount: '', invoice_number: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'subcontractors') {
      const { data } = await supabase.from('subcontractors').select('*').order('created_at', { ascending: false });
      setSubcontractors(data || []);
    } else {
      const { data } = await supabase.from('subcontractor_invoices').select(`
        *,
        subcontractor:subcontractors(company_name, contact_name)
      `).order('submitted_at', { ascending: false });
      setInvoices(data || []);
      // Also fetch subs for the invoice form dropdown if not loaded
      if (subcontractors.length === 0) {
        const { data: sData } = await supabase.from('subcontractors').select('id, company_name');
        setSubcontractors(sData || []);
      }
    }
    setLoading(false);
  };

  const handleSubSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
    
    await supabase.from('subcontractors').insert([{
      ...subForm,
      tenant_id: profile?.tenant_id
    }]);
    
    setShowSubModal(false);
    setSubForm({ company_name: '', contact_name: '', email: '', phone: '', status: 'pending' });
    fetchData();
    setSaving(false);
  };

  const handleInvSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user!.id).single();
    
    await supabase.from('subcontractor_invoices').insert([{
      ...invForm,
      amount: parseFloat(invForm.amount),
      tenant_id: profile?.tenant_id,
      status: 'submitted'
    }]);
    
    setShowInvoiceModal(false);
    setInvForm({ subcontractor_id: '', amount: '', invoice_number: '', notes: '' });
    fetchData();
    setSaving(false);
  };

  const approveInvoice = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('subcontractor_invoices').update({
      status: 'approved',
      approved_by: user!.id,
      approved_at: new Date().toISOString()
    }).eq('id', id);
    fetchData();
  };

  const payInvoice = async (id: string) => {
    await supabase.from('subcontractor_invoices').update({
      status: 'paid',
      paid_at: new Date().toISOString()
    }).eq('id', id);
    fetchData();
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Subcontractor Portal</h1>
          <p className="text-slate-gray font-medium mt-1">Manage vendor networks, compliance, and accounts payable</p>
        </div>
        <button onClick={() => activeTab === 'subcontractors' ? setShowSubModal(true) : setShowInvoiceModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {activeTab === 'subcontractors' ? 'Subcontractor' : 'Invoice'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('subcontractors')} className={`pb-3 font-semibold text-sm ${activeTab === 'subcontractors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Network Directory
        </button>
        <button onClick={() => setActiveTab('invoices')} className={`pb-3 font-semibold text-sm ${activeTab === 'invoices' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
          Invoices & Payments
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden shadow-sm">
        {activeTab === 'subcontractors' ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 pl-6">Company / Contact</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : subcontractors.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-500"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" />No subcontractors in network.</td></tr>
              ) : subcontractors.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900">{s.company_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.contact_name || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-slate-600">{s.email || 'N/A'}</td>
                  <td className="p-4 text-slate-600">{s.phone || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : s.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 pl-6">Invoice #</th>
                <th className="p-4">Subcontractor</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Financial Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />No invoices submitted.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="p-4 pl-6 font-mono font-medium text-slate-700">{inv.invoice_number || 'N/A'}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{inv.subcontractor?.company_name}</p>
                    <p className="text-xs text-slate-500">{new Date(inv.submitted_at).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">${parseFloat(inv.amount).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wider ${inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : inv.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 flex gap-2">
                    {inv.status === 'submitted' && (
                      <button onClick={() => approveInvoice(inv.id)} className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100">
                        Approve
                      </button>
                    )}
                    {inv.status === 'approved' && (
                      <button onClick={() => payInvoice(inv.id)} className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Subcontractor Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">Add Subcontractor</h3>
            <form onSubmit={handleSubSave} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Company Name *</label><input required className="w-full border rounded-lg px-3 py-2 text-sm" value={subForm.company_name} onChange={e => setSubForm({...subForm, company_name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Contact Name</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={subForm.contact_name} onChange={e => setSubForm({...subForm, contact_name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className="w-full border rounded-lg px-3 py-2 text-sm" value={subForm.email} onChange={e => setSubForm({...subForm, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Phone</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={subForm.phone} onChange={e => setSubForm({...subForm, phone: e.target.value})} /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={subForm.status} onChange={e => setSubForm({...subForm, status: e.target.value})}>
                  <option value="pending">Pending Compliance</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowSubModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button disabled={saving} type="submit" className="cal-btn-primary">{saving ? 'Saving...' : 'Save Subcontractor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">Submit Invoice</h3>
            <form onSubmit={handleInvSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subcontractor *</label>
                <select required className="w-full border rounded-lg px-3 py-2 text-sm" value={invForm.subcontractor_id} onChange={e => setInvForm({...invForm, subcontractor_id: e.target.value})}>
                  <option value="">Select a vendor...</option>
                  {subcontractors.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Invoice #</label><input className="w-full border rounded-lg px-3 py-2 text-sm" value={invForm.invoice_number} onChange={e => setInvForm({...invForm, invoice_number: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Amount ($) *</label><input required type="number" step="0.01" min="0" className="w-full border rounded-lg px-3 py-2 text-sm" value={invForm.amount} onChange={e => setInvForm({...invForm, amount: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Notes</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-y" value={invForm.notes} onChange={e => setInvForm({...invForm, notes: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button disabled={saving} type="submit" className="cal-btn-primary">{saving ? 'Submitting...' : 'Submit to AP'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
