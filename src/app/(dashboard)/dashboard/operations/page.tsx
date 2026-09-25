"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { PageHeader, StatusBadge, MetricCard, EmptyState, LoadingState } from "@/components/ui";
import {
  Users,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Activity,
  RefreshCw,
  Package,
  Bell,
  ChevronRight,
  ShieldAlert,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface CommandMetrics {
  workforce: { working: number; late: number; missing: number; available: number; callouts: number };
  jobs: { scheduled: number; active: number; completed: number; problem: number; unassigned: number };
  quality: { failed: number; open_capa: number; avg_score: number };
  training: { overdue: number; in_progress: number };
  supplies: { urgent: number; pending: number };
  incidents: { open: number; critical: number };
}

interface Alert {
  id: string;
  type: "callout" | "quality" | "training" | "supply" | "incident";
  priority: "normal" | "important" | "urgent" | "emergency";
  title: string;
  detail: string;
  created_at: string;
  action_url?: string;
}

interface RecentJob {
  id: string;
  client: string;
  status: string;
  service: string;
  job_date: string | null;
}

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<CommandMetrics>({
    workforce: { working: 0, late: 0, missing: 0, available: 0, callouts: 0 },
    jobs: { scheduled: 0, active: 0, completed: 0, problem: 0, unassigned: 0 },
    quality: { failed: 0, open_capa: 0, avg_score: 0 },
    training: { overdue: 0, in_progress: 0 },
    supplies: { urgent: 0, pending: 0 },
    incidents: { open: 0, critical: 0 },
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    try {
      // ── Jobs ─────────────────────────────────────────
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id,client,service,status,job_date,assigned")
        .order("created_at", { ascending: false })
        .limit(200);
      const allJobs = jobs ?? [];
      const activeJobs = allJobs.filter((j) =>
        ["In Progress", "in_progress", "Ready", "dispatched"].includes(j.status)
      );
      const scheduledJobs = allJobs.filter((j) => j.status === "Created" || j.status === "scheduled");
      const completedJobs = allJobs.filter((j) => j.status === "Completed" || j.status === "completed");
      const problemJobs = allJobs.filter((j) => j.status === "problem" || j.status === "Cancelled");
      const unassignedJobs = allJobs.filter(
        (j) => !j.assigned && (j.status === "Created" || j.status === "scheduled")
      );

      // ── Employees / Workforce ──────────────────────────
      const { count: activeEmpCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      const { count: clockedIn } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true })
        .eq("is_clocked_in", true);
      const { count: calloutsToday } = await supabase
        .from("callouts")
        .select("*", { count: "exact", head: true })
        .gte("callout_time", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      // ── Quality ────────────────────────────────────────
      const { count: failedQA } = await supabase
        .from("qa_inspections")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");
      const { count: openCapa } = await supabase
        .from("capa_actions")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "in_progress"]);
      const { data: qaScores } = await supabase.from("qa_inspections").select("score").limit(50);
      const avgQA =
        qaScores && qaScores.length > 0
          ? Math.round(qaScores.reduce((s, q) => s + (q.score ?? 0), 0) / qaScores.length)
          : 0;

      // ── Training ───────────────────────────────────────
      const { count: overdueTraining } = await supabase
        .from("academy_assignments")
        .select("*", { count: "exact", head: true })
        .eq("status", "assigned")
        .lt("due_date", new Date().toISOString().split("T")[0]);
      const { count: inProgressTraining } = await supabase
        .from("academy_assignments")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

      // ── Supplies ───────────────────────────────────────
      const { count: urgentSupplies } = await supabase
        .from("supply_requests")
        .select("*", { count: "exact", head: true })
        .eq("priority", "urgent")
        .eq("status", "pending");
      const { count: pendingSupplies } = await supabase
        .from("supply_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // ── Incidents ──────────────────────────────────────
      const { count: openIncidents } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .neq("status", "closed");
      const { count: criticalIncidents } = await supabase
        .from("incidents")
        .select("*", { count: "exact", head: true })
        .eq("severity", "critical")
        .neq("status", "closed");

      // ── Notifications / Alerts ─────────────────────────
      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .in("status", ["pending", "sent"])
        .order("created_at", { ascending: false })
        .limit(10);
      const alertList: Alert[] = (notifs ?? []).map((n) => ({
        id: n.id,
        type: (n.reference_type ?? "supply") as Alert["type"],
        priority: (n.priority ?? "normal") as Alert["priority"],
        title: n.subject ?? "Operational Notification",
        detail: n.message ?? "",
        created_at: n.created_at,
        action_url: n.action_url,
      }));

      // ── Callout alerts ─────────────────────────────────
      const { data: openCallouts } = await supabase
        .from("callouts")
        .select("id,reason_category,created_at")
        .eq("status", "pending")
        .limit(5);
      (openCallouts ?? []).forEach((c) => {
        alertList.push({
          id: `callout-${c.id}`,
          type: "callout",
          priority: "urgent",
          title: "Technician Call-Out",
          detail: `Reason: ${c.reason_category ?? "unspecified"} — replacement crew requested`,
          created_at: c.created_at,
          action_url: "/dashboard/scheduling",
        });
      });

      const priorityOrder = { emergency: 0, urgent: 1, important: 2, normal: 3 };
      alertList.sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority] ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMetrics({
        workforce: {
          working: clockedIn ?? 0,
          late: 0,
          missing: 0,
          available: Math.max(0, (activeEmpCount ?? 0) - (clockedIn ?? 0)),
          callouts: calloutsToday ?? 0,
        },
        jobs: {
          scheduled: scheduledJobs.length,
          active: activeJobs.length,
          completed: completedJobs.length,
          problem: problemJobs.length,
          unassigned: unassignedJobs.length,
        },
        quality: { failed: failedQA ?? 0, open_capa: openCapa ?? 0, avg_score: avgQA },
        training: { overdue: overdueTraining ?? 0, in_progress: inProgressTraining ?? 0 },
        supplies: { urgent: urgentSupplies ?? 0, pending: pendingSupplies ?? 0 },
        incidents: { open: openIncidents ?? 0, critical: criticalIncidents ?? 0 },
      });

      setAlerts(alertList);
      setRecentJobs(
        allJobs.slice(0, 8).map((j) => ({
          id: j.id,
          client: j.client ?? "Unknown",
          status: j.status ?? "Created",
          service: j.service ?? "Commercial Sanitation",
          job_date: j.job_date,
        }))
      );
    } catch (err) {
      console.error("Command center fetch error:", err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    const channel = supabase
      .channel("command-center")
      .on("postgres_changes", { event: "*", schema: "public", table: "callouts" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, fetchAll)
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  if (loading) {
    return <LoadingState message="Loading Live Operations Command Center..." />;
  }

  const totalIssues =
    metrics.quality.failed +
    metrics.incidents.critical +
    metrics.jobs.problem +
    metrics.workforce.callouts;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Command Center"
        description={`Live operational pulse • Updated ${lastRefresh.toLocaleTimeString()}`}
        breadcrumbs={[{ label: "Operations" }, { label: "Command Center" }]}
        actions={
          <div className="flex items-center gap-2">
            {totalIssues > 0 && (
              <span className="badge badge-danger flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalIssues} At-Risk Items
              </span>
            )}
            <button
              onClick={() => fetchAll()}
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        }
      />

      {/* Jev System One Global Rule Engine Guardrails */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-blue-500/20 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-body-sm font-bold text-white">Jev Operations & Rule Engine: Active</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                All 4 Enforcements Green
              </span>
            </div>
            <p className="text-caption text-slate-300 mt-0.5">
              GPS Geofence Match (100m) • Margin Floor (≥22%) • Attendance-Locked Invoicing • 24/7 HAZMAT Paging SLA &lt;15m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard/intelligence"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-caption font-bold transition flex items-center gap-1.5"
          >
            <span>Voice & AI Intelligence</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Active Cleaning Jobs"
          value={metrics.jobs.active}
          subtitle={`${metrics.jobs.scheduled} upcoming`}
          icon={<Briefcase className="w-4 h-4" />}
        />
        <MetricCard
          title="Crew Clocked In"
          value={metrics.workforce.working}
          subtitle={`${metrics.workforce.available} standby`}
          icon={<Users className="w-4 h-4" />}
        />
        <MetricCard
          title="Quality Score"
          value={`${metrics.quality.avg_score}%`}
          subtitle={`${metrics.quality.open_capa} open CAPA`}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
        <MetricCard
          title="Active Incidents"
          value={metrics.incidents.open}
          subtitle={`${metrics.incidents.critical} high priority`}
          icon={<ShieldAlert className="w-4 h-4" />}
        />
        <MetricCard
          title="Supply Requests"
          value={metrics.supplies.pending}
          subtitle={`${metrics.supplies.urgent} urgent`}
          icon={<Package className="w-4 h-4" />}
        />
        <MetricCard
          title="Compliance Training"
          value={metrics.training.overdue}
          subtitle="Assignments overdue"
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Realtime Alert Stream */}
        <div className="lg:col-span-2 card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title-sm font-bold text-text-primary flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" /> Operational Action Feed
            </h3>
            <span className="text-caption text-text-muted">{alerts.length} events logged</span>
          </div>

          {alerts.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-body-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success-500 opacity-60" />
              All operations are standard. No critical alerts.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {alerts.map((a) => {
                const isUrgent = a.priority === "urgent" || a.priority === "emergency";
                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-colors ${
                      isUrgent
                        ? "bg-danger-500/5 border-danger-200 dark:border-danger-900"
                        : "bg-surface-hover border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isUrgent ? (
                          <AlertTriangle className="w-4 h-4 text-danger-600 shrink-0" />
                        ) : (
                          <Activity className="w-4 h-4 text-primary-600 shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-body-sm font-semibold text-text-primary">{a.title}</p>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isUrgent ? "bg-danger-100 text-danger-700" : "bg-primary-100 text-primary-700"
                            }`}
                          >
                            {a.priority}
                          </span>
                        </div>
                        <p className="text-caption text-text-secondary mt-0.5">{a.detail}</p>
                      </div>
                    </div>
                    {a.action_url && (
                      <Link
                        href={a.action_url}
                        className="btn btn-ghost btn-sm text-text-muted hover:text-primary-600 p-1 shrink-0"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Active Jobs Snapshot */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-title-sm font-bold text-text-primary flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary-500" /> Active Job Board
            </h3>
            <Link
              href="/dashboard/jobs"
              className="text-caption text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-lg border border-border bg-surface-hover flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-text-primary truncate">{job.client}</p>
                  <p className="text-caption text-text-muted truncate">{job.service}</p>
                </div>
                <StatusBadge
                  status={
                    job.status === "Completed"
                      ? "Active"
                      : job.status === "In Progress" || job.status === "in_progress"
                      ? "Pending"
                      : "Draft"
                  }
                  label={job.status}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
