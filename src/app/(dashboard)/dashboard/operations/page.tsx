'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users, Briefcase, ShieldCheck, AlertTriangle, CheckCircle2,
  Clock, MapPin, Activity, RefreshCw, Loader2, Package,
  Phone, Bell, ChevronRight, Circle, Zap, TrendingDown, TrendingUp
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────
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
  type: 'callout' | 'quality' | 'training' | 'supply' | 'incident';
  priority: 'normal' | 'important' | 'urgent' | 'emergency';
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

// ─── Priority colors ──────────────────────────────────────────
const priorityColors: Record<string, string> = {
  emergency: 'bg-red-600 text-white',
  urgent: 'bg-orange-500 text-white',
  important: 'bg-amber-500 text-white',
  normal: 'bg-blue-100 text-blue-700',
};

const jobStatusColors: Record<string, string> = {
  Created: 'bg-slate-100 text-slate-600',
  Ready: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  in_progress: 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
};

// ─── Metric Card ─────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: number | string;
  sub?: string; color?: string; trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${color ?? 'bg-blue-50'}`}>
        <Icon className="w-5 h-5 text-current" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
        </div>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ title, icon: Icon, count }: { title: string; icon: React.ElementType; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h2>
      </div>
      {count !== undefined && (
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  );
}

// ─── Main Command Center ───────────────────────────────────────
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
      const { data: jobs } = await supabase.from('jobs').select('id,client,service,status,job_date,assigned').order('created_at', { ascending: false }).limit(200);
      const allJobs = jobs ?? [];
      const activeJobs = allJobs.filter(j => ['In Progress', 'in_progress', 'Ready', 'dispatched'].includes(j.status));
      const scheduledJobs = allJobs.filter(j => j.status === 'Created' || j.status === 'scheduled');
      const completedJobs = allJobs.filter(j => j.status === 'Completed' || j.status === 'completed');
      const problemJobs = allJobs.filter(j => j.status === 'problem' || j.status === 'Cancelled');
      const unassignedJobs = allJobs.filter(j => !j.assigned && (j.status === 'Created' || j.status === 'scheduled'));

      // ── Employees / Workforce ──────────────────────────
      const { count: activeEmpCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { count: clockedIn } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('is_clocked_in', true);
      const { count: calloutsToday } = await supabase.from('callouts').select('*', { count: 'exact', head: true })
        .gte('callout_time', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      // ── Quality ────────────────────────────────────────
      const { count: failedQA } = await supabase.from('qa_inspections').select('*', { count: 'exact', head: true }).eq('status', 'failed');
      const { count: openCapa } = await supabase.from('capa_actions').select('*', { count: 'exact', head: true }).in('status', ['open', 'in_progress']);
      const { data: qaScores } = await supabase.from('qa_inspections').select('score').limit(50);
      const avgQA = qaScores && qaScores.length > 0
        ? Math.round(qaScores.reduce((s, q) => s + (q.score ?? 0), 0) / qaScores.length)
        : 0;

      // ── Training ───────────────────────────────────────
      const { count: overdueTraining } = await supabase.from('academy_assignments').select('*', { count: 'exact', head: true })
        .eq('status', 'assigned').lt('due_date', new Date().toISOString().split('T')[0]);
      const { count: inProgressTraining } = await supabase.from('academy_assignments').select('*', { count: 'exact', head: true }).eq('status', 'in_progress');

      // ── Supplies ───────────────────────────────────────
      const { count: urgentSupplies } = await supabase.from('supply_requests').select('*', { count: 'exact', head: true }).eq('priority', 'urgent').eq('status', 'pending');
      const { count: pendingSupplies } = await supabase.from('supply_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');

      // ── Incidents ──────────────────────────────────────
      const { count: openIncidents } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).neq('status', 'closed');
      const { count: criticalIncidents } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('severity', 'critical').neq('status', 'closed');

      // ── Notifications / Alerts ─────────────────────────
      const { data: notifs } = await supabase.from('notifications').select('*').in('status', ['pending', 'sent']).order('created_at', { ascending: false }).limit(10);
      const alertList: Alert[] = (notifs ?? []).map(n => ({
        id: n.id,
        type: (n.reference_type ?? 'supply') as Alert['type'],
        priority: (n.priority ?? 'normal') as Alert['priority'],
        title: n.subject ?? 'Notification',
        detail: n.message ?? '',
        created_at: n.created_at,
        action_url: n.action_url,
      }));

      // ── Callout alerts ─────────────────────────────────
      const { data: openCallouts } = await supabase.from('callouts').select('id,reason_category,created_at').eq('status', 'pending').limit(5);
      (openCallouts ?? []).forEach(c => {
        alertList.push({
          id: `callout-${c.id}`,
          type: 'callout',
          priority: 'urgent',
          title: 'Employee Call-Out',
          detail: `Reason: ${c.reason_category ?? 'unspecified'} — replacement needed`,
          created_at: c.created_at,
          action_url: '/dashboard/scheduling',
        });
      });

      // Sort by priority severity then date
      const priorityOrder = { emergency: 0, urgent: 1, important: 2, normal: 3 };
      alertList.sort((a, b) => (priorityOrder[a.priority] - priorityOrder[b.priority]) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

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
      setRecentJobs(allJobs.slice(0, 8).map(j => ({
        id: j.id, client: j.client ?? 'Unknown', status: j.status ?? 'Created',
        service: j.service ?? '', job_date: j.job_date,
      })));
    } catch (err) {
      console.error('Command center fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAll, 60_000);
    // Realtime subscription on notifications
    const channel = supabase.channel('command-center')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'callouts' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchAll)
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-500 font-medium">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const totalIssues = metrics.quality.failed + metrics.incidents.critical + metrics.jobs.problem + metrics.workforce.callouts;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-16">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Command Center</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Live operational overview — last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalIssues > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {totalIssues} active issues
            </div>
          )}
          <button onClick={fetchAll} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Workforce Status ────────────────────────────── */}
      <div>
        <SectionHeader title="Workforce" icon={Users} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard icon={Activity} label="Working Now" value={metrics.workforce.working} color="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={Clock} label="Available" value={metrics.workforce.available} color="bg-blue-50 text-blue-600" />
          <MetricCard icon={AlertTriangle} label="Call-Outs Today" value={metrics.workforce.callouts} color={metrics.workforce.callouts > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"} />
          <MetricCard icon={Circle} label="Late" value={metrics.workforce.late} color="bg-amber-50 text-amber-600" />
          <MetricCard icon={Circle} label="Missing" value={metrics.workforce.missing} color={metrics.workforce.missing > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"} />
        </div>
      </div>

      {/* ── Jobs Status ─────────────────────────────────── */}
      <div>
        <SectionHeader title="Jobs" icon={Briefcase} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricCard icon={Clock} label="Scheduled" value={metrics.jobs.scheduled} color="bg-slate-50 text-slate-500" />
          <MetricCard icon={Zap} label="Active" value={metrics.jobs.active} color="bg-amber-50 text-amber-600" />
          <MetricCard icon={CheckCircle2} label="Completed" value={metrics.jobs.completed} color="bg-emerald-50 text-emerald-600" />
          <MetricCard icon={AlertTriangle} label="Problems" value={metrics.jobs.problem} color={metrics.jobs.problem > 0 ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400"} />
          <MetricCard icon={Users} label="Unassigned" value={metrics.jobs.unassigned} color={metrics.jobs.unassigned > 0 ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400"} />
        </div>
      </div>

      {/* ── Middle Row: Quality + Training + Supplies + Incidents ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quality */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <SectionHeader title="Quality" icon={ShieldCheck} />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Avg QA Score</span>
              <span className={`font-bold text-lg ${metrics.quality.avg_score >= 80 ? 'text-emerald-600' : metrics.quality.avg_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {metrics.quality.avg_score > 0 ? `${metrics.quality.avg_score}%` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Failed Inspections</span>
              <span className={`font-bold ${metrics.quality.failed > 0 ? 'text-red-600' : 'text-slate-400'}`}>{metrics.quality.failed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Open CAPA</span>
              <span className={`font-bold ${metrics.quality.open_capa > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{metrics.quality.open_capa}</span>
            </div>
          </div>
        </div>

        {/* Training */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <SectionHeader title="Training" icon={Users} />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Overdue</span>
              <span className={`font-bold text-lg ${metrics.training.overdue > 0 ? 'text-red-600' : 'text-slate-400'}`}>{metrics.training.overdue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">In Progress</span>
              <span className="font-bold text-blue-600">{metrics.training.in_progress}</span>
            </div>
            {metrics.training.overdue === 0 && metrics.training.in_progress === 0 && (
              <p className="text-xs text-slate-400 italic mt-2">No training data yet</p>
            )}
          </div>
        </div>

        {/* Supplies */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <SectionHeader title="Supplies" icon={Package} />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Urgent Requests</span>
              <span className={`font-bold text-lg ${metrics.supplies.urgent > 0 ? 'text-red-600' : 'text-slate-400'}`}>{metrics.supplies.urgent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending</span>
              <span className={`font-bold ${metrics.supplies.pending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{metrics.supplies.pending}</span>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <SectionHeader title="Incidents" icon={AlertTriangle} />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Critical</span>
              <span className={`font-bold text-lg ${metrics.incidents.critical > 0 ? 'text-red-600' : 'text-slate-400'}`}>{metrics.incidents.critical}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Open Total</span>
              <span className={`font-bold ${metrics.incidents.open > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{metrics.incidents.open}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Alerts + Recent Jobs ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Live Alerts</h2>
            </div>
            <span className="text-xs text-slate-400">{alerts.length} notifications</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">All clear — no active alerts</p>
              </div>
            ) : alerts.slice(0, 8).map(alert => (
              <div key={alert.id} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${priorityColors[alert.priority]}`}>
                  {alert.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{alert.title}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.detail}</p>
                </div>
                {alert.action_url && (
                  <a href={alert.action_url} className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Recent Jobs</h2>
            </div>
            <a href="/dashboard/jobs" className="text-xs text-blue-600 font-medium hover:underline">View all</a>
          </div>
          <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
            {recentJobs.length === 0 ? (
              <div className="py-10 text-center">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No jobs found</p>
                <a href="/dashboard/jobs" className="text-xs text-blue-600 mt-1 block hover:underline">Create first job →</a>
              </div>
            ) : recentJobs.map(job => (
              <div key={job.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{job.client}</p>
                  <p className="text-xs text-slate-500 truncate">{job.service} {job.job_date ? `· ${new Date(job.job_date).toLocaleDateString()}` : ''}</p>
                </div>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${jobStatusColors[job.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
