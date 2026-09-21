"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Package,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Truck,
  Boxes,
} from "lucide-react";

interface SupplyRequest {
  id: string;
  request_number: string | null;
  item_name: string;
  quantity: number;
  unit: string | null;
  priority: "low" | "normal" | "high" | "urgent" | string;
  status: "pending" | "approved" | "ordered" | "delivered" | "cancelled" | string;
  location_note: string | null;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  [key: string]: any;
}

const STATUS_FLOW: Record<string, string> = {
  pending: "approved",
  approved: "ordered",
  ordered: "delivered",
};

export default function SupplyManagementPage() {
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    item_name: "",
    quantity: "1",
    unit: "cases",
    priority: "normal",
    location_note: "",
    notes: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("supply_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data ?? []);
    } catch (err: any) {
      console.error("Failed to load supply requests:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const activePipeline = requests.filter((r) => r.status === "approved" || r.status === "ordered").length;
    const urgentCount = requests.filter((r) => r.priority === "urgent" && r.status !== "delivered").length;

    return { total, pending, activePipeline, urgentCount };
  }, [requests]);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.item_name.trim()) {
      alert("Please enter an item description.");
      return;
    }
    setCreating(true);
    try {
      const reqNum = `SR-${Date.now().toString().slice(-6)}`;
      const payload = {
        item_name: form.item_name.trim(),
        quantity: parseInt(form.quantity) || 1,
        unit: form.unit || null,
        priority: form.priority,
        location_note: form.location_note || null,
        notes: form.notes || null,
        status: "pending",
        request_number: reqNum,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("supply_requests").insert([payload]);
      if (error) throw error;

      setShowCreate(false);
      setForm({
        item_name: "",
        quantity: "1",
        unit: "cases",
        priority: "normal",
        location_note: "",
        notes: "",
      });
      fetchRequests();
    } catch (err: any) {
      alert("Error submitting request: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const advanceStatus = async (req: SupplyRequest) => {
    const next = STATUS_FLOW[req.status];
    if (!next) return;

    try {
      const updates: any = { status: next };
      if (next === "approved") updates.approved_at = new Date().toISOString();

      const { error } = await supabase
        .from("supply_requests")
        .update(updates)
        .eq("id", req.id);

      if (error) throw error;
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, ...updates } : r))
      );
    } catch (err: any) {
      alert("Status advance failed: " + err.message);
    }
  };

  const columns: Column<SupplyRequest>[] = [
    {
      key: "request_number",
      header: "Requisition #",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-caption text-text-muted">
          {r.request_number || `SR-${r.id.slice(0, 6)}`}
        </span>
      ),
    },
    {
      key: "item_name",
      header: "Item & Materials",
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">{r.item_name}</span>
          {r.location_note && (
            <span className="text-caption text-text-muted">Facility: {r.location_note}</span>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-text-primary text-body-sm">
          {r.quantity} {r.unit || "units"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (r) => {
        const p = r.priority?.toLowerCase();
        let badgeStatus: "Draft" | "Active" | "Pending" | "Suspended" | "Cancelled" = "Draft";
        if (p === "urgent") badgeStatus = "Cancelled";
        else if (p === "high") badgeStatus = "Suspended";
        else if (p === "normal") badgeStatus = "Active";

        return <StatusBadge status={badgeStatus} label={r.priority?.toUpperCase()} />;
      },
    },
    {
      key: "status",
      header: "Procurement Status",
      sortable: true,
      render: (r) => {
        let badgeStatus: "Draft" | "Active" | "Pending" | "Suspended" | "Cancelled" = "Draft";
        if (r.status === "delivered") badgeStatus = "Active";
        else if (r.status === "ordered") badgeStatus = "Pending";
        else if (r.status === "approved") badgeStatus = "Suspended";

        return (
          <StatusBadge
            status={badgeStatus}
            label={r.status?.toUpperCase()}
          />
        );
      },
    },
    {
      key: "created_at",
      header: "Requested Date",
      sortable: true,
      render: (r) => (
        <span className="text-caption text-text-muted">
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => {
        const next = STATUS_FLOW[r.status];
        if (!next) return null;
        return (
          <button
            onClick={() => advanceStatus(r)}
            className="btn btn-secondary btn-sm text-[11px] px-2 py-0.5 flex items-center gap-1"
          >
            Mark {next} <ArrowRight className="w-3 h-3" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supply Chain & Inventory Management"
        description="Chemical requisitions, PPE supply replenishment, cleaning equipment orders, and delivery logistics"
        breadcrumbs={[
          { label: "Operations", href: "/dashboard/operations" },
          { label: "Supply Management" },
        ]}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Request Supplies
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requisitions"
          value={metrics.total}
          subtitle="All supply requests"
          icon={<Package className="w-5 h-5" />}
        />
        <MetricCard
          title="Awaiting Approval"
          value={metrics.pending}
          subtitle="Action required by manager"
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          title="In Procurement Pipeline"
          value={metrics.activePipeline}
          subtitle="Approved or in-transit"
          icon={<Truck className="w-5 h-5" />}
        />
        <MetricCard
          title="Urgent Low-Stock"
          value={metrics.urgentCount}
          subtitle="Critical inventory need"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Supply Requests Table */}
      <DataTable
        data={requests}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search materials by item name, requisition #, facility..."
        searchKeys={["item_name", "request_number", "location_note", "status"]}
        emptyTitle="No Supply Requests"
        emptyDescription="All cleaning inventory, disinfectants, and sanitizing agents are well stocked."
        emptyAction={
          <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Request Supplies
          </button>
        }
      />

      {/* Requisition Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Request Operational Cleaning Supplies"
        description="Submit requisition for chemicals, microfiber towels, PPE, or machinery parts."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreate()}
              disabled={creating}
              className="btn btn-primary btn-sm"
            >
              {creating ? "Submitting..." : "Submit Requisition"}
            </button>
          </>
        }
      >
        <form id="supply-form" onSubmit={handleCreate} className="space-y-4">
          <FormField label="Item Description" required>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Quaternary Disinfectant Cleaner (Gallon)"
              value={form.item_name}
              onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity" required>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </FormField>

            <FormField label="Packaging Unit">
              <select
                className="form-input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="cases">Cases</option>
                <option value="bottles">Bottles</option>
                <option value="gallons">Gallons</option>
                <option value="boxes">Boxes</option>
                <option value="rolls">Rolls</option>
                <option value="units">Individual Units</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Requisition Priority">
              <select
                className="form-input capitalize"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low (Restock)</option>
                <option value="normal">Normal (Standard)</option>
                <option value="high">High (Depleting)</option>
                <option value="urgent">Urgent (Depleted)</option>
              </select>
            </FormField>

            <FormField label="Target Facility / Client Site">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dallas Regional Hub"
                value={form.location_note}
                onChange={(e) => setForm({ ...form, location_note: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Special Delivery Instructions or SDS Note">
            <textarea
              className="form-input h-20 resize-none"
              placeholder="Specify EPA registration requirements or loading dock details..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
