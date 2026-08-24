"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Loader2, Building, Mail, Phone, MapPin } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', type: 'commercial' });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (!error && data) setClients(data);
    else setClients([]);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const payload = {
      client_id: `CLI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      type: form.type,
      status: 'active'
    };
    
    const { error } = await supabase.from('clients').insert([payload]);
    if (!error) {
      fetchClients();
      setShowModal(false);
      setForm({ name: '', address: '', phone: '', email: '', type: 'commercial' });
    } else {
      console.error(error);
      alert("Error saving client: " + error.message + "\n\nMake sure you have run the fix_schema.sql and disable_rls_global.sql scripts in your Supabase SQL Editor!");
    }
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Client Directory</h1>
          <p className="text-slate-gray font-medium mt-1">Manage active and prospective clients</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
        ) : clients.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-gray">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No clients in directory.</p>
          </div>
        ) : clients.map(c => (
          <div key={c.id} className="cal-card p-6 flex flex-col hover:border-signal-blue/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-ink-navy text-lg">{c.name}</p>
                <p className="text-xs font-mono text-mist-gray mt-0.5">{c.client_id}</p>
              </div>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold capitalize">{c.type}</span>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-gray"><Mail className="w-4 h-4" /> {c.email}</div>
              <div className="flex items-center gap-2 text-sm text-slate-gray"><Phone className="w-4 h-4" /> {c.phone}</div>
              <div className="flex items-start gap-2 text-sm text-slate-gray"><MapPin className="w-4 h-4 shrink-0 mt-0.5" /> <span>{c.address}</span></div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-hairline flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {c.status || 'Active'}
              </span>
              <button className="text-sm font-semibold text-signal-blue hover:underline">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Client</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input required type="email" className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input required type="tel" className="w-full border rounded-lg px-3 py-2" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Client Type</label><select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="commercial">Commercial</option><option value="government">Government</option><option value="retail">Retail</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}