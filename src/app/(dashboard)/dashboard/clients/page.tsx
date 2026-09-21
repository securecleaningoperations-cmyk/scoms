"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Building2, Plus, DollarSign, ShieldCheck, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface Client {
  id: string;
  client_id?: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  status?: string;
  annual_value?: number;
  created_at?: string;
}

// ── Component ──────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    type: "commercial",
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      // Primary: server API route (bypasses RLS)
      try {
        const res = await fetch("/api/clients");
        const json = await res.json();
        if (json.data) {
          setClients(json.data);
          setLoading(false);
          return;
        }
      } catch {}
      // Fallback: direct Supabase
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "client") fetchClients();
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchClients]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      client_id: `CLI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email,
      type: form.type,
      status: "active",
    };

    try {
      let success = false;
      try {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.data) success = true;
        else if (json.error) throw new Error(json.error);
      } catch {
        const { error } = await supabase.from("clients").insert([payload]);
        if (error) throw error;
        success = true;
      }

      if (success) {
        setShowAddModal(false);
        setForm({ name: "", address: "", phone: "", email: "", type: "commercial" });
        fetchClients();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  // ── Computed Metrics (from real data only) ────────────────────────

  const totalAnnualValue = clients.reduce((sum, c) => sum + (c.annual_value || 0), 0);
  const activeCount = clients.filter((c) => c.status === "active").length;

  // ── Table Columns ─────────────────────────────────────────────────

  const columns: Column<Client>[] = [
    {
      key: "client_id",
      label: "ID",
      sortable: true,
      width: "100px",
      render: (val) => (
        <span className="text-caption font-mono text-text-muted">{val || "—"}</span>
      ),
    },
    {
      key: "name",
      label: "Client Name",
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-body-sm font-medium text-text-primary">{val}</p>
          {row.email && <p className="text-caption text-text-muted">{row.email}</p>}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (val) => (
        <span className="text-body-sm capitalize">{val || "—"}</span>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (val) => (
        <span className="text-body-sm text-text-secondary truncate max-w-[200px] block">{val || "—"}</span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (val) => <span className="text-body-sm">{val || "—"}</span>,
    },
    {
      key: "annual_value",
      label: "Annual Value",
      sortable: true,
      align: "right",
      render: (val) =>
        val ? `$${Number(val).toLocaleString()}` : "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => <StatusBadge status={val || "Active"} />,
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="Client Directory"
        description="Manage client accounts, contacts, contracts, and service agreements."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients & Sales", href: "/dashboard/clients" },
          { label: "Clients" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/portal/dashboard" className="btn btn-secondary btn-sm">
              <ExternalLink className="w-3.5 h-3.5" />
              Client Portal
            </Link>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        }
      />

      {/* Sub-navigation */}
      <div className="flex items-center gap-5 border-b border-border overflow-x-auto">
        <Link href="/dashboard/clients" className="tab tab-active">Clients</Link>
        <Link href="/dashboard/leads" className="tab">Leads</Link>
        <Link href="/dashboard/walkthroughs" className="tab">Walkthroughs</Link>
        <Link href="/dashboard/clients/proposals" className="tab">Proposals</Link>
        <Link href="/dashboard/clients/contracts" className="tab">Contracts</Link>
      </div>

      {/* Metrics — only if data exists */}
      {clients.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Active Accounts"
            value={activeCount}
            icon={<Building2 className="w-4 h-4" />}
          />
          <MetricCard
            label="Total Annual Value"
            value={totalAnnualValue > 0 ? `$${totalAnnualValue.toLocaleString()}` : "—"}
            icon={<DollarSign className="w-4 h-4" />}
            subtext={totalAnnualValue > 0 ? `MRR $${Math.round(totalAnnualValue / 12).toLocaleString()}/mo` : undefined}
          />
          <MetricCard
            label="Total Clients"
            value={clients.length}
            icon={<Building2 className="w-4 h-4" />}
          />
          <MetricCard
            label="Client Types"
            value={new Set(clients.map(c => c.type).filter(Boolean)).size}
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={clients}
        columns={columns}
        loading={loading}
        emptyTitle="No clients yet"
        emptyDescription="Add your first client to start managing accounts, contracts, and services."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Add First Client
          </button>
        }
        searchable
        searchPlaceholder="Search clients by name, ID, email, address..."
        searchKeys={["name", "client_id", "email", "address", "type"]}
        exportable
        selectable
        onRowClick={(row) => setSelectedClient(row)}
      />

      {/* ── Client Detail Drawer ────────────────────────────────────── */}
      <Modal
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={selectedClient?.name || "Client Details"}
        description={selectedClient?.client_id || undefined}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Link
              href={`/dashboard/clients/${selectedClient?.id}`}
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              Open Client 360 &rarr;
            </Link>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedClient(null)}>
              Close
            </button>
          </div>
        }
      >
        {selectedClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-label text-text-muted mb-0.5">Type</p>
                <p className="text-body-sm font-medium capitalize">{selectedClient.type || "—"}</p>
              </div>
              <div>
                <p className="text-label text-text-muted mb-0.5">Status</p>
                <StatusBadge status={selectedClient.status || "Active"} size="md" />
              </div>
              <div>
                <p className="text-label text-text-muted mb-0.5">Annual Value</p>
                <p className="text-body-sm font-medium">
                  {selectedClient.annual_value ? `$${Number(selectedClient.annual_value).toLocaleString()}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-label text-text-muted mb-0.5">Phone</p>
                <p className="text-body-sm">{selectedClient.phone || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-label text-text-muted mb-0.5">Email</p>
              <p className="text-body-sm">{selectedClient.email || "—"}</p>
            </div>
            <div>
              <p className="text-label text-text-muted mb-0.5">Address</p>
              <p className="text-body-sm">{selectedClient.address || "—"}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Client Modal ────────────────────────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Client"
        description="Create a new client account."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddClient} disabled={saving}>
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Client
            </button>
          </>
        }
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <FormField label="Company / Facility Name" required>
            <input
              required
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter company name"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <input
                required
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@client.com"
              />
            </FormField>
            <FormField label="Phone" required>
              <input
                required
                type="tel"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(214) 555-0100"
              />
            </FormField>
          </div>

          <FormField label="Address" required>
            <input
              required
              type="text"
              className="input"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street, City, State ZIP"
            />
          </FormField>

          <FormField label="Facility Type">
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="commercial">Commercial Office</option>
              <option value="medical">Healthcare / Medical</option>
              <option value="industrial">Industrial / Warehouse</option>
              <option value="government">Government / Municipal</option>
              <option value="educational">Educational</option>
              <option value="retail">Retail</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}