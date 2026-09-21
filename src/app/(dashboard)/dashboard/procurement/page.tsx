"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Briefcase,
  Plus,
  DollarSign,
  Calendar,
  Building2,
  Clock,
  ArrowUpRight,
  FileText,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  agency?: string;
  solicitation_number?: string;
  due_date?: string;
  estimated_value?: number;
  location_city?: string;
  location_state?: string;
  priority?: string;
  status: string;
  posted_date?: string;
  [key: string]: any;
}

export default function ProcurementHub() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    agency: "",
    solicitation_number: "",
    due_date: "",
    estimated_value: "",
    location_city: "",
    location_state: "TX",
    priority: "Medium",
  });

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("procurement_opportunities")
        .select("*")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error("Failed to load procurement opportunities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const metrics = useMemo(() => {
    const totalVal = opportunities.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);
    const activeCount = opportunities.filter((o) => o.status !== "Closed" && o.status !== "Awarded").length;
    const highPriority = opportunities.filter((o) => o.priority === "High" || o.priority === "Critical").length;
    const now = new Date();
    const dueSoon = opportunities.filter((o) => {
      if (!o.due_date) return false;
      const d = new Date(o.due_date);
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length;

    return {
      pipelineValue: totalVal > 0 ? `$${(totalVal / 1000000).toFixed(2)}M` : "$0",
      activeCount,
      highPriority,
      dueSoon,
    };
  }, [opportunities]);

  const handleAddOpportunity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter an opportunity title.");
      return;
    }
    if (!form.agency.trim()) {
      alert("Please enter the issuing agency or client.");
      return;
    }
    setIsAdding(true);
    try {
      const newOp = {
        title: form.title.trim(),
        agency: form.agency.trim(),
        solicitation_number: form.solicitation_number.trim() || null,
        due_date: form.due_date || null,
        location_city: form.location_city.trim() || null,
        location_state: form.location_state.trim() || null,
        priority: form.priority,
        status: "Active",
        posted_date: new Date().toISOString().split("T")[0],
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      };

      const { error } = await supabase.from("procurement_opportunities").insert([newOp]);
      if (error) throw error;

      setShowModal(false);
      setForm({
        title: "",
        agency: "",
        solicitation_number: "",
        due_date: "",
        estimated_value: "",
        location_city: "",
        location_state: "TX",
        priority: "Medium",
      });
      fetchOpportunities();
    } catch (err: any) {
      alert("Error adding opportunity: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const columns: Column<Opportunity>[] = [
    {
      key: "solicitation_number",
      header: "Solicitation / RFP #",
      sortable: true,
      render: (o) => (
        <span className="font-mono text-caption text-text-muted">
          {o.solicitation_number || "RFP-PENDING"}
        </span>
      ),
    },
    {
      key: "title",
      header: "Contract Opportunity",
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">{o.title}</span>
          <span className="text-caption text-text-muted">{o.agency || "Federal / Municipal"}</span>
        </div>
      ),
    },
    {
      key: "estimated_value",
      header: "Estimated Value",
      sortable: true,
      render: (o) => (
        <span className="font-semibold text-text-primary text-body-sm">
          {o.estimated_value ? `$${o.estimated_value.toLocaleString()}` : "To Be Determined"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (o) => {
        const p = o.priority?.toLowerCase();
        let badgeStatus: "Draft" | "Active" | "Pending" | "Suspended" | "Cancelled" = "Draft";
        if (p === "critical") badgeStatus = "Cancelled";
        else if (p === "high") badgeStatus = "Suspended";
        else if (p === "medium") badgeStatus = "Pending";
        else badgeStatus = "Active";

        return <StatusBadge status={badgeStatus} label={o.priority?.toUpperCase()} />;
      },
    },
    {
      key: "due_date",
      header: "Submission Due Date",
      sortable: true,
      render: (o) => (
        <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-text-muted" />
          <span>{o.due_date ? new Date(o.due_date).toLocaleDateString() : "Rolling"}</span>
        </div>
      ),
    },
    {
      key: "location_city",
      header: "Location",
      render: (o) => (
        <span className="text-body-sm text-text-muted">
          {o.location_city ? `${o.location_city}, ${o.location_state || ""}` : "Multiple Sites"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (o) => (
        <StatusBadge
          status={o.status === "Awarded" ? "Active" : o.status === "Active" ? "Pending" : "Draft"}
          label={o.status || "NEW"}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement & RFP Pipeline"
        description="Government contracts, municipal bids, commercial enterprise solicitations, and proposal submissions"
        breadcrumbs={[
          { label: "Commercial", href: "/dashboard/leads" },
          { label: "Procurement" },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Procurement Pipeline"
          value={metrics.pipelineValue}
          subtitle="Total opportunity volume"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Opportunities"
          value={metrics.activeCount}
          subtitle="Open RFP pursuits"
          icon={<Briefcase className="w-5 h-5" />}
        />
        <MetricCard
          title="High Priority Pursuits"
          value={metrics.highPriority}
          subtitle="Target enterprise accounts"
          icon={<Building2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Due in 30 Days"
          value={metrics.dueSoon}
          subtitle="Imminent deadline"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Procurement Table */}
      <DataTable
        data={opportunities}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search opportunity by title, agency, RFP #..."
        searchKeys={["title", "agency", "solicitation_number", "location_city"]}
        emptyTitle="No Active Solicitations"
        emptyDescription="Enterprise bids, SAM.gov opportunities, and commercial RFPs will appear here."
        emptyAction={
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add First Opportunity
          </button>
        }
      />

      {/* Add Opportunity Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Procurement Opportunity"
        description="Log an RFP, government solicitation, or enterprise facility bidding opportunity."
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleAddOpportunity()}
              disabled={isAdding}
              className="btn btn-primary btn-sm"
            >
              {isAdding ? "Saving..." : "Save Opportunity"}
            </button>
          </>
        }
      >
        <form id="procurement-form" onSubmit={handleAddOpportunity} className="space-y-4">
          <FormField label="Opportunity Title" required>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. County Courthouse Janitorial & Custodial Services"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Issuing Agency / Entity" required>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Dept of Transportation / Prime Healthcare"
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
              />
            </FormField>

            <FormField label="Solicitation / RFP Number">
              <input
                type="text"
                className="form-input"
                placeholder="e.g. RFP-2026-0894"
                value={form.solicitation_number}
                onChange={(e) => setForm({ ...form, solicitation_number: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Estimated Annual Contract Value ($)">
              <input
                type="number"
                className="form-input"
                placeholder="250000"
                value={form.estimated_value}
                onChange={(e) => setForm({ ...form, estimated_value: e.target.value })}
              />
            </FormField>

            <FormField label="Submission Due Date">
              <input
                type="date"
                className="form-input"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="City">
              <input
                type="text"
                className="form-input"
                placeholder="Austin"
                value={form.location_city}
                onChange={(e) => setForm({ ...form, location_city: e.target.value })}
              />
            </FormField>

            <FormField label="State">
              <input
                type="text"
                className="form-input"
                placeholder="TX"
                maxLength={2}
                value={form.location_state}
                onChange={(e) => setForm({ ...form, location_state: e.target.value })}
              />
            </FormField>

            <FormField label="Priority">
              <select
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}
