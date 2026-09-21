"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Target, Plus, DollarSign, Phone, Mail, Building2, ArrowRight } from "lucide-react";
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
}

// ── Component ──────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    estimated_value: "",
    source: "inbound",
    notes: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
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

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("leads").insert([{
        company_name: form.company_name,
        contact_name: form.contact_name,
        email: form.email,
        phone: form.phone,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
        source: form.source,
        status: "Prospect",
        notes: form.notes,
      }]);
      if (error) throw error;
      setShowAddModal(false);
      setForm({ company_name: "", contact_name: "", email: "", phone: "", estimated_value: "", source: "inbound", notes: "" });
      fetchLeads();
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
      key: "company_name", label: "Company", sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-body-sm font-medium text-text-primary">{val || "—"}</p>
          {row.contact_name && <p className="text-caption text-text-muted">{row.contact_name}</p>}
        </div>
      ),
    },
    {
      key: "email", label: "Contact", sortable: true,
      render: (val, row) => (
        <div className="text-body-sm text-text-secondary">
          {val && <span className="block">{val}</span>}
          {row.phone && <span className="text-caption text-text-muted">{row.phone}</span>}
        </div>
      ),
    },
    {
      key: "estimated_value", label: "Est. Value", sortable: true, align: "right",
      render: (val) => val ? `$${Number(val).toLocaleString()}` : "—",
    },
    {
      key: "source", label: "Source", sortable: true,
      render: (val) => <span className="text-body-sm capitalize">{val || "—"}</span>,
    },
    {
      key: "status", label: "Status", sortable: true,
      render: (val) => <StatusBadge status={val || "Prospect"} dot />,
    },
    {
      key: "created_at", label: "Created", sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="Lead Pipeline"
        description="Track prospects from initial contact through to signed contracts."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients & Sales", href: "/dashboard/clients" },
          { label: "Leads" },
        ]}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        }
      />

      {/* Sub-navigation */}
      <div className="flex items-center gap-5 border-b border-border">
        <Link href="/dashboard/clients" className="tab">Clients</Link>
        <Link href="/dashboard/leads" className="tab tab-active">Leads</Link>
        <Link href="/dashboard/walkthroughs" className="tab">Walkthroughs</Link>
        <Link href="/dashboard/clients/proposals" className="tab">Proposals</Link>
        <Link href="/dashboard/clients/contracts" className="tab">Contracts</Link>
      </div>

      {/* Metrics */}
      {leads.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Active Leads" value={activeLeads} icon={<Target className="w-4 h-4" />} />
          <MetricCard label="Total Pipeline" value={totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—"} icon={<DollarSign className="w-4 h-4" />} />
          <MetricCard label="Total Leads" value={leads.length} icon={<Building2 className="w-4 h-4" />} />
          <MetricCard label="Conversion" value={leads.filter(l => l.status === "Client").length} icon={<ArrowRight className="w-4 h-4" />} subtext="Converted to clients" />
        </div>
      )}

      {/* Lifecycle reference */}
      <div className="scoms-panel p-3">
        <h3 className="text-label font-medium text-text-muted uppercase tracking-wide mb-2">Lead Lifecycle</h3>
        <div className="flex items-center gap-1 flex-wrap text-caption">
          {LEAD_STATUSES.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
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
        emptyDescription="Start building your sales pipeline by adding your first lead."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add First Lead
          </button>
        }
        searchable
        searchPlaceholder="Search leads..."
        searchKeys={["company_name", "contact_name", "email", "status", "source"]}
        exportable
        selectable
      />

      {/* Add Lead Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
        description="Enter prospect information to begin tracking."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddLead} disabled={saving}>
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Add Lead
            </button>
          </>
        }
      >
        <form onSubmit={handleAddLead} className="space-y-4">
          <FormField label="Company Name" required>
            <input required type="text" className="input" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Enter company name" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name">
              <input type="text" className="input" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} placeholder="Decision maker" />
            </FormField>
            <FormField label="Source">
              <select className="input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="inbound">Inbound</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="website">Website</option>
                <option value="phone_agent">AI Phone Agent</option>
                <option value="trade_show">Trade Show</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email">
              <input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@company.com" />
            </FormField>
            <FormField label="Phone">
              <input type="tel" className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(214) 555-0100" />
            </FormField>
          </div>
          <FormField label="Estimated Annual Value ($)">
            <input type="number" className="input" value={form.estimated_value} onChange={e => setForm({...form, estimated_value: e.target.value})} placeholder="100000" />
          </FormField>
          <FormField label="Notes">
            <textarea className="input !min-h-[60px]" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Initial observations, facility type, etc." />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
