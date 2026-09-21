"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  PageHeader,
  StatusBadge,
  MetricCard,
  Tabs,
  Modal,
  FormField,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Briefcase,
  DollarSign,
  FileText,
  AlertTriangle,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function Client360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [client, setClient] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [showJobModal, setShowJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: "",
    job_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    service: "Commercial Cleaning",
  });
  const [creatingJob, setCreatingJob] = useState(false);

  const fetchClientData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: clientData, error: clientErr } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (clientErr) throw clientErr;
      setClient(clientData);

      // Fetch related records in parallel
      const [{ data: jobsData }, { data: qaData }, { data: incData }] = await Promise.all([
        supabase.from("jobs").select("*").eq("client_id", id).order("job_date", { ascending: false }),
        supabase.from("qa_inspections").select("*").eq("client_id", id).order("created_at", { ascending: false }),
        supabase.from("incidents").select("*").eq("location", clientData?.name).order("created_at", { ascending: false }),
      ]);

      setJobs(jobsData || []);
      setInspections(qaData || []);
      setIncidents(incData || []);
    } catch (err) {
      console.error("Error fetching client 360:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleCreateJob = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!client) return;
    if (!newJobForm.title.trim()) {
      alert("Please enter a job scope or title.");
      return;
    }
    setCreatingJob(true);
    try {
      const payload = {
        client_id: client.id,
        client: client.name,
        title: newJobForm.title.trim(),
        service: newJobForm.service,
        job_date: newJobForm.job_date,
        start_time: newJobForm.start_time,
        location: client.address || "Client Main Facility",
        status: "Created",
      };
      const { error } = await supabase.from("jobs").insert([payload]);
      if (error) throw error;

      setShowJobModal(false);
      setNewJobForm({
        title: "",
        job_date: new Date().toISOString().split("T")[0],
        start_time: "09:00",
        service: "Commercial Cleaning",
      });
      fetchClientData();
    } catch (err: any) {
      alert("Error scheduling job: " + err.message);
    } finally {
      setCreatingJob(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Client 360 Profile..." />;
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="btn btn-secondary btn-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </button>
        <EmptyState
          title="Client Not Found"
          description="The requested enterprise account does not exist or has been archived."
          action={
            <Link href="/dashboard/clients" className="btn btn-primary btn-sm">
              Return to Directory
            </Link>
          }
        />
      </div>
    );
  }

  // Job columns
  const jobColumns: Column<any>[] = [
    {
      key: "title",
      header: "Job Title / Scope",
      sortable: true,
      render: (j) => (
        <div>
          <span className="font-semibold text-text-primary block text-body-sm">
            {j.title || j.service || "Scheduled Service"}
          </span>
          <span className="text-caption text-text-muted">{j.location || client.address}</span>
        </div>
      ),
    },
    {
      key: "job_date",
      header: "Scheduled Date",
      sortable: true,
      render: (j) => (
        <span className="text-body-sm text-text-secondary">
          {j.job_date ? new Date(j.job_date).toLocaleDateString() : "Recurring"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (j) => <StatusBadge status={j.status === "Completed" ? "Active" : "Pending"} label={j.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (j) => (
        <Link
          href={`/dashboard/jobs/${j.id}`}
          className="btn btn-ghost btn-sm text-primary-600 hover:text-primary-700"
        >
          View Job &rarr;
        </Link>
      ),
    },
  ];

  // QA columns
  const qaColumns: Column<any>[] = [
    {
      key: "score",
      header: "Score",
      sortable: true,
      render: (q) => (
        <span className="font-bold text-success-600 text-body-sm">{q.score}%</span>
      ),
    },
    {
      key: "status",
      header: "Compliance",
      sortable: true,
      render: (q) => (
        <StatusBadge
          status={q.status === "passed" ? "Active" : "Cancelled"}
          label={q.status?.toUpperCase() || "AUDITED"}
        />
      ),
    },
    {
      key: "notes",
      header: "Audit Findings",
      render: (q) => (
        <span className="text-body-sm text-text-secondary truncate max-w-sm block">
          {q.notes || "Standard sanitization verified."}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Audit Date",
      sortable: true,
      render: (q) => (
        <span className="text-caption text-text-muted">
          {new Date(q.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`Client ID: ${client.client_id || client.id.slice(0, 8)} • Classification: ${
          client.type || "Commercial Facility"
        }`}
        breadcrumbs={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: client.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJobModal(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Job
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Annual Value"
          value={client.annual_value ? `$${client.annual_value.toLocaleString()}/yr` : "Contract Active"}
          subtitle="Contract billing revenue"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <MetricCard
          title="Total Jobs Run"
          value={jobs.length}
          subtitle={`${jobs.filter((j) => j.status === "Completed").length} completed`}
          icon={<Briefcase className="w-5 h-5" />}
        />
        <MetricCard
          title="Quality Audits"
          value={inspections.length}
          subtitle={
            inspections.length > 0
              ? `Avg score ${Math.round(
                  inspections.reduce((a, b) => a + (b.score || 0), 0) / inspections.length
                )}%`
              : "No deficiencies"
          }
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <MetricCard
          title="Facility Incidents"
          value={incidents.length}
          subtitle="Safety breaches on record"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "overview", label: "Account Overview" },
          { id: "jobs", label: `Operational Jobs (${jobs.length})` },
          { id: "quality", label: `Quality Inspections (${inspections.length})` },
          { id: "incidents", label: `Incidents (${incidents.length})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Facility & Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-body-sm">
                <MapPin className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Facility Address</p>
                  <p className="text-text-secondary">{client.address || "Address on file"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-body-sm">
                <Phone className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Dispatch & Operations Phone</p>
                  <p className="text-text-secondary">{client.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-body-sm">
                <Mail className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Billing & Management Email</p>
                  <p className="text-text-secondary">{client.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Contract & Compliance Status
            </h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Client Lifecycle Status</span>
                <StatusBadge status="Active" label={client.status?.toUpperCase() || "ACTIVE"} />
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Service Classification</span>
                <span className="font-medium text-text-primary capitalize">{client.type || "Commercial"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Account Created</span>
                <span className="text-text-muted">
                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "jobs" && (
        <DataTable
          data={jobs}
          columns={jobColumns}
          searchable={true}
          searchPlaceholder="Search jobs..."
          searchKeys={["title", "service", "status"]}
          emptyTitle="No Jobs Scheduled"
          emptyDescription="Schedule a regular cleaning or specialized sanitization run for this client."
          emptyAction={
            <button onClick={() => setShowJobModal(true)} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4 mr-1.5" /> Schedule Job
            </button>
          }
        />
      )}

      {activeTab === "quality" && (
        <DataTable
          data={inspections}
          columns={qaColumns}
          searchable={false}
          emptyTitle="No Quality Audits Conducted"
          emptyDescription="Audit records will be attached here as facility inspections are conducted."
        />
      )}

      {activeTab === "incidents" && (
        <div className="card p-6">
          {incidents.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-success-500 opacity-60" />
              <p className="font-semibold text-text-primary">Zero Safety Incidents on Record</p>
              <p className="text-caption mt-0.5">Facility operations have 100% clean safety audit trail.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-primary text-body-sm">{inc.title}</p>
                    <p className="text-caption text-text-muted">{inc.description}</p>
                  </div>
                  <StatusBadge status="Pending" label={inc.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Job Modal */}
      <Modal
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        title={`Schedule Job for ${client.name}`}
        description="Book an operational service visit."
        size="md"
        footer={
          <>
            <button type="button" onClick={() => setShowJobModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateJob()}
              disabled={creatingJob}
              className="btn btn-primary btn-sm"
            >
              {creatingJob ? "Scheduling..." : "Schedule Job"}
            </button>
          </>
        }
      >
        <form id="client-job-form" onSubmit={handleCreateJob} className="space-y-4">
          <FormField label="Job Scope / Title" required>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Weekly Full Facility Terminal Clean"
              value={newJobForm.title}
              onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
            />
          </FormField>

          <FormField label="Service Type">
            <select
              className="form-input"
              value={newJobForm.service}
              onChange={(e) => setNewJobForm({ ...newJobForm, service: e.target.value })}
            >
              <option value="Commercial Cleaning">Commercial Cleaning</option>
              <option value="Cleanroom Sanitization">Cleanroom Sanitization</option>
              <option value="Floor Stripping & Waxing">Floor Stripping & Waxing</option>
              <option value="Disinfection Fogging">Disinfection Fogging</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Scheduled Date" required>
              <input
                type="date"
                required
                className="form-input"
                value={newJobForm.job_date}
                onChange={(e) => setNewJobForm({ ...newJobForm, job_date: e.target.value })}
              />
            </FormField>

            <FormField label="Start Time">
              <input
                type="time"
                className="form-input"
                value={newJobForm.start_time}
                onChange={(e) => setNewJobForm({ ...newJobForm, start_time: e.target.value })}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}
