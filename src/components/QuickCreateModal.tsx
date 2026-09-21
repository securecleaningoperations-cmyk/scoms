"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  X, Building2, Target, ClipboardList, UserPlus,
  DollarSign, AlertTriangle, FileText, CheckCircle2,
  Loader2, Sparkles, ChevronRight
} from "lucide-react";

export type CreateEntityType =
  | "lead"
  | "client"
  | "job"
  | "employee"
  | "invoice"
  | "incident"
  | "document";

interface QuickCreateModalProps {
  open: boolean;
  initialType?: CreateEntityType;
  onClose: () => void;
  onCreated?: (type: CreateEntityType, record: any) => void;
}

const ENTITY_CONFIGS: {
  type: CreateEntityType;
  title: string;
  category: string;
  icon: any;
  color: string;
  description: string;
}[] = [
  {
    type: "lead",
    title: "New Commercial Lead",
    category: "Sales & CRM",
    icon: Target,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    description: "Capture prospective commercial cleaning opportunities and facility specs.",
  },
  {
    type: "client",
    title: "New Client Account",
    category: "Sales & CRM",
    icon: Building2,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    description: "Onboard an approved client facility into the permanent registry.",
  },
  {
    type: "job",
    title: "New Job / Work Order",
    category: "Operations",
    icon: ClipboardList,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    description: "Dispatch scheduled or one-time cleaning service for field technicians.",
  },
  {
    type: "employee",
    title: "New Employee / Staff",
    category: "Workforce & HR",
    icon: UserPlus,
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    description: "Enroll a new field cleaner, route supervisor, or office staff member.",
  },
  {
    type: "invoice",
    title: "New Customer Invoice",
    category: "Financial Engine",
    icon: DollarSign,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    description: "Issue an accounts receivable billing record linked to client work.",
  },
  {
    type: "incident",
    title: "New Incident / Issue",
    category: "Quality & Safety",
    icon: AlertTriangle,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    description: "Log a facility safety, ATP swab failure, or service deficiency for CAPA.",
  },
  {
    type: "document",
    title: "New Enterprise Document",
    category: "Records Office",
    icon: FileText,
    color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    description: "Register an official company letter, contract, or operational document.",
  },
];

export function QuickCreateModal({
  open,
  initialType = "lead",
  onClose,
  onCreated,
}: QuickCreateModalProps) {
  const [activeType, setActiveType] = useState<CreateEntityType>(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  // Form states
  const [leadForm, setLeadForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    facility_type: "Commercial Office",
    square_footage: "",
    estimated_value: "",
    notes: "",
  });

  const [clientForm, setClientForm] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    industry: "Commercial",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    client_id: "",
    scheduled_date: new Date().toISOString().split("T")[0],
    location: "",
    priority: "normal",
    service_type: "Routine Janitorial",
  });

  const [empForm, setEmpForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "Operations",
    position: "Cleaning Specialist",
    role: "field_employee",
    pay_rate: "22.50",
    pay_type: "hourly",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    client_id: "",
    amount: "",
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    notes: "",
  });

  const [incidentForm, setIncidentForm] = useState({
    title: "",
    facility: "",
    severity: "medium",
    description: "",
    immediate_action: "",
  });

  const [docForm, setDocForm] = useState({
    name: "",
    category: "client",
    retention_period_years: "5",
    notes: "",
  });

  useEffect(() => {
    if (initialType) setActiveType(initialType);
  }, [initialType]);

  useEffect(() => {
    if (open) {
      setSuccessMessage(null);
      setErrorMessage(null);
      // Fetch available clients for dropdowns
      supabase
        .from("clients")
        .select("id, name")
        .order("name")
        .then(({ data }) => {
          if (data) setClients(data);
        });
    }
  }, [open]);

  if (!open) return null;

  const currentConfig =
    ENTITY_CONFIGS.find((c) => c.type === activeType) || ENTITY_CONFIGS[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let createdRecord: any = null;

      if (activeType === "lead") {
        if (!leadForm.company_name.trim()) throw new Error("Company name is required.");
        const { data, error } = await supabase
          .from("leads")
          .insert([
            {
              company_name: leadForm.company_name,
              contact_name: leadForm.contact_name || null,
              email: leadForm.email || null,
              phone: leadForm.phone || null,
              facility_type: leadForm.facility_type,
              square_footage: leadForm.square_footage ? Number(leadForm.square_footage) : null,
              estimated_value: leadForm.estimated_value ? Number(leadForm.estimated_value) : null,
              status: "Prospect",
              stage: "prospect",
              notes: leadForm.notes || null,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setLeadForm({
          company_name: "",
          contact_name: "",
          email: "",
          phone: "",
          facility_type: "Commercial Office",
          square_footage: "",
          estimated_value: "",
          notes: "",
        });
      } else if (activeType === "client") {
        if (!clientForm.name.trim()) throw new Error("Client account name is required.");
        const { data, error } = await supabase
          .from("clients")
          .insert([
            {
              name: clientForm.name,
              contact_name: clientForm.contact_name || null,
              email: clientForm.email || null,
              phone: clientForm.phone || null,
              address: clientForm.address || null,
              status: "active",
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setClientForm({
          name: "",
          contact_name: "",
          email: "",
          phone: "",
          address: "",
          industry: "Commercial",
        });
      } else if (activeType === "job") {
        if (!jobForm.title.trim()) throw new Error("Job title is required.");
        const selectedClient = clients.find((c) => c.id === jobForm.client_id);
        const { data, error } = await supabase
          .from("jobs")
          .insert([
            {
              title: jobForm.title.trim(),
              client: selectedClient?.name || "Direct Assignment",
              client_id: jobForm.client_id || null,
              location: jobForm.location || selectedClient?.name || "Main Facility",
              status: "Created",
              type: jobForm.service_type || "commercial",
              job_date: jobForm.scheduled_date || new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setJobForm({
          title: "",
          client_id: "",
          scheduled_date: new Date().toISOString().split("T")[0],
          location: "",
          priority: "normal",
          service_type: "Routine Janitorial",
        });
      } else if (activeType === "employee") {
        if (!empForm.first_name.trim() || !empForm.last_name.trim() || !empForm.email.trim()) {
          throw new Error("First name, last name, and email are required.");
        }
        const res = await fetch("/api/hr/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empForm),
        });
        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson.error || "Failed to create employee.");
        createdRecord = resJson.data;
        setEmpForm({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          department: "Operations",
          position: "Cleaning Specialist",
          role: "field_employee",
          pay_rate: "22.50",
          pay_type: "hourly",
        });
      } else if (activeType === "invoice") {
        if (!invoiceForm.amount || Number(invoiceForm.amount) <= 0) {
          throw new Error("Please enter a valid invoice amount.");
        }
        const selectedClient = clients.find((c) => c.id === invoiceForm.client_id);
        const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
        const { data, error } = await supabase
          .from("invoices")
          .insert([
            {
              invoice_id: invoiceNum,
              client_id: invoiceForm.client_id || null,
              client: selectedClient?.name || "Commercial Client",
              amount: Number(invoiceForm.amount),
              due_date: invoiceForm.due_date || null,
              status: "pending",
              issue_date: new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setInvoiceForm({
          client_id: "",
          amount: "",
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
          notes: "",
        });
      } else if (activeType === "incident") {
        if (!incidentForm.title.trim()) throw new Error("Incident title is required.");
        const { data, error } = await supabase
          .from("incidents")
          .insert([
            {
              title: incidentForm.title,
              facility: incidentForm.facility || null,
              severity: incidentForm.severity,
              description: incidentForm.description || null,
              immediate_action: incidentForm.immediate_action || null,
              status: "open",
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setIncidentForm({
          title: "",
          facility: "",
          severity: "medium",
          description: "",
          immediate_action: "",
        });
      } else if (activeType === "document") {
        if (!docForm.name.trim()) throw new Error("Document name is required.");
        const { data, error } = await supabase
          .from("documents")
          .insert([
            {
              name: docForm.name,
              category: docForm.category,
              version: 1,
              status: "active",
              is_original: true,
              tags: [docForm.category, "created-quick"],
              retention_period_years: Number(docForm.retention_period_years) || 5,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        createdRecord = data;
        setDocForm({
          name: "",
          category: "client",
          retention_period_years: "5",
          notes: "",
        });
      }

      setSuccessMessage(`${currentConfig.title} created successfully!`);

      // Dispatch real global event so open pages refresh immediately
      window.dispatchEvent(
        new CustomEvent("scoms-entity-created", {
          detail: { type: activeType, record: createdRecord },
        })
      );

      if (onCreated) onCreated(activeType, createdRecord);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during creation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${currentConfig.color}`}>
              <currentConfig.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {currentConfig.title}
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  {currentConfig.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentConfig.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Tabs Bar */}
        <div className="px-6 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {ENTITY_CONFIGS.map((item) => {
            const isSelected = activeType === item.type;
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  setActiveType(item.type);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* ── 1. LEAD FORM ───────────────────────────────────────────── */}
          {activeType === "lead" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Biotech Laboratories"
                    value={leadForm.company_name}
                    onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={leadForm.contact_name}
                    onChange={(e) => setLeadForm({ ...leadForm, contact_name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="contact@facility.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(214) 555-0199"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Type
                  </label>
                  <select
                    value={leadForm.facility_type}
                    onChange={(e) => setLeadForm({ ...leadForm, facility_type: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  >
                    <option value="Commercial Office">Commercial Office</option>
                    <option value="Medical Facility">Medical / Healthcare</option>
                    <option value="Cleanroom / ISO">Cleanroom / Lab (ISO 5-8)</option>
                    <option value="Defense / CMMC">Defense / Cleared Site</option>
                    <option value="School / Campus">School / Education</option>
                    <option value="Industrial / Warehouse">Industrial &amp; Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Square Footage (sq ft)
                  </label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={leadForm.square_footage}
                    onChange={(e) => setLeadForm({ ...leadForm, square_footage: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Est. Monthly Value ($)
                  </label>
                  <input
                    type="number"
                    placeholder="12500"
                    value={leadForm.estimated_value}
                    onChange={(e) => setLeadForm({ ...leadForm, estimated_value: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scope &amp; Special Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5 days/week night cleaning, cleanroom gowning, ATP testing, badge escort required"
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                />
              </div>
            </div>
          )}

          {/* ── 2. CLIENT FORM ──────────────────────────────────────────── */}
          {activeType === "client" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dallas Regional Health Center"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility Manager / Contact
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Michael Chang"
                    value={clientForm.contact_name}
                    onChange={(e) => setClientForm({ ...clientForm, contact_name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing / Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="facilities@client.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Direct Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(214) 555-0144"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facility Physical Address
                </label>
                <input
                  type="text"
                  placeholder="1000 Commerce St, Suite 400, Dallas, TX 75201"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* ── 3. JOB FORM ─────────────────────────────────────────────── */}
          {activeType === "job" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Title / Scope *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cleanroom ISO 6 Terminal Sanitization"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Facility
                  </label>
                  <select
                    value={jobForm.client_id}
                    onChange={(e) => setJobForm({ ...jobForm, client_id: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select Client Account --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={jobForm.scheduled_date}
                    onChange={(e) => setJobForm({ ...jobForm, scheduled_date: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispatch Location / Building
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Building B, 3rd Floor Sterile Wing"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={jobForm.priority}
                    onChange={(e) => setJobForm({ ...jobForm, priority: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="normal">Normal (Standard SLA)</option>
                    <option value="high">High Priority (Within 4 hrs)</option>
                    <option value="critical">Critical / Terminal Clean</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── 4. EMPLOYEE FORM ────────────────────────────────────────── */}
          {activeType === "employee" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={empForm.first_name}
                    onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={empForm.last_name}
                    onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="staff@securecleaningoperations.com"
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(214) 555-0100"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Commercial Cleaning">Commercial Cleaning</option>
                    <option value="Field Supervision">Field Supervision</option>
                    <option value="Healthcare Sanitization">Healthcare Accounts</option>
                    <option value="Cleanroom / ISO">Cleanrooms &amp; Labs</option>
                    <option value="Safety & Compliance">Safety &amp; Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Floor Specialist"
                    value={empForm.position}
                    onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hourly Pay Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={empForm.pay_rate}
                    onChange={(e) => setEmpForm({ ...empForm, pay_rate: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 5. INVOICE FORM ─────────────────────────────────────────── */}
          {activeType === "invoice" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Account *
                  </label>
                  <select
                    required
                    value={invoiceForm.client_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select Client Account --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="8500.00"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billing Memo / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monthly janitorial services for September 2026 as per Service Agreement."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* ── 6. INCIDENT FORM ────────────────────────────────────────── */}
          {activeType === "incident" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spill containment protocol triggered in chemical storage"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Facility / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North Dallas Tech Hub"
                    value={incidentForm.facility}
                    onChange={(e) => setIncidentForm({ ...incidentForm, facility: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="low">Low (Minor cosmetic issue)</option>
                    <option value="medium">Medium (Requires supervisor review)</option>
                    <option value="high">High (Quality SLA / ATP Swab Failure)</option>
                    <option value="critical">Critical (Biohazard / OSHA Reportable)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description &amp; Immediate Action Taken
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the incident facts, root cause observed, and immediate mitigation deployed."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* ── 7. DOCUMENT FORM ────────────────────────────────────────── */}
          {activeType === "document" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Service Agreement - Q4 Update"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="employee">Employee Records</option>
                    <option value="client">Client Records</option>
                    <option value="vendor">Vendor Records</option>
                    <option value="corporate">Corporate Records</option>
                    <option value="financial">Financial Records</option>
                    <option value="operations">Operations Records</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Retention Period
                  </label>
                  <select
                    value={docForm.retention_period_years}
                    onChange={(e) => setDocForm({ ...docForm, retention_period_years: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="3">3 Years (Operations &amp; Work Orders)</option>
                    <option value="5">5 Years (Personnel &amp; Safety)</option>
                    <option value="7">7 Years (Financial &amp; Invoices)</option>
                    <option value="10">10 Years (Corporate &amp; Defense)</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Documents created here are automatically cataloged in the SCOMS permanent digital filing cabinet with official company branding.
              </p>
            </div>
          )}

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create {currentConfig.type.charAt(0).toUpperCase() + currentConfig.type.slice(1)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
