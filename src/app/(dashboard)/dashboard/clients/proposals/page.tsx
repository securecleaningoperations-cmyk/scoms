"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, Eye, Send, CheckCircle2, XCircle } from "lucide-react";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchProposals(); }, []);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('proposals').select('*, leads(company_name), clients(name)').order('created_at', { ascending: false });
    if (!error && data) setProposals(data);
    else setProposals([]);
    setLoading(false);
  };

  const [form, setForm] = useState({ title: '', basePrice: '' });
  const [showModal, setShowModal] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const silverBase = parseFloat(form.basePrice) || 1500;
    const payload = {
      proposal_number: `PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: form.title,
      status: 'draft',
      silver_price: silverBase,
      gold_price: silverBase * 1.4,
      platinum_price: silverBase * 1.8,
      silver_details: {
        tier: "Silver",
        frequency: "Weekly",
        services: ["General cleaning", "Restroom sanitation", "Trash removal"],
        staff: 2,
      },
      gold_details: {
        tier: "Gold (Recommended)",
        frequency: "3x/week",
        services: ["Deep cleaning", "Floor care", "Window cleaning", "Restroom sanitation", "Trash removal"],
        staff: 3,
      },
      platinum_details: {
        tier: "Platinum",
        frequency: "Daily",
        services: ["Premium deep cleaning", "Floor care & buffing", "Window cleaning", "Restroom sanitation", "Trash removal", "Carpet care", "Dedicated account manager"],
        staff: 4,
      },
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    const { error } = await supabase.from('proposals').insert([payload]);
    if (!error) {
      fetchProposals();
      setShowModal(false);
      setForm({ title: '', basePrice: '' });
    }
    setIsAdding(false);
  };

  const statusBadge = (s: string) => ({
    draft: 'bg-pebble text-slate-gray',
    sent: 'bg-blue-50 text-blue-700',
    viewed: 'bg-purple-50 text-purple-700',
    accepted: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    expired: 'bg-amber-50 text-amber-700',
  }[s] || 'bg-pebble text-slate-gray');

  const conversionRate = proposals.length
    ? Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100)
    : 0;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Proposal System</h1>
          <p className="text-slate-gray font-medium mt-1">3-tier packages: Silver · Gold · Platinum</p>
        </div>
        <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: "Total Proposals", value: proposals.length },
          { label: "Accepted", value: proposals.filter(p => p.status === 'accepted').length },
          { label: "Pending", value: proposals.filter(p => ['sent', 'viewed', 'draft'].includes(p.status)).length },
          { label: "Conversion Rate", value: `${conversionRate}%` },
        ].map(m => (
          <div key={m.label} className="cal-card p-6">
            <FileText className="w-5 h-5 text-signal-blue mb-3" />
            <p className="text-sm text-slate-gray">{m.label}</p>
            <p className="text-3xl font-bold text-ink-navy font-display mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
        ) : proposals.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-gray">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No proposals yet. Create your first one.</p>
          </div>
        ) : proposals.map(p => (
          <div key={p.id} className="cal-card p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-ink-navy">{p.title}</p>
                <p className="text-xs font-mono text-mist-gray mt-0.5">{p.proposal_number}</p>
              </div>
              <span className={`cal-badge text-xs capitalize ${statusBadge(p.status)}`}>{p.status}</span>
            </div>

            <p className="text-sm text-slate-gray mb-4">{p.leads?.company_name || p.clients?.name || 'Unassigned'}</p>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { tier: "Silver", price: p.silver_price, color: "border-slate-300 bg-slate-50" },
                { tier: "Gold ★", price: p.gold_price, color: "border-signal-blue bg-signal-blue/5", highlight: true },
                { tier: "Platinum", price: p.platinum_price, color: "border-purple-300 bg-purple-50" },
              ].map(tier => (
                <div key={tier.tier} className={`rounded-xl border p-3 text-center ${tier.color} ${tier.highlight ? 'ring-1 ring-signal-blue' : ''}`}>
                  <p className={`text-xs font-bold ${tier.highlight ? 'text-signal-blue' : 'text-slate-gray'}`}>{tier.tier}</p>
                  <p className="font-bold text-ink-navy text-sm mt-1">${(tier.price || 0).toLocaleString()}<span className="text-xs font-normal text-mist-gray">/mo</span></p>
                </div>
              ))}
            </div>

            {p.selected_tier && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700 capitalize">Selected: {p.selected_tier}</span>
              </div>
            )}

            <div className="mt-auto flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold border border-hairline rounded-lg text-slate-gray hover:bg-pebble transition-colors">
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              {p.status === 'draft' && (
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold bg-signal-blue text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Proposal</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Proposal Title</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Base Price (Silver Tier)</label><input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
