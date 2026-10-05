"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ClipboardList, Plus, Play, CheckCircle2, Clock, AlertTriangle, CalendarDays, CheckSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────

interface Job {
  id: string;
  client_id?: string;
  client_name?: string;
  service_type?: string;
  status: string;
  assigned_to?: string;
  assigned_name?: string;
  job_date?: string;
  location?: string;
  notes?: string;
  created_at?: string;
  service?: string;
  title?: string;
  client?: string;
  clients?: any;
  scheduled_at?: string;
  location_address?: string;
}

// ── Job Lifecycle (spec section 19) ─────────────────────────────────

const JOB_STATUSES = [
  "Created", "Assigned", "Accepted", "En Route",
  "In Progress", "Completed", "Inspected", "Approved", "Closed",
] as const;

const VALID_TRANSITIONS: Record<string, string[]> = {
  Created: ["Assigned"],
  Assigned: ["Accepted", "Created"],
  Accepted: ["En Route", "Assigned"],
  "En Route": ["In Progress", "Accepted"],
  "In Progress": ["Completed"],
  Completed: ["Inspected"],
  Inspected: ["Approved", "In Progress"],
  Approved: ["Closed"],
  Closed: [],
};

// ── Component ──────────────────────────────────────────────────────────

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    service_type: "Standard Commercial Cleaning",
    assigned_to: "",
    job_date: new Date().toISOString().split("T")[0],
    location: "",
    notes: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Primary: use server API route (bypasses RLS)
      let jobsData: Job[] = [];
      let clientsData: { id: string; name: string }[] = [];

      try {
        const [jobsRes, clientsRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/clients"),
        ]);
        const jobsJson = await jobsRes.json();
        const clientsJson = await clientsRes.json();
        if (jobsJson.data) jobsData = jobsJson.data;
        if (clientsJson.data) clientsData = clientsJson.data;
      } catch {
        // Fallback: direct Supabase query
        const [j, c] = await Promise.all([
          supabase.from("jobs").select("*").order("created_at", { ascending: false }),
          supabase.from("clients").select("id, name"),
        ]);
        if (j.data) jobsData = j.data;
        if (c.data) clientsData = c.data;
      }

      setJobs(jobsData || []);
      setClients(clientsData || []);

      // Employees via HR API
      try {
        const empRes = await fetch("/api/hr/employees");
        const empJson = await empRes.json();
        if (empJson.data) setEmployees(empJson.data || []);
      } catch {}
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleEntityCreated = (e: any) => {
      if (e.detail?.type === "job") fetchData();
    };
    window.addEventListener("scoms-entity-created", handleEntityCreated);
    return () => window.removeEventListener("scoms-entity-created", handleEntityCreated);
  }, [fetchData]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      client_id: form.client_id || null,
      service_type: form.service_type,
      status: "Created",
      assigned_to: form.assigned_to || null,
      job_date: form.job_date,
      location: form.location,
      notes: form.notes,
    };

    try {
      let success = false;
      // Try API route first
      try {
        const res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (res.ok && json.data) success = true;
        else if (json.error) throw new Error(json.error);
      } catch {
        // Fallback to direct supabase
        const { error } = await supabase.from("jobs").insert([payload]);
        if (error) throw error;
        success = true;
      }

      if (success) {
        setShowAddModal(false);
        setForm({
          client_id: "", service_type: "Standard Commercial Cleaning",
          assigned_to: "", job_date: new Date().toISOString().split("T")[0],
          location: "", notes: "",
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create job");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusTransition = async (jobId: string, currentStatus: string, newStatus: string) => {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      alert(`Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowed.join(", ") || "none"}`);
      return;
    }

    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId, status: newStatus }),
      });
      if (!res.ok) {
        // Fallback
        const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);
        if (error) throw error;
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Metrics ──────────────────────────────────────────────────────

  const activeJobs = jobs.filter((j) => ["In Progress", "in_progress", "Assigned", "assigned", "En Route", "Accepted"].includes(j.status)).length;
  const completedJobs = jobs.filter((j) => ["Completed", "completed", "Approved", "approved", "Closed", "closed"].includes(j.status)).length;
  const totalJobs = jobs.length;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // ── Table Columns ─────────────────────────────────────────────────

  const columns: Column<Job>[] = [
    {
      key: "id",
      label: "Job ID",
      sortable: true,
      width: "100px",
      render: (val, row) => {
        const idStr = typeof val === "string" ? val : (typeof row?.id === "string" ? row.id : "");
        return <span className="text-caption font-mono text-text-muted">{idStr ? `${idStr.substring(0, 8)}...` : "—"}</span>;
      },
    },
    {
      key: "service_type",
      label: "Service",
      sortable: true,
      render: (val, row) => {
        const serviceName = typeof val === "string" ? val : (typeof row?.service === "string" ? row.service : (typeof row?.title === "string" ? row.title : "—"));
        return <span className="text-body-sm font-medium">{serviceName}</span>;
      },
    },
    {
      key: "client_id",
      label: "Client",
      sortable: true,
      render: (val, row) => {
        const client = clients.find((c) => c.id === val);
        const name = client?.name || (typeof row?.clients === "object" && row?.clients?.name ? row.clients.name : null) || (typeof row?.client === "string" ? row.client : null);
        return <span className="text-body-sm">{name || "—"}</span>;
      },
    },
    {
      key: "job_date",
      label: "Date",
      sortable: true,
      render: (val, row) => {
        const dateVal = val || row?.scheduled_at || row?.created_at;
        return dateVal && typeof dateVal === "string" ? new Date(dateVal).toLocaleDateString() : "—";
      },
    },
    {
      key: "location",
      label: "Location",
      render: (val, row) => {
        const loc = typeof val === "string" ? val : (typeof row?.location_address === "string" ? row.location_address : "—");
        return <span className="text-body-sm text-text-secondary truncate max-w-[180px] block">{loc}</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val, row) => {
        const statusStr = typeof val === "string" ? val : (typeof row?.status === "string" ? row.status : "Created");
        return <StatusBadge status={statusStr} dot />;
      },
    },
  ];

  return (
    <div className="p-6 max-w-[1300px] mx-auto space-y-5 pb-12">
      <PageHeader
        title="Job Management"
        description="Track service jobs from creation through completion, inspection, and approval."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Operations" },
          { label: "Jobs" },
        ]}
        actions={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        }
      />

      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
        <Link
          href="/dashboard/jobs"
          className="px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-2 shrink-0"
        >
          <ClipboardList className="w-4 h-4" />
          <span>All Jobs</span>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold border border-blue-200">
            {jobs.length}
          </span>
        </Link>
        <Link
          href="/dashboard/jobs/checklists"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <CheckSquare className="w-4 h-4 text-emerald-500" />
          <span>Checklists &amp; Templates</span>
        </Link>
        <Link
          href="/dashboard/quality"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>QA Inspections</span>
        </Link>
        <Link
          href="/dashboard/quality/capa"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Six Sigma CAPA</span>
        </Link>
      </div>

      {/* Metrics */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Jobs" value={totalJobs} icon={<ClipboardList className="w-4 h-4" />} />
          <MetricCard label="Active Jobs" value={activeJobs} icon={<Play className="w-4 h-4" />} />
          <MetricCard label="Completed" value={completedJobs} icon={<CheckCircle2 className="w-4 h-4" />} />
          <MetricCard
            label="Completion Rate"
            value={`${completionRate}%`}
            icon={<Clock className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={jobs}
        columns={columns}
        loading={loading}
        emptyTitle="No jobs created yet"
        emptyDescription="Create your first service job to start tracking field operations."
        emptyAction={
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" />
            Create First Job
          </button>
        }
        searchable
        searchPlaceholder="Search jobs by service, location, status..."
        searchKeys={["service_type", "location", "status", "notes"]}
        exportable
        selectable
        onRowClick={(row) => router.push(`/dashboard/jobs/${row.id}`)}
        rowActions={(row) => {
          const allowed = VALID_TRANSITIONS[row.status] || [];
          if (allowed.length === 0) return null;
          return (
            <div className="flex items-center gap-1">
              {allowed.slice(0, 2).map((next) => (
                <button
                  key={next}
                  onClick={() => handleStatusTransition(row.id, row.status, next)}
                  className="btn btn-ghost btn-sm !text-caption text-primary-600"
                  title={`Move to ${next}`}
                >
                  → {next}
                </button>
              ))}
            </div>
          );
        }}
      />

      {/* Job Lifecycle Reference */}
      <div className="scoms-panel p-4">
        <h3 className="text-label font-medium text-text-muted uppercase tracking-wide mb-2">Job Lifecycle</h3>
        <div className="flex items-center gap-1 flex-wrap text-caption text-text-muted">
          {JOB_STATUSES.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <StatusBadge status={s} size="sm" />
              {i < JOB_STATUSES.length - 1 && <span className="text-text-disabled">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── Create Job Modal ────────────────────────────────────────── */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Job"
        description="Schedule a new service job."
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddJob} disabled={saving}>
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Create Job
            </button>
          </>
        }
      >
        <form onSubmit={handleAddJob} className="space-y-4">
          <FormField label="Client">
            <select
              className="input"
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Service Type" required>
            <select
              required
              className="input"
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value })}
            >
              <option value="Standard Commercial Cleaning">Standard Commercial Cleaning</option>
              <option value="Deep Clean">Deep Clean</option>
              <option value="Floor Care">Floor Care</option>
              <option value="Window Cleaning">Window Cleaning</option>
              <option value="Post-Construction">Post-Construction</option>
              <option value="Medical Facility">Medical Facility</option>
              <option value="Industrial">Industrial</option>
              <option value="Emergency Clean">Emergency Clean</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Job Date" required>
              <input
                required
                type="date"
                className="input"
                value={form.job_date}
                onChange={(e) => setForm({ ...form, job_date: e.target.value })}
              />
            </FormField>
            <FormField label="Assigned To">
              <select
                className="input"
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Location">
            <input
              type="text"
              className="input"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Address or site name"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              className="input !min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special instructions, access codes, etc."
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
