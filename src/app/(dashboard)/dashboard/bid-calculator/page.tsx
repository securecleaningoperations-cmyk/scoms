"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { calculateBid, getBidRequests, createBidRequest, getLaborRateCards, approveBidVersion } from "@/lib/services/bidCalculator";
import { Calculator, Plus, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, TrendingUp, Loader2, X, DollarSign, Layers, Info } from "lucide-react";

type BidSummary = {
  bid_request_id: string; title: string; request_status: string;
  bid_version_id: string | null; version_number: number | null;
  recommended_bid_per_month: number | null; min_bid_per_month: number | null;
  premium_bid_per_month: number | null; annual_value: number | null;
  target_margin_pct: number | null; underbid_warning: boolean | null;
  overbid_warning: boolean | null; version_status: string | null;
  calculated_at: string | null; lead_name: string | null; client_name: string | null;
};

const EMPTY_CALC = {
  cleanable_sqft: '', frequency: 'weekly', visits_per_month: '4',
  labor_hours_per_visit: '', labor_rate_per_hour: '', burden_rate_pct: '30',
  supply_cost_per_month: '', equipment_cost_per_month: '0',
  overhead_pct: '15', insurance_pct: '5', target_margin_pct: '20',
};

export default function BidCalculatorPage() {
  const [bids, setBids] = useState<BidSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [activeBidId, setActiveBidId] = useState<string | null>(null);
  const [activeBidTitle, setActiveBidTitle] = useState('');
  const [calc, setCalc] = useState(EMPTY_CALC);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [newReqForm, setNewReqForm] = useState({ title: '', lead_id: '', client_id: '' });
  const [approving, setApproving] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bidsRes, ratesRes, leadsRes, clientsRes] = await Promise.all([
        getBidRequests().catch((e) => { console.error('bids error', e); return []; }),
        getLaborRateCards().catch((e) => { console.error('rates error', e); return []; }),
        supabase.from('leads').select('id,company_name').order('created_at', { ascending: false }).limit(50).then(r => r.data || []),
        supabase.from('clients').select('id,name').order('name').limit(100).then(r => r.data || []),
      ]);
      setBids(bidsRes);
      setRateCards(ratesRes);
      setLeads(leadsRes);
      setClients(clientsRes);
    } catch (e) {
      console.error('Fetch all failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBidRequest({
      title: newReqForm.title,
      lead_id: newReqForm.lead_id || undefined,
      client_id: newReqForm.client_id || undefined,
    });
    setShowNewRequest(false);
    setNewReqForm({ title: '', lead_id: '', client_id: '' });
    fetchAll();
  };

  const runCalculation = async () => {
    if (!activeBidId) return;
    setIsCalculating(true);
    setCalcResult(null);
    try {
      const result = await calculateBid({
        bid_request_id: activeBidId,
        cleanable_sqft: parseInt(calc.cleanable_sqft) || 0,
        frequency: calc.frequency,
        visits_per_month: parseFloat(calc.visits_per_month) || 4,
        labor_hours_per_visit: parseFloat(calc.labor_hours_per_visit) || 0,
        labor_rate_per_hour: parseFloat(calc.labor_rate_per_hour) || 0,
        burden_rate_pct: parseFloat(calc.burden_rate_pct) || 30,
        supply_cost_per_month: parseFloat(calc.supply_cost_per_month) || 0,
        equipment_cost_per_month: parseFloat(calc.equipment_cost_per_month) || 0,
        overhead_pct: parseFloat(calc.overhead_pct) || 15,
        insurance_pct: parseFloat(calc.insurance_pct) || 5,
        target_margin_pct: parseFloat(calc.target_margin_pct) || 20,
      });
      setCalcResult(result);
    } catch (err: any) {
      alert('Calculation error: ' + err.message);
    }
    setIsCalculating(false);
  };

  const handleApprove = async (bidVersionId: string) => {
    setApproving(bidVersionId);
    await approveBidVersion(bidVersionId);
    setApproving(null);
    fetchAll();
  };

  const fmt = (v: number | null) => v != null ? `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  const pct = (v: number | null) => v != null ? `${v.toFixed(1)}%` : '—';

  const inp = (key: keyof typeof calc, label: string, type = 'number', prefix?: string) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
        <input
          type={type}
          min="0"
          step="any"
          value={calc[key]}
          onChange={e => setCalc(p => ({ ...p, [key]: e.target.value }))}
          className={`w-full border border-slate-200 rounded-lg py-2 text-sm focus:outline-none focus:border-blue-500 ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 font-sans pb-24 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-100 rounded-lg"><Calculator className="w-6 h-6 text-emerald-600" /></div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Bid Calculator</h1>
          </div>
          <p className="text-slate-500 font-medium">Production pricing engine — every calculation stored and auditable.</p>
        </div>
        <button onClick={() => setShowNewRequest(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm">
          <Plus className="w-4 h-4" /> New Bid Request
        </button>
      </div>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Requests', val: bids.length.toString(), color: 'text-slate-900' },
            { label: 'Approved Bids', val: bids.filter(b => b.version_status === 'approved').length.toString(), color: 'text-emerald-600' },
            { label: 'Underbid Warnings', val: bids.filter(b => b.underbid_warning).length.toString(), color: 'text-red-600' },
            { label: 'Total Pipeline Value', val: fmt(bids.reduce((s, b) => s + (b.annual_value ?? 0), 0)), color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bid Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Bid Requests</h2>
          <span className="text-xs text-slate-400 font-medium">{bids.length} records from Supabase</span>
        </div>
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : bids.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Calculator className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold">No bid requests yet.</p>
            <p className="text-sm mt-1">Click "New Bid Request" to start your first calculation.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bids.map(bid => (
              <div key={bid.bid_request_id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900 truncate">{bid.title}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        bid.request_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        bid.request_status === 'calculating' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'}`}>
                        {bid.request_status}
                      </span>
                      {bid.underbid_warning && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Underbid Risk
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bid.lead_name ?? bid.client_name ?? 'No account linked'} 
                      {bid.calculated_at && ` · Calculated ${new Date(bid.calculated_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    {bid.recommended_bid_per_month && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Recommended/mo</p>
                        <p className="text-base font-bold text-slate-900">{fmt(bid.recommended_bid_per_month)}</p>
                      </div>
                    )}
                    {bid.annual_value && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Annual Value</p>
                        <p className="text-base font-bold text-emerald-600">{fmt(bid.annual_value)}</p>
                      </div>
                    )}
                    {bid.target_margin_pct && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Target Margin</p>
                        <p className="text-base font-bold text-blue-600">{pct(bid.target_margin_pct)}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setActiveBidId(bid.bid_request_id); setActiveBidTitle(bid.title); setCalcResult(null); setCalc(EMPTY_CALC); setShowCalcModal(true); }}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Calculate
                      </button>
                      {bid.bid_version_id && bid.version_status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(bid.bid_version_id!)}
                          disabled={approving === bid.bid_version_id}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
                          {approving === bid.bid_version_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Approve
                        </button>
                      )}
                      <button onClick={() => setExpandedId(expandedId === bid.bid_request_id ? null : bid.bid_request_id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                        {expandedId === bid.bid_request_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Expanded Row */}
                {expandedId === bid.bid_request_id && bid.recommended_bid_per_month && (
                  <div className="px-6 pb-5 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      {[
                        { label: 'Minimum Bid/mo', val: fmt(bid.min_bid_per_month), note: 'Floor (5% above cost)' },
                        { label: 'Recommended/mo', val: fmt(bid.recommended_bid_per_month), note: `${pct(bid.target_margin_pct)} margin` },
                        { label: 'Premium/mo', val: fmt(bid.premium_bid_per_month), note: '+15% over recommended' },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                          <p className="text-xs text-slate-400 font-semibold mb-1">{s.label}</p>
                          <p className="text-xl font-bold text-slate-900">{s.val}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{s.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Bid Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">New Bid Request</h3>
              <button onClick={() => setShowNewRequest(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Request Title <span className="text-red-500">*</span></label>
                <input required type="text" value={newReqForm.title} onChange={e => setNewReqForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. ABC Corp Office Cleaning Bid"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Lead (optional)</label>
                <select value={newReqForm.lead_id} onChange={e => setNewReqForm(p => ({ ...p, lead_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">Select a lead...</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Client (optional)</label>
                <select value={newReqForm.client_id} onChange={e => setNewReqForm(p => ({ ...p, client_id: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewRequest(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculation Modal */}
      {showCalcModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Run Calculation</h3>
                <p className="text-xs text-slate-400">{activeBidTitle}</p>
              </div>
              <button onClick={() => { setShowCalcModal(false); setCalcResult(null); }}><X className="w-5 h-5 text-slate-400 hover:text-slate-900" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Rate Card Picker */}
              {rateCards.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Select a rate card to auto-fill labor rate</p>
                  <select onChange={e => {
                    const card = rateCards.find(r => r.id === e.target.value);
                    if (card) setCalc(p => ({ ...p, labor_rate_per_hour: card.hourly_rate.toString(), burden_rate_pct: card.burden_rate_pct.toString() }));
                  }} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
                    <option value="">Choose rate card...</option>
                    {rateCards.map(r => <option key={r.id} value={r.id}>{r.name} — ${r.hourly_rate}/hr</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {inp('cleanable_sqft', 'Cleanable Sqft *')}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                  <select value={calc.frequency} onChange={e => setCalc(p => ({ ...p, frequency: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                    {['daily','weekly','biweekly','monthly','custom'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                {inp('visits_per_month', 'Visits/Month *')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {inp('labor_hours_per_visit', 'Labor Hrs/Visit *')}
                {inp('labor_rate_per_hour', 'Labor Rate/Hr *', 'number', '$')}
                {inp('burden_rate_pct', 'Burden Rate %')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {inp('supply_cost_per_month', 'Supplies/Mo *', 'number', '$')}
                {inp('equipment_cost_per_month', 'Equipment/Mo', 'number', '$')}
                {inp('overhead_pct', 'Overhead %')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {inp('insurance_pct', 'Insurance %')}
                {inp('target_margin_pct', 'Target Margin %')}
              </div>

              <button onClick={runCalculation} disabled={isCalculating || !calc.cleanable_sqft || !calc.labor_hours_per_visit || !calc.labor_rate_per_hour}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
                {isCalculating ? 'Calculating...' : 'Calculate & Save to Database'}
              </button>

              {/* Results */}
              {calcResult && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Minimum/mo', val: fmt(calcResult.min_bid_per_month), color: 'bg-slate-50 border-slate-200' },
                      { label: 'Recommended/mo', val: fmt(calcResult.recommended_bid_per_month), color: 'bg-emerald-50 border-emerald-200' },
                      { label: 'Premium/mo', val: fmt(calcResult.premium_bid_per_month), color: 'bg-blue-50 border-blue-200' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                        <p className="text-xs font-semibold text-slate-500 mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-slate-900">{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-medium">Annual Value</p>
                      <p className="text-lg font-bold text-emerald-600">{fmt(calcResult.annual_value)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-medium">Total Cost/mo</p>
                      <p className="text-lg font-bold text-slate-700">{fmt(calcResult.total_cost_per_month)}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 font-medium">Version</p>
                      <p className="text-lg font-bold text-slate-700">v{calcResult.version_number}</p>
                    </div>
                  </div>
                  {calcResult.underbid_warning && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm font-semibold text-red-700">Underbid Warning: Margin below 10%. Review pricing before approval.</p>
                    </div>
                  )}
                  {calcResult.overbid_warning && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <p className="text-sm font-semibold text-amber-700">Overbid Warning: Margin exceeds 50%. Verify competitiveness.</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={async () => { await approveBidVersion(calcResult.id); setShowCalcModal(false); fetchAll(); }}
                      className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve This Version
                    </button>
                    <button onClick={() => { setCalcResult(null); }}
                      className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50">
                      Recalculate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
