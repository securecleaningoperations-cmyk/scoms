"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  PageHeader,
  StatusBadge,
  Modal,
  Drawer,
  FormField,
  MetricCard,
  EmptyState,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  FileCheck,
} from "lucide-react";

interface Incident {
  id: string;
  incident_number?: string | null;
  title: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  status: "reported" | "under_investigation" | "corrective_action" | "closed" | string;
  description: string;
  immediate_action?: string | null;
  investigation_notes?: string | null;
  root_cause?: string | null;
  location?: string | null;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

const INCIDENT_TYPES = [
  "chemical",
  "spill",
  "slip_fall",
  "ppe_violation",
  "property_damage",
  "equipment",
  "security",
  "near_miss",
  "other",
];

const SEVERITY_OPTIONS = ["low", "medium", "high", "critical"];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  reported: ["under_investigation"],
  under_investigation: ["corrective_action", "closed"],
  corrective_action: ["closed"],
  closed: ["under_investigation"], // reopen
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "chemical",
    severity: "medium",
    location: "",
    description: "",
    immediate_action: "",
  });

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (err: any) {
      console.error("Failed to load incidents:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter((i) => i.severity === "critical" || i.severity === "high").length;
    const open = incidents.filter((i) => i.status !== "closed").length;
    const inCapa = incidents.filter((i) => i.status === "corrective_action").length;
    return { total, critical, open, inCapa };
  }, [incidents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      const incNum = `INC-${Date.now().toString().slice(-6)}`;
      const payload = {
        incident_number: incNum,
        title: form.title.trim(),
        type: form.type,
        severity: form.severity,
        location: form.location.trim() || null,
        description: form.description.trim(),
        immediate_action: form.immediate_action.trim() || null,
        status: "reported",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("incidents").insert([payload]);
      if (error) throw error;

      setShowModal(false);
      setForm({
        title: "",
        type: "chemical",
        severity: "medium",
        location: "",
        description: "",
        immediate_action: "",
      });
      fetchIncidents();
    } catch (err: any) {
      alert("Error logging incident: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTransition = async (incidentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("incidents")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", incidentId);

      if (error) throw error;

      setIncidents((prev) =>
        prev.map((i) => (i.id === incidentId ? { ...i, status: newStatus } : i))
      );
      if (activeIncident && activeIncident.id === incidentId) {
        setActiveIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const columns: Column<Incident>[] = [
    {
      key: "incident_number",
      header: "Incident #",
      sortable: true,
      render: (i) => (
        <span className="font-mono text-caption text-text-primary font-medium">
          {i.incident_number || `INC-${i.id.slice(0, 6)}`}
        </span>
      ),
    },
    {
      key: "title",
      header: "Title & Incident Details",
      sortable: true,
      render: (i) => (
        <div>
          <span className="font-medium text-text-primary block text-body-sm">{i.title}</span>
          <span className="text-caption text-text-muted capitalize">{i.type?.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (i) => {
        const sev = i.severity?.toLowerCase();
        let badgeStatus: "Draft" | "Active" | "Pending" | "Suspended" | "Cancelled" = "Draft";
        if (sev === "critical") badgeStatus = "Cancelled";
        else if (sev === "high") badgeStatus = "Suspended";
        else if (sev === "medium") badgeStatus = "Pending";
        else badgeStatus = "Active";

        return <StatusBadge status={badgeStatus} label={sev?.toUpperCase()} />;
      },
    },
    {
      key: "status",
      header: "Investigation Status",
      sortable: true,
      render: (i) => {
        let badgeStatus: "Draft" | "Active" | "Pending" | "Suspended" | "Cancelled" = "Pending";
        if (i.status === "closed") badgeStatus = "Active";
        else if (i.status === "corrective_action") badgeStatus = "Suspended";
        else if (i.status === "under_investigation") badgeStatus = "Pending";

        return (
          <StatusBadge
            status={badgeStatus}
            label={i.status?.replace("_", " ").toUpperCase()}
          />
        );
      },
    },
    {
      key: "created_at",
      header: "Reported At",
      sortable: true,
      render: (i) => (
        <span className="text-caption text-text-muted">
          {new Date(i.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (i) => (
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => setActiveIncident(i)}
            className="btn btn-ghost btn-sm text-text-secondary"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {STATUS_TRANSITIONS[i.status]?.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => handleTransition(i.id, nextStatus)}
              className="btn btn-secondary btn-sm text-[11px] px-2 py-0.5"
            >
              {nextStatus.replace("_", " ")}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incidents & Safety Management (CAPA)"
        description="Hazard reports, chemical exposure logs, root-cause investigations, and corrective actions"
        breadcrumbs={[
          { label: "Operations", href: "/dashboard/operations" },
          { label: "Incidents & Safety" },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Report Incident
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Incidents"
          value={metrics.total}
          subtitle="All reported occurrences"
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <MetricCard
          title="Open Investigations"
          value={metrics.open}
          subtitle="Awaiting resolution"
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          title="Critical / High Risk"
          value={metrics.critical}
          subtitle="Immediate safety priority"
          icon={<Flame className="w-5 h-5" />}
        />
        <MetricCard
          title="In Corrective Action (CAPA)"
          value={metrics.inCapa}
          subtitle="Remediation active"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Incidents Table */}
      <DataTable
        data={incidents}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search incident by title, type, ID..."
        searchKeys={["title", "type", "description", "incident_number"]}
        emptyTitle="Zero Safety Incidents Logged"
        emptyDescription="All cleaning operations and facilities are currently operating without safety breaches."
        emptyAction={
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Report Safety Incident
          </button>
        }
      />

      {/* Create Incident Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Report Safety or Operational Incident"
        description="Document safety risks, spills, physical injuries, or facility issues for immediate investigation."
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
              type="submit"
              form="incident-form"
              disabled={saving}
              className="btn btn-danger btn-sm"
            >
              {saving ? "Submitting..." : "Submit Incident Report"}
            </button>
          </>
        }
      >
        <form id="incident-form" onSubmit={handleCreate} className="space-y-4">
          <FormField label="Incident Title" required hint="Brief descriptive summary">
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Hazardous chemical spill in loading bay"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Incident Category" required>
              <select
                className="form-input capitalize"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Severity Level" required>
              <select
                className="form-input capitalize"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Facility Location">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Building B - Level 2 Cleanroom"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </FormField>

          <FormField label="Detailed Description of Occurrence" required>
            <textarea
              required
              className="form-input h-24 resize-none"
              placeholder="Detail the circumstances, personnel involved, and hazardous conditions observed..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>

          <FormField label="Immediate Actions Taken (Containment)">
            <textarea
              className="form-input h-20 resize-none"
              placeholder="e.g. Area cordoned off, ventilation activated, first aid administered..."
              value={form.immediate_action}
              onChange={(e) => setForm({ ...form, immediate_action: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>

      {/* Incident Detail Drawer */}
      <Drawer
        open={!!activeIncident}
        onClose={() => setActiveIncident(null)}
        title={activeIncident?.title || "Incident Investigation"}
        size="md"
      >
        {activeIncident && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="font-mono text-caption text-text-muted">
                  {activeIncident.incident_number || activeIncident.id}
                </span>
                <p className="text-body-sm font-semibold text-text-primary capitalize mt-0.5">
                  Type: {activeIncident.type?.replace("_", " ")}
                </p>
              </div>
              <StatusBadge
                status={activeIncident.status === "closed" ? "Active" : "Pending"}
                label={activeIncident.status?.replace("_", " ").toUpperCase()}
              />
            </div>

            <div>
              <h4 className="text-body-sm font-semibold text-text-primary mb-1">Occurrence Details</h4>
              <p className="text-body-sm text-text-secondary whitespace-pre-wrap bg-surface-hover p-3 rounded-lg border border-border">
                {activeIncident.description}
              </p>
            </div>

            {activeIncident.immediate_action && (
              <div>
                <h4 className="text-body-sm font-semibold text-text-primary mb-1">Immediate Containment</h4>
                <p className="text-body-sm text-text-secondary whitespace-pre-wrap bg-surface-hover p-3 rounded-lg border border-border">
                  {activeIncident.immediate_action}
                </p>
              </div>
            )}

            {activeIncident.root_cause && (
              <div>
                <h4 className="text-body-sm font-semibold text-text-primary mb-1">Root Cause Analysis</h4>
                <p className="text-body-sm text-text-secondary whitespace-pre-wrap bg-surface-hover p-3 rounded-lg border border-border">
                  {activeIncident.root_cause}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h4 className="text-caption font-semibold uppercase text-text-muted mb-2">
                Lifecycle Action
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_TRANSITIONS[activeIncident.status]?.map((next) => (
                  <button
                    key={next}
                    onClick={() => handleTransition(activeIncident.id, next)}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    Transition to {next.replace("_", " ")} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
