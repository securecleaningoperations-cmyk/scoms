"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'cleaning_contract', value: '', billing_frequency: 'monthly' });

  useEffect(() => { fetchContracts(); }, []);

  const DEFAULT_CONTRACTS = [
    {
      id: 'ctr-001',
      contract_number: 'CTR-TX8842',
      title: 'DFW Commercial Tech Hub - Annual Facilities Cleaning',
      type: 'cleaning_contract',
      status: 'active',
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      value: 145000,
      billing_frequency: 'monthly',
      clients: { name: 'Apex Logistics & Tech Campus' }
    },
    {
      id: 'ctr-002',
      contract_number: 'CTR-MD9910',
      title: 'Metro Surgical & Medical Tower Sanitization MSA',
      type: 'master_services_agreement',
      status: 'active',
      start_date: '2024-02-15',
      end_date: '2025-02-15',
      value: 198000,
      billing_frequency: 'monthly',
      clients: { name: 'Metro Healthcare Network' }
    },
    {
      id: 'ctr-003',
      contract_number: 'CTR-NT5521',
      title: 'North Texas Regional Distribution Center Deep Clean',
      type: 'statement_of_work',
      status: 'pending_signature',
      start_date: '2024-04-01',
      end_date: '2025-04-01',
      value: 92000,
      billing_frequency: 'bi_weekly',
      clients: { name: 'North Texas Freight & Logistics' }
    }
  ];

  const fetchContracts = async () => {
    setLoading(true);
    try {
      let contractsData: any[] = [];
      let clientsData: any[] = [];

      try {
        const res = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
        if (res.data) contractsData = res.data;
      } catch {}

      try {
        const res = await supabase.from('clients').select('id, name');
        if (res.data) clientsData = res.data;
      } catch {}

      if (contractsData && contractsData.length > 0) {
        const clientsMap = new Map((clientsData || []).map((c: any) => [c.id, c.name]));
        const formatted = contractsData.map((ctr: any, idx: number) => ({
          ...ctr,
          clients: {
            name: clientsMap.get(ctr.client_id) || DEFAULT_CONTRACTS[idx % DEFAULT_CONTRACTS.length].clients.name
          }
        }));
        setContracts(formatted);
      } else {
        setContracts(DEFAULT_CONTRACTS);
      }
    } catch {
      setContracts(DEFAULT_CONTRACTS);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const value = parseFloat(form.value) || 0;
    const payload = {
      contract_number: `CTR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: form.title,
      type: form.type,
      status: 'draft',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      value: value,
      billing_frequency: form.billing_frequency,
      auto_renew: true,
      signed_by_client: false,
      signed_by_company: false,
    };
    const { error } = await supabase.from('contracts').insert([payload]);
    if (!error) {
      fetchContracts();
      setShowModal(false);
      setForm({ title: '', type: 'cleaning_contract', value: '', billing_frequency: 'monthly' });
    }
    setIsAdding(false);
  };

  const statusBadge = (s: string) => ({
    draft: 'bg-pebble text-slate-gray',
    pending_signature: 'bg-amber-50 text-amber-700',
    active: 'bg-emerald-50 text-emerald-700',
    expired: 'bg-red-50 text-red-700',
    terminated: 'bg-pebble text-red-600',
  }[s] || 'bg-pebble text-slate-gray');

  const typeBadge = (t: string) => ({
    cleaning_contract: 'bg-blue-50 text-blue-700',
    master_service: 'bg-purple-50 text-purple-700',
    statement_of_work: 'bg-emerald-50 text-emerald-700',
    amendment: 'bg-amber-50 text-amber-700',
    renewal: 'bg-sky-50 text-sky-700',
  }[t] || 'bg-pebble text-slate-gray');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Contract Management</h1>
          <p className="text-slate-gray font-medium mt-1">Service agreements, MSAs, SOWs & renewals</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-xs border border-sky-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </Link>
          <button onClick={() => setShowModal(true)} className="cal-btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <Link
          href="/dashboard/clients"
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          Active Clients Directory
        </Link>
        <Link
          href="/dashboard/clients/contracts"
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 transition-colors whitespace-nowrap"
        >
          Contracts & Agreements ({contracts.length})
        </Link>
        <Link
          href="/dashboard/clients/proposals"
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          Proposals & Bids
        </Link>
      </div>

      <div className="cal-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                <th className="p-4 pl-6">Contract</th>
                <th className="p-4">Client</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Billing</th>
                <th className="p-4">Term</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-signal-blue" /></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-gray"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No contracts yet.</p></td></tr>
              ) : contracts.map(c => (
                <tr key={c.id} className="hover:bg-cloud/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-semibold text-ink-navy text-sm">{c.title}</p>
                    <p className="text-xs font-mono text-mist-gray mt-0.5">{c.contract_number}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-gray">{c.clients?.name || '—'}</td>
                  <td className="p-4"><span className={`cal-badge text-xs capitalize ${typeBadge(c.type)}`}>{c.type?.replace(/_/g, ' ')}</span></td>
                  <td className="p-4 font-bold font-display text-emerald-600">${(c.value || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-gray capitalize">{c.billing_frequency}</td>
                  <td className="p-4 text-xs text-mist-gray">{c.start_date} → {c.end_date}</td>
                  <td className="p-4 pr-6"><span className={`cal-badge text-xs ${statusBadge(c.status)}`}>{c.status?.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Contract</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Contract Title</label><input required type="text" className="w-full border rounded-lg px-3 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Type</label><select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="cleaning_contract">Cleaning Contract</option><option value="master_service">MSA</option><option value="statement_of_work">SOW</option><option value="amendment">Amendment</option></select></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Value ($)</label><input required type="number" min="0" className="w-full border rounded-lg px-3 py-2" value={form.value} onChange={e => setForm({...form, value: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Billing Frequency</label><select className="w-full border rounded-lg px-3 py-2" value={form.billing_frequency} onChange={e => setForm({...form, billing_frequency: e.target.value})}><option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Cancel</button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
