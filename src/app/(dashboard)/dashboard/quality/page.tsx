"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, FileText, ClipboardList } from "lucide-react";

interface Inspection {
  id: string;
  inspector_id?: string;
  score: number;
  status: "passed" | "failed" | "conditional" | string;
  notes?: string;
  client_id?: string;
  job_id?: string;
  facility_name?: string;
  created_at: string;
  [key: string]: any;
}

export default function QualityPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    score: "95",
    status: "passed",
    notes: "",
    inspector: "Operations Quality Lead",
  });

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: insData }, { data: clientData }] = await Promise.all([
        supabase.from("qa_inspections").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name"),
      ]);

      setInspections(insData || []);
      setClients(clientData || []);
    } catch (err) {
      console.error("Failed to load QA inspections", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  // Compute metrics
  const metrics = useMemo(() => {
    if (inspections.length === 0) {
      return { total: 0, avgScore: "—", passRate: "—", failedCount: 0 };
    }
    const total = inspections.length;
    const avg = Math.round(inspections.reduce((acc, i) => acc + (Number(i.score) || 0), 0) / total);
    const passed = inspections.filter((i) => (Number(i.score) >= 80) || i.status === "passed").length;
    const rate = Math.round((passed / total) * 100);
    const failed = total - passed;
    return {
      total,
      avgScore: `${avg}%`,
      passRate: `${rate}%`,
      failedCount: failed,
    };
  }, [inspections]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const scoreNum = parseFloat(form.score) || 0;
      const computedStatus = scoreNum >= 80 ? "passed" : "failed";

      const payload = {
        inspector_id: form.inspector,
        score: scoreNum,
        status: computedStatus,
        notes: form.notes,
        client_id: form.clientId || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("qa_inspections").insert([payload]);
      if (error) throw error;

      setShowModal(false);
      setForm({
        clientId: "",
        score: "95",
        status: "passed",
        notes: "",
        inspector: "Operations Quality Lead",
      });
      fetchInspections();
    } catch (err: any) {
      alert("Failed to submit QA inspection: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const columns: Column<Inspection>[] = [
    {
      key: "id",
      header: "Inspection ID",
      sortable: true,
      render: (i) => (
        <span className="font-mono text-caption text-text-muted">
          QA-{i.id ? i.id.slice(0, 8).toUpperCase() : "REC"}
        </span>
      ),
    },
    {
      key: "score",
      header: "Quality Score",
      sortable: true,
      render: (i) => {
        const s = Number(i.score) || 0;
        const color =
          s >= 90
            ? "text-success-600 font-semibold"
            : s >= 80
            ? "text-primary-600 font-semibold"
            : s >= 70
            ? "text-warning-600 font-semibold"
            : "text-danger-600 font-semibold";
        return (
          <div className="flex items-center gap-2">
            <span className={color}>{s}%</span>
            <div className="w-16 h-1.5 rounded-full bg-surface-hover overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  s >= 80 ? "bg-success-500" : s >= 70 ? "bg-warning-500" : "bg-danger-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, s))}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Compliance Status",
      sortable: true,
      render: (i) => {
        const s = i.status || (Number(i.score) >= 80 ? "passed" : "failed");
        return (
          <StatusBadge
            status={s === "passed" ? "Active" : s === "failed" ? "Cancelled" : "Draft"}
            label={s.toUpperCase()}
          />
        );
      },
    },
    {
      key: "inspector_id",
      header: "Auditor / Inspector",
      render: (i) => (
        <span className="text-body-sm text-text-primary">
          {i.inspector_id || "Lead Field Inspector"}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Observations & Findings",
      render: (i) => (
        <span className="text-body-sm text-text-secondary truncate max-w-[280px] block" title={i.notes || ""}>
          {i.notes || "No deficiency notes recorded."}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date Audited",
      sortable: true,
      render: (i) => (
        <span className="text-caption text-text-muted">
          {i.created_at ? new Date(i.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality & Compliance Assurance"
        description="Comprehensive audit scores, facility sanitation reviews, and standard operating compliance"
        breadcrumbs={[
          { label: "Operations", href: "/dashboard/operations" },
          { label: "Quality Assurance" },
        ]}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record Inspection
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Audits"
          value={metrics.total}
          subtitle="All recorded QA reviews"
          icon={<ClipboardList className="w-5 h-5" />}
        />
        <MetricCard
          title="Average Quality Score"
          value={metrics.avgScore}
          subtitle="Benchmark: 85% target"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <MetricCard
          title="Passing Rate"
          value={metrics.passRate}
          subtitle="Meets SLA requirements"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          title="Deficiencies / Failed"
          value={metrics.failedCount}
          subtitle="Requires CAPA follow-up"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Table */}
      <DataTable
        data={inspections}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search inspections by notes, auditor, ID..."
        searchKeys={["notes", "inspector_id", "status"]}
        emptyTitle="No Quality Inspections Logged"
        emptyDescription="Audit records and facility cleanliness reviews will appear here once conducted."
        emptyAction={
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Log First Inspection
          </button>
        }
      />

      {/* Record Inspection Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Log Quality Inspection"
        description="Record a facility sanitization and procedure audit score."
        size="md"
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
              form="inspection-form"
              disabled={isAdding}
              className="btn btn-primary btn-sm"
            >
              {isAdding ? "Saving..." : "Save Audit"}
            </button>
          </>
        }
      >
        <form id="inspection-form" onSubmit={handleAdd} className="space-y-4">
          <FormField label="Client Facility" required>
            <select
              className="form-input"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">General Facility Audit</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Audit Score (0-100)" required hint="Pass threshold is 80%">
              <input
                type="number"
                min="0"
                max="100"
                required
                className="form-input"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
              />
            </FormField>

            <FormField label="Auditor / Inspector" required>
              <input
                type="text"
                required
                className="form-input"
                value={form.inspector}
                onChange={(e) => setForm({ ...form, inspector: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Audit Findings & Detailed Notes">
            <textarea
              className="form-input h-24 resize-none"
              placeholder="Record surface swab tests, trash removal, chemical storage, PPE compliance..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
