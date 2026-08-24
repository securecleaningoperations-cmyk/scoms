"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, DollarSign } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', amount: '', due_date: '', status: 'pending' });

  useEffect(() => { 
    fetchInvoices(); 
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false });
    if (!error && data) setInvoices(data);
    else setInvoices([]);
    setLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    if (data) setClients(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const amount = parseFloat(form.amount) || 0;
    const tax = amount * 0.08;
    const total = amount + tax;

    const payload = {
      invoice_number: `INV-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      client_id: form.client_id || null, // Ensure a real client ID is selected in a full implementation
      amount: amount,
      tax: tax,
      total: total,
      due_date: form.due_date,
      status: form.status
    };
    
    const { error } = await supabase.from('invoices').insert([payload]);
    if (!error) {
      fetchInvoices();
      setShowModal(false);
      setForm({ client_id: '', amount: '', due_date: '', status: 'pending' });
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Invoice Management</h1>
          <p className="text-slate-gray font-medium mt-1">Track and manage client billing</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Invoice #</th>
                <th className="p-4">Client</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-gray"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No invoices yet.</p></td></tr>
              ) : invoices.map(i => (
                <tr key={i.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6 font-mono text-sm text-mist-gray">{i.invoice_number}</td>
                  <td className="p-4 font-semibold text-ink-navy">{i.clients?.name || 'Unassigned'}</td>
                  <td className="p-4 font-bold text-emerald-600">${(i.total || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-gray">{new Date(i.due_date).toLocaleDateString()}</td>
                  <td className="p-4 capitalize"><span className={`px-2 py-1 rounded text-xs font-semibold ${i.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Invoice</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select required className="w-full border rounded-lg px-3 py-2" value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Amount ($)</label>
                <input required type="number" min="0" step="0.01" className="w-full border rounded-lg px-3 py-2" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                <p className="text-xs text-slate-500 mt-1">8% tax will be added automatically.</p>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label><input required type="date" className="w-full border rounded-lg px-3 py-2" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="pending">Pending</option><option value="paid">Paid</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
