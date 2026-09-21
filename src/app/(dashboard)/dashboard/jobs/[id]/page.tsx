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
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  User,
  ArrowLeft,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

const LIFECYCLE_ORDER = [
  "Created",
  "Assigned",
  "Accepted",
  "En Route",
  "In Progress",
  "Completed",
  "Inspected",
  "Approved",
  "Closed",
];

const STANDARD_CHECKLIST = [
  { id: "c1", label: "Perform initial site security check & sign in", completed: true },
  { id: "c2", label: "Deploy yellow wet floor / caution signage", completed: true },
  { id: "c3", label: "Terminal surface disinfection of high-touch points", completed: false },
  { id: "c4", label: "HEPA vacuum carpeted traffic lanes", completed: false },
  { id: "c5", label: "Restroom sanitization & replenish all paper/soap supplies", completed: false },
  { id: "c6", label: "Empty all biohazard & general trash liners", completed: false },
  { id: "c7", label: "Verify HVAC filters and chemical storage containment", completed: false },
  { id: "c8", label: "Arm security system & secure external access doors", completed: false },
];

export default function Job360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("checklist");
  const [checklist, setChecklist] = useState(STANDARD_CHECKLIST);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
      if (error) throw error;
      setJob(data);
    } catch (err) {
      console.error("Error loading job 360:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleTransition = async (nextStatus: string) => {
    if (!job) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", job.id);

      if (error) throw error;
      setJob((prev: any) => ({ ...prev, status: nextStatus }));
    } catch (err: any) {
      alert("Lifecycle transition failed: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    );
  };

  if (loading) {
    return <LoadingState message="Loading Job 360 Dispatch..." />;
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/dashboard/jobs")}
          className="btn btn-secondary btn-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
        <EmptyState
          title="Job Record Not Found"
          description="The operational assignment could not be retrieved from the database."
          action={
            <Link href="/dashboard/jobs" className="btn btn-primary btn-sm">
              Return to Job Operations
            </Link>
          }
        />
      </div>
    );
  }

  const currentIdx = LIFECYCLE_ORDER.indexOf(job.status);
  const nextStatus = currentIdx >= 0 && currentIdx < LIFECYCLE_ORDER.length - 1 ? LIFECYCLE_ORDER[currentIdx + 1] : null;
  const completedChecklistCount = checklist.filter((c) => c.completed).length;
  const checklistPct = Math.round((completedChecklistCount / checklist.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title || job.service || "Operational Assignment"}
        description={`Job ID: ${job.id.slice(0, 8)} • Client: ${job.client || "Direct Account"}`}
        breadcrumbs={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: job.title || "Job Detail" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {nextStatus && (
              <button
                onClick={() => handleTransition(nextStatus)}
                disabled={updatingStatus}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                Advance to {nextStatus} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      {/* Lifecycle Visual Stepper */}
      <div className="card p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] gap-2">
          {LIFECYCLE_ORDER.map((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={stage} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isCompleted
                        ? "bg-success-600 text-white"
                        : isCurrent
                        ? "bg-primary-600 text-white ring-4 ring-primary-500/20"
                        : "bg-surface-hover text-text-muted border border-border"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${
                      isCurrent
                        ? "text-primary-600"
                        : isCompleted
                        ? "text-text-secondary"
                        : "text-text-muted"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
                {idx < LIFECYCLE_ORDER.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 ${
                      idx < currentIdx ? "bg-success-500" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Lifecycle Stage"
          value={job.status}
          subtitle={`Step ${currentIdx + 1} of ${LIFECYCLE_ORDER.length}`}
          icon={<Briefcase className="w-5 h-5" />}
        />
        <MetricCard
          title="Scheduled Execution"
          value={job.job_date || "Open Schedule"}
          subtitle={`Start time: ${job.start_time || "09:00"}`}
          icon={<Calendar className="w-5 h-5" />}
        />
        <MetricCard
          title="Checklist Execution"
          value={`${checklistPct}%`}
          subtitle={`${completedChecklistCount}/${checklist.length} items verified`}
          icon={<ListChecks className="w-5 h-5" />}
        />
        <MetricCard
          title="Assigned Personnel"
          value={job.assigned || "Unassigned"}
          subtitle="Dispatch crew lead"
          icon={<User className="w-5 h-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "checklist", label: `Field Checklist (${completedChecklistCount}/${checklist.length})` },
          { id: "details", label: "Job & Facility Scope" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === "checklist" && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-title-sm font-bold text-text-primary">
              Required Operating Protocols & Sanitation Checklist
            </h3>
            <span className="text-caption font-semibold text-primary-600">
              {completedChecklistCount} of {checklist.length} Done
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  item.completed
                    ? "bg-success-500/5 border-success-200 dark:border-success-900"
                    : "bg-surface border-border hover:bg-surface-hover"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(item.id)}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span
                  className={`text-body-sm flex-1 ${
                    item.completed ? "line-through text-text-muted" : "text-text-primary font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {item.completed && <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />}
              </label>
            ))}
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Location & Access Instructions
            </h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Service Address</p>
                  <p className="text-text-secondary">{job.location || "On file with client"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Operational Window</p>
                  <p className="text-text-secondary">
                    {job.job_date || "Scheduled date"} at {job.start_time || "09:00"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-text-muted mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Client Facility Link</p>
                  {job.client_id ? (
                    <Link
                      href={`/dashboard/clients/${job.client_id}`}
                      className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 mt-0.5"
                    >
                      {job.client} &rarr; View Client 360
                    </Link>
                  ) : (
                    <p className="text-text-secondary">{job.client || "Direct"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary pb-3 border-b border-border">
              Service Classification & Compliance
            </h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Service Package</span>
                <span className="font-medium text-text-primary">{job.service || "Standard Commercial"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Assigned Cleaner / Crew</span>
                <span className="font-medium text-text-primary">{job.assigned || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-text-secondary">Record Created</span>
                <span className="text-text-muted">
                  {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
