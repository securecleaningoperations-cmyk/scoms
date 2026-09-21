"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth, usePermissions } from "@/lib/auth/AuthProvider";
import { PageHeader, MetricCard, StatusBadge, EmptyState, LoadingState, ErrorState } from "@/components/ui";
import {
  ClipboardList, Users, DollarSign, ShieldCheck, AlertTriangle,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, Target, FileText, ArrowRight, Activity,
  ChevronRight, Briefcase, Calendar
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────

interface DashboardMetrics {
  // Operations
  activeJobs: number;
  jobsToday: number;
  completionRate: number;
  openIssues: number;
  inspectionPassRate: number;
  // Workforce
  activeEmployees: number;
  openReqs: number;
  pendingTrainings: number;
  // Finance
  revenue: number;
  expenses: number;
  netProfit: number;
  overdueInvoices: number;
  // Clients
  activeClients: number;
  newLeads: number;
  // Compliance
  openCapa: number;
  healthScore: number;
}

interface AttentionItem {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  detail: string;
  href: string;
  module: string;
}

// ── Component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { canViewFinance, canViewHR, role } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeJobs: 0, jobsToday: 0, completionRate: 0, openIssues: 0, inspectionPassRate: 0,
    activeEmployees: 0, openReqs: 0, pendingTrainings: 0,
    revenue: 0, expenses: 0, netProfit: 0, overdueInvoices: 0,
    activeClients: 0, newLeads: 0,
    openCapa: 0, healthScore: 0,
  });
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Parallel queries for all metrics
        const [
          { count: empCount },
          { count: capaCount },
          { count: reqsCount },
          { count: trainCount },
          { count: jobsActiveCount },
          { count: clientsCount },
          { count: leadsCount },
          { data: ledgerData },
          { data: qaData },
          { count: issuesCount },
        ] = await Promise.all([
          supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("capa_actions").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
          supabase.from("applicants").select("*", { count: "exact", head: true }).in("status", ["new", "interviewing", "screening"]),
          supabase.from("trainings").select("*", { count: "exact", head: true }).in("status", ["in_progress", "In Progress"]),
          supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
          supabase.from("clients").select("*", { count: "exact", head: true }),
          supabase.from("leads").select("*", { count: "exact", head: true }).in("status", ["new", "qualified", "contacted"]),
          supabase.from("ledger").select("type, amount"),
          supabase.from("qa_inspections").select("score"),
          supabase.from("incidents").select("*", { count: "exact", head: true }).in("status", ["open", "investigating"]),
        ]);

        // Calculate financial metrics
        let revenue = 0, expenses = 0;
        if (ledgerData) {
          revenue = ledgerData.filter(l => l.type === "Revenue").reduce((sum, i) => sum + Number(i.amount || 0), 0);
          expenses = ledgerData.filter(l => l.type === "Expense").reduce((sum, i) => sum + Number(i.amount || 0), 0);
        }

        // Calculate quality health score
        let healthScore = 0;
        if (qaData && qaData.length > 0) {
          healthScore = Math.round(qaData.reduce((sum, i) => sum + (i.score || 0), 0) / qaData.length);
        }

        const m: DashboardMetrics = {
          activeJobs: jobsActiveCount || 0,
          jobsToday: 0, // Would need date filter
          completionRate: 0,
          openIssues: issuesCount || 0,
          inspectionPassRate: healthScore,
          activeEmployees: empCount || 0,
          openReqs: reqsCount || 0,
          pendingTrainings: trainCount || 0,
          revenue,
          expenses,
          netProfit: revenue - expenses,
          overdueInvoices: 0,
          activeClients: clientsCount || 0,
          newLeads: leadsCount || 0,
          openCapa: capaCount || 0,
          healthScore,
        };

        setMetrics(m);

        // Build attention items from real data
        const items: AttentionItem[] = [];
        if (m.openCapa > 0) {
          items.push({
            id: "capa", type: "warning", module: "Quality",
            title: `${m.openCapa} Open CAPA Actions`,
            detail: "Corrective/preventive actions require attention",
            href: "/dashboard/quality/capa",
          });
        }
        if (m.openIssues > 0) {
          items.push({
            id: "issues", type: "danger", module: "Operations",
            title: `${m.openIssues} Unresolved Incidents`,
            detail: "Open incidents need investigation",
            href: "/dashboard/incidents",
          });
        }
        if (m.pendingTrainings > 0) {
          items.push({
            id: "training", type: "info", module: "Workforce",
            title: `${m.pendingTrainings} Trainings In Progress`,
            detail: "Employees have incomplete training modules",
            href: "/dashboard/hr/training",
          });
        }
        if (m.openReqs > 0) {
          items.push({
            id: "recruiting", type: "info", module: "HR",
            title: `${m.openReqs} Open Requisitions`,
            detail: "Applicants in recruiting pipeline",
            href: "/dashboard/hr/recruiting",
          });
        }
        setAttentionItems(items);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard metrics. Some tables may not exist yet.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  // Determine dashboard title based on role
  let dashTitle = "Executive Dashboard";
  let dashDesc = "Enterprise operations overview — what's happening, what needs attention, and what's at risk.";
  if (role === "hr_manager") {
    dashTitle = "Workforce Dashboard";
    dashDesc = "Workforce management, recruiting pipeline, training compliance, and personnel status.";
  } else if (["operations_manager", "supervisor", "scheduler"].includes(role)) {
    dashTitle = "Operations Dashboard";
    dashDesc = "Field execution, job statuses, quality metrics, and operational alerts.";
  } else if (["finance_admin", "payroll_admin"].includes(role)) {
    dashTitle = "Finance Dashboard";
    dashDesc = "Revenue, expenses, outstanding receivables, and financial health.";
  }

  if (loading) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <LoadingState variant="skeleton" rows={8} message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-12">
      <PageHeader title={dashTitle} description={dashDesc} />

      {/* ── Needs Attention ──────────────────────────────────────────── */}
      {attentionItems.length > 0 && (
        <section>
          <h2 className="text-label font-medium text-text-muted uppercase tracking-wide mb-2">
            Needs Attention
          </h2>
          <div className="space-y-2">
            {attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-border-strong hover:bg-surface-hover transition-colors bg-surface group"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                  item.type === "danger" ? "bg-danger-50 text-danger-500"
                  : item.type === "warning" ? "bg-warning-50 text-warning-600"
                  : "bg-info-50 text-info-500"
                }`}>
                  {item.type === "danger" ? <AlertTriangle className="w-4 h-4" />
                   : item.type === "warning" ? <AlertCircle className="w-4 h-4" />
                   : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-text-primary">{item.title}</p>
                  <p className="text-caption text-text-muted">{item.detail}</p>
                </div>
                <StatusBadge status={item.module} size="sm" />
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Operational Summary ───────────────────────────────────────── */}
      <section>
        <h2 className="text-label font-medium text-text-muted uppercase tracking-wide mb-3">
          Operational Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Active Jobs"
            value={metrics.activeJobs}
            icon={<ClipboardList className="w-4 h-4" />}
          />
          <MetricCard
            label="Quality Score"
            value={metrics.healthScore ? `${metrics.healthScore}%` : "—"}
            icon={<ShieldCheck className="w-4 h-4" />}
            subtext={metrics.healthScore >= 90 ? "Good" : metrics.healthScore > 0 ? "Needs improvement" : "No data"}
          />
          <MetricCard
            label="Open Issues"
            value={metrics.openIssues}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
          <MetricCard
            label="Open CAPA"
            value={metrics.openCapa}
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* ── Workforce ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-label font-medium text-text-muted uppercase tracking-wide mb-3">
          Workforce
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Active Employees"
            value={metrics.activeEmployees}
            icon={<Users className="w-4 h-4" />}
          />
          <MetricCard
            label="Open Requisitions"
            value={metrics.openReqs}
            icon={<Briefcase className="w-4 h-4" />}
          />
          <MetricCard
            label="In-Progress Training"
            value={metrics.pendingTrainings}
            icon={<Activity className="w-4 h-4" />}
          />
          <MetricCard
            label="Clients"
            value={metrics.activeClients}
            icon={<Building2 className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* ── Financial Summary (role-gated) ────────────────────────────── */}
      {canViewFinance && (
        <section>
          <h2 className="text-label font-medium text-text-muted uppercase tracking-wide mb-3">
            Financial Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Revenue"
              value={formatCurrency(metrics.revenue)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              label="Expenses"
              value={formatCurrency(metrics.expenses)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              label="Net Profit"
              value={formatCurrency(metrics.netProfit)}
              icon={<TrendingUp className="w-4 h-4" />}
              change={metrics.netProfit >= 0 ? { value: "Positive", positive: true } : { value: "Loss", positive: false }}
            />
            <MetricCard
              label="New Leads"
              value={metrics.newLeads}
              icon={<Target className="w-4 h-4" />}
            />
          </div>
        </section>
      )}

      {/* ── Quick Navigation ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-label font-medium text-text-muted uppercase tracking-wide mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            { label: "Employees", href: "/dashboard/hr", icon: Users },
            { label: "Jobs", href: "/dashboard/jobs", icon: ClipboardList },
            { label: "Clients", href: "/dashboard/clients", icon: Building2 },
            { label: "Schedule", href: "/dashboard/scheduling", icon: Calendar },
            { label: "Invoices", href: "/dashboard/gl/invoices", icon: FileText },
            { label: "Quality", href: "/dashboard/quality", icon: ShieldCheck },
            { label: "Documents", href: "/dashboard/documents", icon: FileText },
            { label: "Settings", href: "/dashboard/settings", icon: Briefcase },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:border-primary-200 hover:bg-primary-50 transition-colors bg-surface group"
            >
              <item.icon className="w-4 h-4 text-text-muted group-hover:text-primary-600 transition-colors" />
              <span className="text-body-sm font-medium text-text-secondary group-hover:text-primary-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Error Notice ─────────────────────────────────────────────── */}
      {error && (
        <div className="p-3 rounded-md bg-warning-50 border border-warning-100 text-body-sm text-warning-700">
          <strong>Note:</strong> {error}
        </div>
      )}
    </div>
  );
}