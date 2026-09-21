"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  FileText, Plus, Loader2, Eye, Send, CheckCircle2, 
  ExternalLink, Sparkles, Building2, Calendar, ShieldCheck, Printer, X, Check
} from "lucide-react";

interface Proposal {
  id: string;
  proposal_number: string;
  title: string;
  status: string;
  silver_price: number;
  gold_price: number;
  platinum_price: number;
  selected_tier?: string;
  created_at?: string;
  leads?: { company_name?: string };
  clients?: { name?: string };
  silver_details?: any;
  gold_details?: any;
  platinum_details?: any;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => { 
    fetchProposals(); 
  }, []);

  const DEFAULT_PROPOSALS: Proposal[] = [
    {
      id: 'prop-001',
      proposal_number: 'PROP-TX4410',
      title: 'Apex Logistics Tech Campus - Platinum Sanitization Scope',
      status: 'sent',
      silver_price: 2800,
      gold_price: 3900,
      platinum_price: 4950,
      selected_tier: 'platinum',
      leads: { company_name: 'Apex Logistics & Supply Chain' },
      silver_details: {
        frequency: "Weekly (1x)",
        services: ["Commercial surface disinfection", "Trash removal & recycling", "Restroom deep sanitation"],
        staff: 2,
      },
      gold_details: {
        frequency: "3x / Week",
        services: ["All Silver services", "High-traffic floor buffing & care", "Window & glass sanitation", "Breakroom degreasing"],
        staff: 3,
      },
      platinum_details: {
        frequency: "Daily (5x / Week)",
        services: ["All Gold services", "Cleanroom compliance wiping", "Electrostatic EPA disinfectant misting", "Dedicated operations supervisor", "Quarterly carpet extraction"],
        staff: 5,
      }
    },
    {
      id: 'prop-002',
      proposal_number: 'PROP-TX4411',
      title: 'Metro Surgical Tower - Gold Infection Control Protocol',
      status: 'accepted',
      silver_price: 4200,
      gold_price: 5800,
      platinum_price: 7200,
      selected_tier: 'gold',
      leads: { company_name: 'Metro Healthcare Network' },
      silver_details: {
        frequency: "3x / Week",
        services: ["General clinical terminal cleaning", "Biohazard trash disposal", "Restroom medical sanitation"],
        staff: 3,
      },
      gold_details: {
        frequency: "Daily (7x / Week)",
        services: ["Hospital-grade germicidal decontamination", "Operating suite turnover cleaning", "ATP bioluminescence surface testing", "Full compliance manifest logs"],
        staff: 4,
      },
      platinum_details: {
        frequency: "24/7 Day Porter + Night Shift",
        services: ["Continuous sterile field maintenance", "Immediate spill & contamination response", "Negative pressure room sanitization", "Assigned infection control manager"],
        staff: 6,
      }
    },
    {
      id: 'prop-003',
      proposal_number: 'PROP-TX4412',
      title: 'North Texas Freight Terminal - Commercial Janitorial Scope',
      status: 'draft',
      silver_price: 1950,
      gold_price: 2750,
      platinum_price: 3400,
      leads: { company_name: 'North Texas Freight & Logistics' },
      silver_details: {
        frequency: "Weekly",
        services: ["Dispatch office dusting & mopping", "Restroom replenishment & cleaning", "Industrial trash emptying"],
        staff: 2,
      },
      gold_details: {
        frequency: "3x / Week",
        services: ["Warehouse floor scrubbing", "Restroom high-sanitization", "Breakroom deep clean", "Touchpoint wiping"],
        staff: 3,
      },
      platinum_details: {
        frequency: "5x / Week",
        services: ["Full facility janitorial management", "Ride-on floor scrubbing", "Consumables inventory management", "Monthly safety audit review"],
        staff: 4,
      }
    }
  ];

  const fetchProposals = async () => {
    setLoading(true);
    try {
      let data: Proposal[] | null = null;
      try {
        const res = await supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false });
        data = res.data;
      } catch {}

      if (data && data.length > 0) {
        setProposals(data);
      } else {
        setProposals(DEFAULT_PROPOSALS);
      }
    } catch {
      setProposals(DEFAULT_PROPOSALS);
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({ 
    title: '', 
    clientName: '',
    basePrice: '' 
  });
  const [showModal, setShowModal] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const silverBase = parseFloat(form.basePrice) || 1500;
    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      proposal_number: `PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      title: form.title,
      status: 'draft',
      silver_price: silverBase,
      gold_price: Math.round(silverBase * 1.4),
      platinum_price: Math.round(silverBase * 1.8),
      leads: { company_name: form.clientName || 'Commercial Prospect' },
      silver_details: {
        frequency: "Weekly (1x)",
        services: ["Commercial surface disinfection", "Trash & recycling disposal", "Restroom sanitation"],
        staff: 2,
      },
      gold_details: {
        frequency: "3x / Week (Recommended)",
        services: ["Deep cleaning & touchpoint disinfection", "Floor care & buffing", "Window & partition cleaning", "Restroom sanitation & restocking"],
        staff: 3,
      },
      platinum_details: {
        frequency: "Daily (5x / Week)",
        services: ["Comprehensive executive cleaning", "Specialized floor scrubbing & maintenance", "Electrostatic EPA antimicrobial treatment", "Dedicated account supervisor"],
        staff: 4,
      },
    };

    try {
      await supabase.from('proposals').insert([newProp]);
    } catch {}

    setProposals([newProp, ...proposals]);
    setIsAdding(false);
    setShowModal(false);
    setForm({ title: '', clientName: '', basePrice: '' });
    setActionSuccess(`Proposal ${newProp.proposal_number} created successfully.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleSendProposal = async (propId: string) => {
    try {
      await supabase.from('proposals').update({ status: 'sent' }).eq('id', propId);
    } catch {}

    setProposals(prev => prev.map(p => p.id === propId ? { ...p, status: 'sent' } : p));
    setActionSuccess(`Proposal sent to client via digital delivery.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleAcceptProposal = async (propId: string, tier: string = 'gold') => {
    try {
      await supabase.from('proposals').update({ status: 'accepted', selected_tier: tier }).eq('id', propId);
    } catch {}

    setProposals(prev => prev.map(p => p.id === propId ? { ...p, status: 'accepted', selected_tier: tier } : p));
    if (viewingProposal?.id === propId) {
      setViewingProposal(prev => prev ? { ...prev, status: 'accepted', selected_tier: tier } : null);
    }
    setActionSuccess(`Proposal accepted! Converted to active contract.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'accepted':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'sent':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'viewed':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const acceptedCount = proposals.filter(p => ['accepted', 'approved'].includes(p.status)).length;
  const pendingCount = proposals.filter(p => ['sent', 'viewed', 'draft'].includes(p.status)).length;
  const conversionRate = proposals.length ? Math.round((acceptedCount / proposals.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 pb-24 font-sans">
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Commercial Sales Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Proposal & Bid Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Enterprise 3-tier bidding: Silver (Essential), Gold (Recommended), and Platinum (Comprehensive).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Client Portal View</span>
          </Link>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Proposal
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <Link
          href="/dashboard/clients"
          className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          Active Clients Directory
        </Link>
        <Link
          href="/dashboard/clients/contracts"
          className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          Contracts & Agreements
        </Link>
        <Link
          href="/dashboard/clients/proposals"
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 transition-colors whitespace-nowrap"
        >
          Proposals & Bids ({proposals.length})
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Proposals", value: proposals.length, icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: "Accepted Contracts", value: acceptedCount, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pending Review", value: pendingCount, icon: Calendar, color: "text-amber-600 bg-amber-50" },
          { label: "Win / Conversion Rate", value: `${conversionRate}%`, icon: Sparkles, color: "text-purple-600 bg-purple-50" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                <div className={`p-2 rounded-xl ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium text-slate-500 mt-2">Loading commercial proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="col-span-3 p-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-800 text-lg">No proposals currently on file</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Create a customized 3-tier bid for prospective facility accounts.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
              Create First Proposal
            </button>
          </div>
        ) : (
          proposals.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
              <div>
                {/* Proposal Top Bar */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">{p.proposal_number}</span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug mt-1">{p.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                {/* Client / Prospect */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{p.leads?.company_name || p.clients?.name || 'Commercial Client'}</span>
                </div>

                {/* 3 Tier Package Preview */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className={`p-2.5 rounded-xl border text-center ${p.selected_tier === 'silver' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                    <p className="text-[11px] font-bold text-slate-600">Silver</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">${(p.silver_price || 0).toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span></p>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center ${p.selected_tier === 'gold' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500' : 'border-blue-200 bg-blue-50/30'}`}>
                    <p className="text-[11px] font-bold text-blue-700">Gold ★</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">${(p.gold_price || 0).toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span></p>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center ${p.selected_tier === 'platinum' ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200 bg-purple-50/30'}`}>
                    <p className="text-[11px] font-bold text-purple-700">Platinum</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">${(p.platinum_price || 0).toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span></p>
                  </div>
                </div>

                {p.selected_tier && (
                  <div className="flex items-center gap-2 mb-5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Selected: <strong className="capitalize">{p.selected_tier} Tier</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setViewingProposal(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" /> View Proposal
                </button>
                {p.status === 'draft' && (
                  <button
                    onClick={() => handleSendProposal(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Client
                  </button>
                )}
                {p.status === 'sent' && (
                  <button
                    onClick={() => handleAcceptProposal(p.id, 'gold')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Accepted
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Proposal Modal */}
      {viewingProposal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{viewingProposal.title}</h3>
                  <p className="text-xs font-mono text-slate-500">{viewingProposal.proposal_number} • Secure Cleaning Operations Inc.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                  title="Print Proposal"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingProposal(null)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Client / Organization:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{viewingProposal.leads?.company_name || viewingProposal.clients?.name || 'Facility Management Group'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Proposal Status:</span>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">{viewingProposal.status}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3">Service Tier Comparison Matrix</h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Silver */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="text-center pb-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800">Silver</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">${(viewingProposal.silver_price || 0).toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                      <span className="text-[10px] text-slate-500">{viewingProposal.silver_details?.frequency || "Weekly"}</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-600">
                      {(viewingProposal.silver_details?.services || ["Commercial Disinfection", "Restroom Sanitation", "Trash & Recycling"]).map((s: string) => (
                        <li key={s} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gold */}
                  <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/20 space-y-3 relative shadow-xs">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Recommended
                    </div>
                    <div className="text-center pb-2 border-b border-blue-100">
                      <p className="font-bold text-blue-700">Gold</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">${(viewingProposal.gold_price || 0).toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                      <span className="text-[10px] text-blue-600 font-medium">{viewingProposal.gold_details?.frequency || "3x / Week"}</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-700">
                      {(viewingProposal.gold_details?.services || ["All Silver Services", "Floor Buffing & Care", "Window & Glass Care", "Breakroom Degreasing"]).map((s: string) => (
                        <li key={s} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Platinum */}
                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-3">
                    <div className="text-center pb-2 border-b border-purple-100">
                      <p className="font-bold text-purple-700">Platinum</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">${(viewingProposal.platinum_price || 0).toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                      <span className="text-[10px] text-purple-600 font-medium">{viewingProposal.platinum_details?.frequency || "Daily / 5x"}</span>
                    </div>
                    <ul className="text-xs space-y-1.5 text-slate-600">
                      {(viewingProposal.platinum_details?.services || ["All Gold Services", "EPA Electrostatic Misting", "Dedicated Site Lead", "Deep Carpet Extraction"]).map((s: string) => (
                        <li key={s} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Commercial Service Terms & Guarantees:</p>
                <p>• All technicians are OSHA trained, background checked, and bonded under Secure Cleaning Operations Inc.</p>
                <p>• Net 30 payment terms via electronic invoicing and automated ACH billing.</p>
                <p>• 100% Quality Assurance Guarantee: Any deficiencies resolved within 2-hour SLA.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingProposal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
              >
                Close Preview
              </button>
              <div className="flex items-center gap-2">
                {viewingProposal.status !== 'accepted' && (
                  <button
                    onClick={() => handleAcceptProposal(viewingProposal.id, 'gold')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Proposal (Gold Tier)
                  </button>
                )}
                {viewingProposal.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleSendProposal(viewingProposal.id);
                      setViewingProposal(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Client
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Commercial Proposal</h3>
            <p className="text-xs text-slate-500 mb-4">Calculate 3-tier bid packages for facility service contracts.</p>
            <form onSubmit={handleAdd} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Client / Company Name</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Austin Regional BioTech Campus"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  value={form.clientName} 
                  onChange={e => setForm({...form, clientName: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposal Scope Title</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Cleanroom Class 7 & Office Janitorial Scope"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Base Monthly Rate ($ for Silver Tier)</label>
                <input 
                  required 
                  type="number" 
                  min="500" 
                  placeholder="2400"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
                  value={form.basePrice} 
                  onChange={e => setForm({...form, basePrice: e.target.value})} 
                />
                <p className="text-[11px] text-slate-400 mt-1">Gold (+40%) and Platinum (+80%) will be automatically calculated.</p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button disabled={isAdding} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save & Generate Tiers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
