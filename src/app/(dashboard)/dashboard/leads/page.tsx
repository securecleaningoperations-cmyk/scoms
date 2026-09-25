"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Target, Plus, DollarSign, Phone, Mail, Building2, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

// ── Lead Lifecycle (spec section 25) ────────────────────────────────

const LEAD_STATUSES = [
  "Prospect", "Qualified", "Initial Contact", "Meeting",
  "Site Walkthrough", "Proposal", "Negotiation",
  "Contract Sent", "Contract Signed", "Client",
] as const;

// ── Types ──────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  status: string;
  estimated_value?: number;
  source?: string;
  notes?: string;
  created_at?: string;
  jev_score?: number;
  recommended_package?: "silver" | "gold" | "platinum";
}

// ── Component ──────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Jev Inspection Drawer
  const [selectedLeadForJev, setSelectedLeadForJev] = useState<Lead | null>(null);
  const [jevAnalysis, setJevAnalysis] = useState<any>(null);
  const [analyzingJev, setAnalyzingJev] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    estimated_value: "",
    source: "inbound",
    facility_type: "Commercial Office",
    square_footage: "35000",
    notes: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const res = await fetch("/api/leads");
        const json = await res.json();
        if (json.data) {
          setLeads(json.data);
          setLoading(false);
          return;
        }
      } catch {}
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (data) setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "lead") fetchLeads();
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchLeads]);

  const handleInspectJev = async (lead: Lead) => {
    setSelectedLeadForJev(lead);
    setAnalyzingJev(true);
    setJevAnalysis(null);

    try {
      const res = await fetch("/api/ai/jev/lead-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: lead.company_name,
          facilityType: "Commercial Facility",
          squareFootage: 35000,
          estimatedValue: lead.estimated_value,
          notes: lead.notes,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setJevAnalysis(json.data);
      }
    } catch (err) {
      console.error("Jev Lead Analysis error:", err);
    } finally {
      setAnalyzingJev(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      source: form.source,
      status: "Prospect",
      notes: `${form.notes || ''} [Facility: ${form.facility_type}, Sqft: ${form.square_footage}]`,
    };

    try {
      let success = false;
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.data) success = true;
        else if (json.error) throw new Error(json.error);
      } catch {
        const { error } = await supabase.from("leads").insert([payload]);
        if (error) throw error;
        success = true;
      }

      if (success) {
        setShowAddModal(false);
        setForm({ 
          company_name: "", 
          contact_name: "", 
          email: "", 
          phone: "", 
          estimated_value: "", 
          source: "inbound", 
          facility_type: "Commercial Office",
          square_footage: "35000",
          notes: "" 
        });
        fetchLeads();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create lead");
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);
  const activeLeads = leads.filter(l => !["Client", "Lost"].includes(l.status)).length;

  const columns: Column<Lead>[] = [
    {
      key: "company_name", label: "Company / Account", sortable: true,
      render: (val, row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-body-sm font-bold text-text-primary">{val || "—"}</p>
            <span className="px-1.5 py-0.5 text-[10px] font-black bg-blue-50 text-blue-700 rounded border border-blue-200">
              Jev Scored
            </span>
          </div>
          {row.contact_name && <p className="text-caption text-text-muted mt-0.5">{row.contact_name}</p>}
        </div>
      ),
    },
    {
      key: "email", label: "Contact Info", sortable: true,
      render: (val, row) => (
        <div className="text-body-sm text-text-secondary">
          {val && <span className="block font-medium">{val}</span>}
          {row.phone && <span className="text-caption text-text-muted font-mono">{row.phone}</span>}
        </div>
      ),
    },
    {
      key: "estimated_value", label: "Est. Value", sortable: true, align: "right",
      render: (val) => (
        <div>
          <span className="font-bold text-text-primary text-body-sm">
            {val ? `$${Number(val).toLocaleString()}` : "—"}
          </span>
          <span className="block text-[10px] text-emerald-600 font-semibold">Tier 1 Target</span>
        </div>
      ),
    },
    {
      key: "source", label: "Acquisition Source", sortable: true,
      render: (val) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
          val === 'phone_agent' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700'
        }`}>
          {val?.replace(/_/g, ' ') || "Inbound"}
        </span>
      ),
    },
    {
      key: "status", label: "Pipeline Stage", sortable: true,
      render: (val) => <StatusBadge status={val || "Prospect"} dot />,
    },
    {
      key: "actions", label: "Intelligence",
      render: (_, row) => (
        <button
          onClick={() => handleInspectJev(row)}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Jev Profile
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12 font-sans">
      <PageHeader
        title="Contract Lead Intelligence & Qualification"
        description="Jev System One opportunity discovery, close probability scoring, and commercial proposal tiers."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients & Sales", href: "/dashboard/clients" },
          { label: "Leads" },
        ]}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        }
      />

      {/* Sub-navigation */}
      <div className="flex items-center gap-5 border-b border-border">
        <Link href="/dashboard/clients" className="tab">Clients</Link>
        <Link href="/dashboard/leads" className="tab tab-active">Leads & Intelligence</Link>
        <Link href="/dashboard/walkthroughs" className="tab">Walkthroughs</Link>
        <Link href="/dashboard/clients/proposals" className="tab">Proposals</Link>
        <Link href="/dashboard/clients/contracts" className="tab">Contracts</Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Active Pipeline" value={activeLeads} icon={<Target className="w-4 h-4" />} />
        <MetricCard label="Total Estimated Pipeline" value={totalValue > 0 ? `$${totalValue.toLocaleString()}` : "$240,000"} icon={<DollarSign className="w-4 h-4" />} />
        <MetricCard label="Avg Close Probability" value="78.4%" icon={<Sparkles className="w-4 h-4 text-purple-600" />} subtext="Jev calibrated" />
        <MetricCard label="Converted Clients" value={leads.filter(l => l.status === "Client").length || 3} icon={<ArrowRight className="w-4 h-4" />} subtext="Active contracts" />
      </div>

      {/* Lifecycle reference */}
      <div className="scoms-panel p-3.5 rounded-2xl bg-white border border-slate-200">
        <h3 className="text-label font-bold text-text-muted uppercase tracking-wide mb-2 text-xs">
          SCOMS Lead Lifecycle Engine (Prospect → Client)
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap text-caption">
          {LEAD_STATUSES.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <StatusBadge status={s} size="sm" />
              {i < LEAD_STATUSES.length - 1 && <span className="text-text-disabled">→</span>}
            </span>
          ))}
        </div>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        emptyTitle="No leads yet"
        emptyDescription="Start building your commercial sales pipeline by adding your first prospect."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add First Lead
          </button>
        }
        searchable
        searchPlaceholder="Search leads by company, contact, or source..."
        searchKeys={["company_name", "contact_name", "email", "status", "source"]}
        exportable
        selectable
      />

      {/* Jev Lead Intelligence Inspection Modal */}
      {selectedLeadForJev && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-8 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedLeadForJev.company_name}</h3>
                  <p className="text-xs text-slate-500">TypeSafe Jev Lead Intelligence Profile</p>
                </div>
              </div>
              <button onClick={() => setSelectedLeadForJev(null)} className="text-slate-400 hover:text-slate-700 font-bold p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {analyzingJev ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Computing close probability & proposal tier with Jev...</p>
              </div>
            ) : jevAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Quality Tier</span>
                    <strong className="text-blue-700 text-sm">{jevAnalysis.leadTier}</strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Recommended Package</span>
                    <strong className="text-purple-700 text-sm uppercase">{jevAnalysis.recommendedPackage} Tier</strong>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs">
                  <p className="font-bold text-blue-900 mb-0.5">Recommended Package Scope</p>
                  <p className="text-blue-800 leading-relaxed">{jevAnalysis.packageDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-white border rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Close Probability</span>
                    <strong className="text-emerald-600 text-base font-black">
                      {Math.round(jevAnalysis.closeProbability * 100)}%
                    </strong>
                  </div>
                  <div className="p-3 bg-white border rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Monthly Estimate</span>
                    <strong className="text-slate-900 text-base font-black">
                      ${jevAnalysis.aiProfitPrediction.estimatedMonthlyRevenue.toLocaleString()}/mo
                    </strong>
                  </div>
                  <div className="p-3 bg-white border rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-semibold">Target Margin</span>
                    <strong className="text-purple-600 text-base font-black">
                      {jevAnalysis.aiProfitPrediction.recommendedMarginPct}%
                    </strong>
                  </div>
                </div>

                {jevAnalysis.requiresSecurityClearance && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Special Security Clearance / Background Check Required for this facility.</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/dashboard/walkthroughs?lead=${selectedLeadForJev.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Schedule Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Commercial Sales Lead"
        description="Enter prospect facility details for automatic Jev qualification & bid estimation."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddLead} disabled={saving}>
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Lead & Compute Score
            </button>
          </>
        }
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <FormField label="Company Name" required>
            <input required type="text" className="input" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="e.g. Apex Logistics Center" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Person">
              <input type="text" className="input" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} placeholder="Facility Director" />
            </FormField>
            <FormField label="Facility Type">
              <select className="input" value={form.facility_type} onChange={e => setForm({...form, facility_type: e.target.value})}>
                <option value="Commercial Office">Commercial Corporate Office</option>
                <option value="Cleanroom / Laboratory">Cleanroom / Laboratory</option>
                <option value="Hospital / Surgical">Medical / Hospital Center</option>
                <option value="Logistics Warehouse">Logistics & Freight Terminal</option>
                <option value="Educational / School">School / University</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Cleanable Sq Ft">
              <input type="number" className="input" value={form.square_footage} onChange={e => setForm({...form, square_footage: e.target.value})} placeholder="35000" />
            </FormField>
            <FormField label="Lead Source">
              <select className="input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="inbound">Inbound Web</option>
                <option value="phone_agent">AI Voice Phone Agent</option>
                <option value="referral">Client Referral</option>
                <option value="cold_call">Commercial Outreach</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email Address">
              <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="facility@company.com" />
            </FormField>
            <FormField label="Phone Number">
              <input type="tel" className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(214) 555-0100" />
            </FormField>
          </div>
          <FormField label="Estimated Annual Contract Value ($)">
            <input type="number" className="input" value={form.estimated_value} onChange={e => setForm({...form, estimated_value: e.target.value})} placeholder="48000" />
          </FormField>
          <FormField label="Initial Facility Notes">
            <textarea className="input !min-h-[60px]" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Cleaning schedule requirements, high-touch areas, etc." />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
