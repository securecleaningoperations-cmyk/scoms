"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ClipboardList,
  Eye,
  Check,
  Building2,
  Calendar,
  User,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";

interface Inspection {
  id: string;
  inspector_id?: string | null;
  score?: number | string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  client_id?: string | null;
  checklist?: any[] | null;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  points: number;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "Cleanroom HEPA filtration airflow within ISO Class spec", checked: true, points: 20 },
  { id: "c2", label: "Touchpoint electrostatic disinfection (ATP RLU < 30)", checked: true, points: 20 },
  { id: "c3", label: "Hazardous waste and sharps disposal compliance verified", checked: true, points: 20 },
  { id: "c4", label: "PPE, eye wash stations, and SDS binders verified", checked: true, points: 20 },
  { id: "c5", label: "Floor micro-scrubbing and static dissipative polish check", checked: false, points: 20 },
];

export default function QualityPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "passed" | "deficiencies">("all");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  const [form, setForm] = useState({
    clientId: "",
    customFacility: "",
    score: "95",
    status: "passed",
    notes: "",
    inspector: "Sarah Jenkins (QA Director)",
    checklist: DEFAULT_CHECKLIST,
  });

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      let insData: any[] | null = null;
      try {
        const res = await fetch("/api/qa-inspections");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            insData = json.data;
          }
        }
      } catch (apiErr) {
        console.warn("Could not query /api/qa-inspections:", apiErr);
      }

      if (!insData) {
        const { data } = await supabase
          .from("qa_inspections")
          .select("*")
          .order("created_at", { ascending: false });
        insData = data;
      }

      const { data: clientData } = await supabase
        .from("clients")
        .select("id, name")
        .order("name");

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

  // Compute metrics safely
  const metrics = useMemo(() => {
    if (!inspections || inspections.length === 0) {
      return { total: 0, avgScore: "0%", passRate: "0%", failedCount: 0 };
    }
    const total = inspections.length;
    const avg = Math.round(
      inspections.reduce((acc, i) => acc + (Number(i?.score) || 0), 0) / total
    );
    const passed = inspections.filter(
      (i) => Number(i?.score) >= 80 || i?.status === "passed"
    ).length;
    const rate = Math.round((passed / total) * 100);
    const failed = total - passed;
    return {
      total,
      avgScore: `${avg}%`,
      passRate: `${rate}%`,
      failedCount: failed,
    };
  }, [inspections]);

  const filteredInspections = useMemo(() => {
    if (activeFilter === "passed") {
      return inspections.filter((i) => Number(i?.score) >= 80 || i?.status === "passed");
    }
    if (activeFilter === "deficiencies") {
      return inspections.filter(
        (i) => (Number(i?.score) < 80 && i?.status !== "passed") || i?.status === "needs_action"
      );
    }
    return inspections;
  }, [inspections, activeFilter]);

  const handleToggleChecklist = (id: string) => {
    const nextList = form.checklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    const calculatedScore = nextList.reduce(
      (acc, cur) => acc + (cur.checked ? cur.points : 0),
      0
    );
    setForm({
      ...form,
      checklist: nextList,
      score: String(calculatedScore),
      status: calculatedScore >= 80 ? "passed" : "failed",
    });
  };

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAdding(true);
    try {
      const scoreNum = parseFloat(form.score) || 0;
      const computedStatus = scoreNum >= 80 ? "passed" : "needs_action";

      const payload = {
        inspector_id: form.inspector.trim() || "Lead Field Inspector",
        score: scoreNum,
        status: computedStatus,
        notes: form.notes.trim() || "Standard sanitization & safety audit completed.",
        client_id: form.clientId || null,
        created_at: new Date().toISOString(),
        checklist: form.checklist,
      };

      let saved = false;
      try {
        const res = await fetch("/api/qa-inspections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) saved = true;
      } catch (apiErr) {
        console.warn("API insert failed, using client:", apiErr);
      }

      if (!saved) {
        const { error } = await supabase.from("qa_inspections").insert([payload]);
        if (error) throw error;
      }

      setShowModal(false);
      setForm({
        clientId: "",
        customFacility: "",
        score: "95",
        status: "passed",
        notes: "",
        inspector: "Sarah Jenkins (QA Director)",
        checklist: DEFAULT_CHECKLIST,
      });
      await fetchInspections();
      alert("Quality Inspection recorded successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit QA inspection: " + (err.message || "Unknown error"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteInspection = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this inspection audit?")) return;
    setInspections(prev => prev.filter(i => i.id !== id));
    if (selectedInspection?.id === id) setSelectedInspection(null);

    try {
      const res = await fetch(`/api/qa-inspections?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        await supabase.from("qa_inspections").delete().eq("id", id);
      }
    } catch (err) {
      console.warn("Delete inspection error:", err);
    }
  };

  // Safe column renderers: inspect both (val, row) and fallback row
  const columns: Column<Inspection>[] = [
    {
      key: "id",
      header: "Inspection ID",
      sortable: true,
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const idVal = target?.id || (typeof val === "string" ? val : "");
        return (
          <span className="font-mono text-caption text-text-muted font-bold">
            QA-{idVal ? idVal.slice(0, 8).toUpperCase() : "REC-01"}
          </span>
        );
      },
    },
    {
      key: "client_id",
      header: "Facility / Site",
      sortable: true,
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const cId = target?.client_id || (typeof val === "string" ? val : "");
        const client = clients.find((c) => c.id === cId);
        return (
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 text-body-sm">
              {client?.name || target?.facility_name || "General Facility"}
            </span>
          </div>
        );
      },
    },
    {
      key: "score",
      header: "Quality Score",
      sortable: true,
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const s = Number(target?.score ?? val ?? 0) || 0;
        const color =
          s >= 90
            ? "text-emerald-700 font-bold"
            : s >= 80
            ? "text-blue-700 font-bold"
            : s >= 70
            ? "text-amber-700 font-bold"
            : "text-rose-700 font-bold";
        return (
          <div className="flex items-center gap-2">
            <span className={`text-sm ${color}`}>{s}%</span>
            <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full ${
                  s >= 80 ? "bg-emerald-500" : s >= 70 ? "bg-amber-500" : "bg-rose-500"
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
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const rawStatus = target?.status || val || "passed";
        const isPass = rawStatus === "passed" || Number(target?.score) >= 80;
        return (
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              isPass
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {isPass ? "PASSED" : "NEEDS ACTION"}
          </span>
        );
      },
    },
    {
      key: "inspector_id",
      header: "Auditor / Inspector",
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const name = target?.inspector_id || (typeof val === "string" ? val : null);
        return (
          <div className="flex items-center gap-1.5 text-body-sm text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{name || "Lead Field Inspector"}</span>
          </div>
        );
      },
    },
    {
      key: "notes",
      header: "Observations & Findings",
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const noteText = target?.notes || (typeof val === "string" ? val : "");
        return (
          <span
            className="text-body-sm text-slate-600 truncate max-w-[260px] block"
            title={noteText || "No deficiency notes"}
          >
            {noteText || "Routine quality inspection verified."}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Date Audited",
      sortable: true,
      render: (val: any, row?: Inspection) => {
        const target = row || (typeof val === "object" ? val : null);
        const dateStr = target?.created_at || (typeof val === "string" ? val : null);
        return (
          <span className="text-caption text-slate-500">
            {dateStr ? new Date(dateStr).toLocaleDateString() : "Today"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_val: any, row?: Inspection) => {
        const item = row || (typeof _val === "object" ? _val : null);
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedInspection(item || null)}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="View detailed audit checklist"
            >
              <Eye className="w-3.5 h-3.5" /> Details
            </button>
            {item?.id && (
              <button
                onClick={(e) => handleDeleteInspection(item.id, e)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Delete inspection audit"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quality & Compliance Assurance"
        description="OSHA checklist verification, facility sanitation scores, and compliance audit reporting."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Audits"
          value={metrics.total}
          subtitle="All recorded QA reviews"
          icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Average Quality Score"
          value={metrics.avgScore}
          subtitle="Benchmark: 85% target"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Passing Rate"
          value={metrics.passRate}
          subtitle="Meets SLA requirements"
          icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
        />
        <MetricCard
          title="Deficiencies / Action Required"
          value={metrics.failedCount}
          subtitle="Requires CAPA follow-up"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeFilter === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          All Audits ({inspections.length})
        </button>
        <button
          onClick={() => setActiveFilter("passed")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeFilter === "passed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
          }`}
        >
          Passed (80%+)
        </button>
        <button
          onClick={() => setActiveFilter("deficiencies")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeFilter === "deficiencies"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:text-rose-700 hover:bg-slate-100"
          }`}
        >
          Needs Action ({metrics.failedCount})
        </button>
      </div>

      {/* Table */}
      <DataTable
        data={filteredInspections}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search inspections by notes, auditor, ID..."
        searchKeys={["notes", "inspector_id", "status"]}
        emptyTitle="No Quality Inspections Found"
        emptyDescription="Record your first facility audit to establish baseline sanitation benchmarks."
        emptyAction={
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Log First Inspection
          </button>
        }
      />

      {/* Detailed Audit View Modal */}
      {selectedInspection && (
        <Modal
          open={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          title={`Audit Details — QA-${(selectedInspection.id || "").slice(0, 8).toUpperCase()}`}
          description="Detailed compliance scores, checklist verification, and findings."
          size="lg"
          footer={
            <button
              onClick={() => setSelectedInspection(null)}
              className="btn btn-secondary btn-sm"
            >
              Close
            </button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Overall Score</p>
                <p
                  className={`text-2xl font-bold mt-0.5 ${
                    Number(selectedInspection.score) >= 80
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {selectedInspection.score}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Compliance</p>
                <span
                  className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    Number(selectedInspection.score) >= 80
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {Number(selectedInspection.score) >= 80 ? "Passed" : "Needs Action"}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Inspector</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {selectedInspection.inspector_id || "Lead Field Inspector"}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3">Audit Checklist Items</h4>
              <div className="space-y-2">
                {(selectedInspection.checklist && selectedInspection.checklist.length > 0
                  ? selectedInspection.checklist
                  : DEFAULT_CHECKLIST
                ).map((c: any, idx: number) => (
                  <div
                    key={c.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center ${
                          c.checked ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {c.checked ? <Check className="w-3.5 h-3.5" /> : null}
                      </div>
                      <span className="text-sm text-slate-800 font-medium">{c.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {c.checked ? "+20 pts" : "0 pts"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Auditor Notes & Observations</h4>
              <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {selectedInspection.notes || "No deficiency notes recorded."}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Inspection Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Log Quality Inspection & Audit"
        description="Record a facility sanitization audit, ISO cleanroom compliance check, or routine walkthrough score."
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
              onClick={() => handleAdd()}
              disabled={isAdding}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Inspection Audit"
              )}
            </button>
          </>
        }
      >
        <form
          id="inspection-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="space-y-4"
        >
          <FormField label="Client Facility" required>
            <select
              className="form-input"
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            >
              <option value="">General Facility Audit (Direct)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quality Score (0-100)" required hint="Pass threshold is 80%">
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

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Interactive Compliance Checklist (Ticking adjusts score)
            </label>
            <div className="space-y-2 border border-slate-200 p-3 rounded-xl bg-slate-50/50">
              {form.checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-800 font-medium">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    +{item.points} pts
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FormField label="Audit Findings & Deficiencies (if any)">
            <textarea
              className="form-input h-20 resize-none"
              placeholder="Record any ATP swab anomalies, missed high-touch areas, or PPE compliance notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
