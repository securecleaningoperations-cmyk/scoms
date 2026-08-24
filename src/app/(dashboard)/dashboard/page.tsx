"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Activity, DollarSign, Users, AlertCircle, RefreshCw, Loader2, FileText, ClipboardCheck, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateReport as generateCFOReport } from "@/lib/queries/cfo";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('super_admin');
  const [metrics, setMetrics] = useState({
    netProfit: 0,
    healthScore: 0,
    activeAlerts: 0,
    activeEmployees: 0,
    openReqs: 0,
    pendingTrainings: 0,
    activeJobs: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let role = 'super_admin';
        if (user) {
          role = user.user_metadata?.role;
          if (!role) {
            const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
            role = data?.role || 'super_admin';
          }
          setUserRole(role);
        }

        // Fetch metrics
        const { count: empCount } = await supabase.from("employees").select("*", { count: "exact", head: true }).eq("status", "active");
        const { count: alertsCount } = await supabase.from("capa_actions").select("*", { count: "exact", head: true }).in("status", ["open", "in_progress"]);
        const { count: reqsCount } = await supabase.from("applicants").select("*", { count: "exact", head: true }).in("status", ["new", "interviewing", "screening"]);
        const { count: trainCount } = await supabase.from("trainings").select("*", { count: "exact", head: true }).in("status", ["in_progress", "In Progress"]);
        // Assume jobs table exists, if it errors, we handle gracefully
        const { count: jobsCount } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "in_progress");
        
        let profit = 0;
        const { data: ledgerData } = await supabase.from("ledger").select("type, amount");
        if (ledgerData) {
          const revenue = ledgerData.filter(l => l.type === 'Revenue').reduce((sum, item) => sum + Number(item.amount), 0);
          const expense = ledgerData.filter(l => l.type === 'Expense').reduce((sum, item) => sum + Number(item.amount), 0);
          profit = revenue - expense;
        }

        let health = 100;
        const { data: qaData } = await supabase.from("qa_inspections").select("score");
        if (qaData && qaData.length > 0) {
          const totalScore = qaData.reduce((sum, item) => sum + (item.score || 0), 0);
          health = Math.round(totalScore / qaData.length);
        }

        setMetrics({
          netProfit: profit,
          healthScore: health,
          activeAlerts: alertsCount || 0,
          activeEmployees: empCount || 0,
          openReqs: reqsCount || 0,
          pendingTrainings: trainCount || 0,
          activeJobs: jobsCount || 0
        });
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      }
    };
    
    fetchMetrics();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const url = await generateCFOReport(metrics);
      alert(`Executive Report generated successfully!\nView at: ${url}`);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const renderHrDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="cal-card p-6">
        <Users className="w-5 h-5 text-signal-blue mb-3" />
        <p className="text-sm text-slate-gray">Active Workforce</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.activeEmployees}</p>
      </div>
      <div className="cal-card p-6">
        <Briefcase className="w-5 h-5 text-purple-500 mb-3" />
        <p className="text-sm text-slate-gray">Open Requisitions</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.openReqs}</p>
      </div>
      <div className="cal-card p-6">
        <FileText className="w-5 h-5 text-amber-500 mb-3" />
        <p className="text-sm text-slate-gray">Pending Trainings</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.pendingTrainings}</p>
      </div>
    </div>
  );

  const renderOpsDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="cal-card p-6">
        <ClipboardCheck className="w-5 h-5 text-signal-blue mb-3" />
        <p className="text-sm text-slate-gray">Active Jobs</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.activeJobs}</p>
      </div>
      <div className="cal-card p-6">
        <Activity className="w-5 h-5 text-emerald-500 mb-3" />
        <p className="text-sm text-slate-gray">Average QA Health</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.healthScore}%</p>
      </div>
      <div className="cal-card p-6">
        <AlertCircle className="w-5 h-5 text-red-500 mb-3" />
        <p className="text-sm text-slate-gray">Open Action Items</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.activeAlerts}</p>
      </div>
    </div>
  );

  const renderExecutiveDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div className="cal-card p-6">
        <DollarSign className="w-5 h-5 text-signal-blue mb-3" />
        <p className="text-sm text-slate-gray">Net Profit</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">${metrics.netProfit.toLocaleString()}</p>
      </div>
      <div className="cal-card p-6">
        <Activity className="w-5 h-5 text-emerald-500 mb-3" />
        <p className="text-sm text-slate-gray">Health Score</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.healthScore}%</p>
      </div>
      <div className="cal-card p-6">
        <AlertCircle className="w-5 h-5 text-red-500 mb-3" />
        <p className="text-sm text-slate-gray">Active Alerts</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.activeAlerts}</p>
      </div>
      <div className="cal-card p-6">
        <Users className="w-5 h-5 text-purple-500 mb-3" />
        <p className="text-sm text-slate-gray">Active Employees</p>
        <p className="text-3xl font-bold text-ink-navy font-display mt-1">{metrics.activeEmployees}</p>
      </div>
    </div>
  );

  let title = "Executive Dashboard";
  let description = "Real-time overview of enterprise operations";
  let content = renderExecutiveDashboard();

  if (userRole === 'hr_manager') {
    title = "Workforce Dashboard";
    description = "Monitor recruiting pipeline, compliance, and active personnel.";
    content = renderHrDashboard();
  } else if (['operations_manager', 'supervisor', 'scheduler', 'compliance_officer'].includes(userRole)) {
    title = "Operations Dashboard";
    description = "Monitor field execution, job statuses, and quality alerts.";
    content = renderOpsDashboard();
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">{title}</h1>
          <p className="text-slate-gray font-medium mt-1">{description}</p>
        </div>
        {(userRole === 'super_admin' || userRole === 'corporate_admin' || userRole === 'executive' || userRole === 'finance_admin') && (
          <button onClick={handleGenerateReport} disabled={loading} className="cal-btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Generate Report
          </button>
        )}
      </div>

      {content}
    </div>
  );
}