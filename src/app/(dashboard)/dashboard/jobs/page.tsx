"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, Modal, FormField, MetricCard } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ClipboardList, Plus, Play, CheckCircle2, Clock, AlertTriangle, CalendarDays } from "lucide-react";
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
      const [
        { data: jobsData },
        { data: clientsData },
      ] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name"),
      ]);

      // Try fetching employees via API
      try {
        const empRes = await fetch("/api/hr/employees");
        const empJson = await empRes.json();
        if (empJson.data) setEmployees(empJson.data);
      } catch {}

      if (jobsData) setJobs(jobsData);
      if (clientsData) setClients(clientsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
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
      const { error } = await supabase.from("jobs").insert([payload]);
      if (error) throw error;

      setShowAddModal(false);
      setForm({
        client_id: "", service_type: "Standard Commercial Cleaning",
        assigned_to: "", job_date: new Date().toISOString().split("T")[0],
        location: "", notes: "",
      });
      fetchData();
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
      const { error } = await supabase.from("jobs").update({ status: newStatus }).eq("id", jobId);
      if (error) throw error;
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
      render: (val) => (
        <span className="text-caption font-mono text-text-muted">{val?.substring(0, 8)}...</span>
      ),
    },
    {
      key: "service_type",
      label: "Service",
      sortable: true,
      render: (val) => (
        <span className="text-body-sm font-medium">{val || "—"}</span>
      ),
    },
    {
      key: "client_id",
      label: "Client",
      sortable: true,
      render: (val) => {
        const client = clients.find((c) => c.id === val);
        return <span className="text-body-sm">{client?.name || "—"}</span>;
      },
    },
    {
      key: "job_date",
      label: "Date",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : "—",
    },
    {
      key: "location",
      label: "Location",
      render: (val) => <span className="text-body-sm text-text-secondary truncate max-w-[180px] block">{val || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => <StatusBadge status={val || "Created"} dot />,
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
      <div className="flex items-center gap-5 border-b border-border">
        <Link href="/dashboard/jobs" className="tab tab-active">All Jobs</Link>
        <Link href="/dashboard/jobs/checklists" className="tab">Checklists</Link>
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
