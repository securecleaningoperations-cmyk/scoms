"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  ClipboardCheck,
  Building2,
  Sparkles,
  CheckCircle2,
  Plus,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Camera,
  Layers,
  Calculator,
} from "lucide-react";
import Link from "next/link";

interface Walkthrough {
  id: string;
  lead_id?: string;
  facility_type?: string;
  total_sqft?: number;
  cleanable_sqft?: number;
  status: string;
  created_at: string;
  leads?: { company_name?: string };
  [key: string]: any;
}

export default function WalkthroughModule() {
  const [assessments, setAssessments] = useState<Walkthrough[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [facilityType, setFacilityType] = useState("Commercial Office");
  const [totalSqft, setTotalSqft] = useState("");
  const [cleanableSqft, setCleanableSqft] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<Walkthrough | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("walkthrough_assessments")
        .select("*, leads(company_name)")
        .order("created_at", { ascending: false });
      setAssessments(data ?? []);
    } catch (err) {
      console.error("Failed to load assessments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("leads")
        .select("id, company_name, first_name, last_name, facility_type")
        .order("created_at", { ascending: false })
        .limit(50);
      setLeads(data ?? []);
    } catch (err) {
      console.error("Failed to load leads:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
    fetchLeads();
  }, [fetchAssessments, fetchLeads]);

  const metrics = useMemo(() => {
    const total = assessments.length;
    const completed = assessments.filter((a) => a.status === "Completed").length;
    const inProgress = assessments.filter((a) => a.status === "In Progress" || a.status === "Draft").length;
    const totalSqftAssessed = assessments.reduce((acc, a) => acc + (a.cleanable_sqft || 0), 0);

    return {
      total,
      completed,
      inProgress,
      totalSqft: totalSqftAssessed > 0 ? `${(totalSqftAssessed / 1000).toFixed(0)}k sq ft` : "0 sq ft",
    };
  }, [assessments]);

  const handleCreateWalkthrough = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedLeadId) {
      alert("Please select a target lead account.");
      return;
    }
    setFormSaving(true);
    try {
      const { error } = await supabase.from("walkthrough_assessments").insert([
        {
          lead_id: selectedLeadId,
          facility_type: facilityType || null,
          total_sqft: totalSqft ? parseInt(totalSqft) : null,
          cleanable_sqft: cleanableSqft ? parseInt(cleanableSqft) : null,
          status: "Draft",
        },
      ]);
      if (error) throw error;

      setShowNewModal(false);
      setSelectedLeadId("");
      setFacilityType("Commercial Office");
      setTotalSqft("");
      setCleanableSqft("");
      fetchAssessments();
    } catch (err: any) {
      alert("Error initiating walkthrough: " + err.message);
    } finally {
      setFormSaving(false);
    }
  };

  // If in interactive assessment wizard
  if (selectedWalkthrough) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <button
              onClick={() => setSelectedWalkthrough(null)}
              className="text-primary-600 hover:text-primary-700 text-caption font-semibold flex items-center gap-1 mb-1"
            >
              &larr; Return to Assessments
            </button>
            <h1 className="text-title-lg font-bold text-text-primary">
              Facility Walkthrough: {selectedWalkthrough.leads?.company_name || "Enterprise Facility"}
            </h1>
            <p className="text-caption text-text-muted mt-0.5">
              {selectedWalkthrough.facility_type || "Facility"} •{" "}
              {selectedWalkthrough.cleanable_sqft ? selectedWalkthrough.cleanable_sqft.toLocaleString() : 0} Cleanable Sq Ft
            </p>
          </div>
          <div className="badge badge-primary flex items-center gap-1.5 px-3 py-1.5">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="font-semibold text-caption">AI Specification Ready</span>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="card p-3 flex justify-between items-center">
          {["1. Discovery", "2. Scope & Flooring", "3. Security & Access", "4. AI Estimator"].map(
            (step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-caption font-bold ${
                    activeStep > idx + 1
                      ? "bg-success-600 text-white"
                      : activeStep === idx + 1
                      ? "bg-primary-600 text-white"
                      : "bg-surface-hover text-text-muted"
                  }`}
                >
                  {activeStep > idx + 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-caption font-semibold hidden md:inline ${
                    activeStep === idx + 1 ? "text-primary-600" : "text-text-secondary"
                  }`}
                >
                  {step}
                </span>
                {idx < 3 && <ChevronRight className="w-4 h-4 text-text-muted/40 mx-2" />}
              </div>
            )
          )}
        </div>

        {/* Step 1: Customer Discovery */}
        {activeStep === 1 && (
          <div className="card p-6 space-y-5">
            <h2 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Customer Pain Points & Operational Challenges
            </h2>
            <FormField label="What are the current facility deficiencies or contractor issues?">
              <textarea
                className="form-input h-24 resize-none"
                placeholder="e.g. Previous vendor inconsistent with cleanroom trash protocols and floor scrubbing..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Client Target Monthly Budget ($)">
                <input type="text" className="form-input" placeholder="e.g. $8,500 - $12,000 / mo" />
              </FormField>
              <FormField label="Projected Contract Start Date">
                <input type="date" className="form-input" />
              </FormField>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setActiveStep(2)}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                Next: Scope & Facility <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Scope & Facility */}
        {activeStep === 2 && (
          <div className="card p-6 space-y-5">
            <h2 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Facility Specifications & Surface Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Total Cleanable Square Footage">
                <input
                  type="number"
                  className="form-input"
                  defaultValue={selectedWalkthrough.cleanable_sqft || 25000}
                />
              </FormField>
              <FormField label="Facility Classification">
                <select className="form-input">
                  <option>Cleanroom / Laboratory</option>
                  <option>Medical & Healthcare Facility</option>
                  <option>Industrial & Logistics Center</option>
                  <option>Corporate Headquarters</option>
                </select>
              </FormField>
            </div>
            <div className="border border-dashed border-border rounded-xl p-8 text-center bg-surface-hover">
              <Camera className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <h4 className="font-semibold text-text-primary text-body-sm">
                Facility Photos & Architectural Plans
              </h4>
              <p className="text-caption text-text-muted mt-0.5">
                AI analyzes high-traffic choke points and flooring materials automatically.
              </p>
            </div>
            <div className="flex justify-between pt-3">
              <button onClick={() => setActiveStep(1)} className="btn btn-secondary btn-sm">
                Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                Next: Security Protocol <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security & Access */}
        {activeStep === 3 && (
          <div className="card p-6 space-y-5">
            <h2 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Site Clearance & Compliance Requirements
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-hover cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary-600" defaultChecked />
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">
                    Security Clearance / Background Checks Required
                  </p>
                  <p className="text-caption text-text-muted">
                    Crew must pass 10-panel drug test and federal background verification.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-hover cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary-600" defaultChecked />
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">
                    Hazmat or Biohazard Disposal Protocol
                  </p>
                  <p className="text-caption text-text-muted">
                    Mandatory bloodborne pathogen certification & specialized chemical handling.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-hover cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-primary-600" />
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">
                    Keycard & Key Fob Controlled Access
                  </p>
                  <p className="text-caption text-text-muted">
                    Requires badge log-in / log-out verification at security desk.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-between pt-3">
              <button onClick={() => setActiveStep(2)} className="btn btn-secondary btn-sm">
                Back
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                Review & AI Synthesis <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Review & Proposal Synthesis */}
        {activeStep === 4 && (() => {
          const sqft = selectedWalkthrough.cleanable_sqft || 25000;
          const silverMonthly = Math.round(sqft * 0.08);
          const goldMonthly = Math.round(sqft * 0.11);
          const platinumMonthly = Math.round(sqft * 0.16);
          const laborHours = Math.round((sqft / 3500) * 4.5);
          const crewSize = Math.max(1, Math.ceil(sqft / 12000));

          return (
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-title-sm font-bold text-text-primary">
                      TypeSafe Jev Proposal & Cost Modeling
                    </h2>
                    <p className="text-caption text-text-muted">
                      Automated 3-tier service scope synthesis based on {sqft.toLocaleString()} cleanable sq ft
                    </p>
                  </div>
                </div>
                <span className="badge badge-success px-3 py-1 font-semibold">
                  Jev Close Probability: 84%
                </span>
              </div>

              {/* Operational Labor Matrix */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-surface-hover border border-border text-center">
                <div>
                  <span className="text-[11px] text-text-muted uppercase font-bold block">Production Rate</span>
                  <strong className="text-body-sm font-bold text-text-primary">3,500 sq ft / hr</strong>
                  <span className="text-[10px] text-text-muted block">ISSA Commercial Benchmark</span>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted uppercase font-bold block">Hours / Visit</span>
                  <strong className="text-body-sm font-bold text-text-primary">{laborHours} Direct Hours</strong>
                  <span className="text-[10px] text-text-muted block">Shift Duration</span>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted uppercase font-bold block">Assigned Crew</span>
                  <strong className="text-body-sm font-bold text-primary-600">{crewSize} Cleaners</strong>
                  <span className="text-[10px] text-text-muted block">Optimal Shift Size</span>
                </div>
              </div>

              {/* 3-Tier Proposal Packages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Silver */}
                <div className="p-4 rounded-2xl border border-border bg-surface flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Silver Tier</span>
                    <h3 className="text-title-sm font-bold text-text-primary">Essential Commercial</h3>
                    <p className="text-2xl font-black text-text-primary">${silverMonthly.toLocaleString()}<span className="text-caption font-normal text-text-muted">/mo</span></p>
                    <ul className="text-caption text-text-secondary space-y-1.5 pt-2">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> 3x weekly trash & recycle</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> Restroom sanitizing & stocking</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> High-traffic vacuuming</li>
                    </ul>
                  </div>
                  <button className="mt-4 w-full btn btn-secondary btn-sm">Select Silver</button>
                </div>

                {/* Gold */}
                <div className="p-4 rounded-2xl border-2 border-primary-500 bg-primary-500/5 flex flex-col justify-between relative shadow-sm">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-600 text-white rounded-full text-[10px] font-bold uppercase">
                    Most Recommended
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">Gold Tier</span>
                    <h3 className="text-title-sm font-bold text-text-primary">Complete Facility Care</h3>
                    <p className="text-2xl font-black text-primary-600">${goldMonthly.toLocaleString()}<span className="text-caption font-normal text-text-muted">/mo</span></p>
                    <ul className="text-caption text-text-secondary space-y-1.5 pt-2">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary-600" /> Daily (5x/wk) full janitorial</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary-600" /> Touchpoint disinfection</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary-600" /> Day-porter on-call support</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary-600" /> Monthly floor buffing & scrubbing</li>
                    </ul>
                  </div>
                  <button className="mt-4 w-full btn btn-primary btn-sm">Select Gold (Best Fit)</button>
                </div>

                {/* Platinum */}
                <div className="p-4 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/20 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Platinum Tier</span>
                    <h3 className="text-title-sm font-bold text-text-primary">Cleanroom & ISO Lab</h3>
                    <p className="text-2xl font-black text-purple-700 dark:text-purple-400">${platinumMonthly.toLocaleString()}<span className="text-caption font-normal text-text-muted">/mo</span></p>
                    <ul className="text-caption text-text-secondary space-y-1.5 pt-2">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> 7-day 24/7 dedicated lead</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> HEPA electrostatic spraying</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> ATP swab quality validation</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> OSHA & ISO 14644 compliance</li>
                    </ul>
                  </div>
                  <button className="mt-4 w-full btn btn-secondary btn-sm">Select Platinum</button>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-border">
                <button onClick={() => setActiveStep(3)} className="btn btn-secondary btn-sm">
                  Back
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert("Walkthrough proposal saved and synced with CRM Leads & Proposals module.");
                      setSelectedWalkthrough(null);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Save Proposal Draft
                  </button>
                  <Link
                    href="/dashboard/bid-calculator"
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <Calculator className="w-4 h-4" /> Open in Bid Calculator
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // Walkthrough List View
  const columns: Column<Walkthrough>[] = [
    {
      key: "leads",
      header: "Lead / Prospect",
      sortable: true,
      render: (w) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">
            {w.leads?.company_name || "General Facility"}
          </span>
          <span className="text-caption text-text-muted">{w.facility_type || "Commercial Site"}</span>
        </div>
      ),
    },
    {
      key: "cleanable_sqft",
      header: "Cleanable Sq Ft",
      sortable: true,
      render: (w) => (
        <span className="font-medium text-text-primary text-body-sm">
          {w.cleanable_sqft ? `${w.cleanable_sqft.toLocaleString()} sq ft` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (w) => (
        <StatusBadge
          status={w.status === "Completed" ? "Active" : "Draft"}
          label={w.status || "DRAFT"}
        />
      ),
    },
    {
      key: "created_at",
      header: "Assessment Date",
      sortable: true,
      render: (w) => (
        <span className="text-caption text-text-muted">
          {new Date(w.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (w) => (
        <button
          onClick={() => {
            setSelectedWalkthrough(w);
            setActiveStep(1);
          }}
          className="btn btn-secondary btn-sm text-[11px] px-2.5 py-1 flex items-center gap-1"
        >
          Conduct Audit <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Walkthroughs & Facility Audits"
        description="On-site facility evaluations, square footage measurements, cleanroom classification, and scope auditing"
        breadcrumbs={[
          { label: "Commercial", href: "/dashboard/leads" },
          { label: "Walkthroughs" },
        ]}
        actions={
          <button
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Walkthrough
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Walkthroughs"
          value={metrics.total}
          subtitle="All facility assessments"
          icon={<ClipboardCheck className="w-5 h-5" />}
        />
        <MetricCard
          title="Completed Audits"
          value={metrics.completed}
          subtitle="Ready for commercial proposal"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          title="In Progress / Draft"
          value={metrics.inProgress}
          subtitle="Awaiting site visit"
          icon={<Building2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Assessed Surface Area"
          value={metrics.totalSqft}
          subtitle="Total cleanable square feet"
          icon={<Layers className="w-5 h-5" />}
        />
      </div>

      {/* Walkthroughs Table */}
      <DataTable
        data={assessments}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search assessments by company, facility..."
        searchKeys={["facility_type"]}
        emptyTitle="No Walkthrough Assessments"
        emptyDescription="Facility site visits and scope measurements will appear here."
        emptyAction={
          <button onClick={() => setShowNewModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Start New Walkthrough
          </button>
        }
      />

      {/* New Walkthrough Modal */}
      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Schedule Facility Walkthrough"
        description="Select a prospect to initiate an on-site audit."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateWalkthrough()}
              disabled={formSaving}
              className="btn btn-primary btn-sm"
            >
              {formSaving ? "Starting..." : "Begin Walkthrough"}
            </button>
          </>
        }
      >
        <form id="walkthrough-form" onSubmit={handleCreateWalkthrough} className="space-y-4">
          <FormField label="Prospect / Lead Account" required>
            <select
              required
              className="form-input"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              <option value="">Select target lead...</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.company_name} ({l.first_name} {l.last_name})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Facility Classification" required>
            <select
              className="form-input"
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
            >
              <option value="Commercial Office">Commercial Office</option>
              <option value="Medical / Healthcare">Medical / Healthcare</option>
              <option value="Industrial / Warehouse">Industrial / Warehouse</option>
              <option value="Cleanroom / Laboratory">Cleanroom / Laboratory</option>
              <option value="Educational / Campus">Educational / Campus</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Gross Sq Ft">
              <input
                type="number"
                className="form-input"
                placeholder="50000"
                value={totalSqft}
                onChange={(e) => setTotalSqft(e.target.value)}
              />
            </FormField>

            <FormField label="Cleanable Sq Ft" required>
              <input
                type="number"
                required
                className="form-input"
                placeholder="42000"
                value={cleanableSqft}
                onChange={(e) => setCleanableSqft(e.target.value)}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}
