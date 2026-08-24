"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, TrendingUp, DollarSign, Award, ArrowUpRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ExecutivePage() {
  const [metrics, setMetrics] = useState({ revenue: 0, activeJobs: 0, totalEmployees: 0, complianceRate: 98.4 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ count: empCount }, { count: jobCount }] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
      ]);
      setMetrics({
        revenue: 148500,
        activeJobs: jobCount || 0,
        totalEmployees: empCount || 0,
        complianceRate: 98.4
      });
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Executive Strategic Command</h1>
          <p className="text-slate-500 text-sm mt-1">High-level enterprise decision metrics & corporate oversight</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Executive Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <DollarSign className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-slate-500">Gross Contract Value</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : `$${metrics.revenue.toLocaleString()}`}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm text-slate-500">Operational Jobs</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : metrics.activeJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Award className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm text-slate-500">Total Workforce</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loading ? '...' : metrics.totalEmployees}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-indigo-600 mb-2" />
          <p className="text-sm text-slate-500">Compliance Rating</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{metrics.complianceRate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Executive Directives & Corporate Governance</h2>
        <div className="divide-y divide-slate-100">
          {[
            { title: "Q3 Operational Audit & Quality Safeguards", status: "Completed", date: "Today", owner: "Chief Quality Officer" },
            { title: "Enterprise Insurance Policy Renewal", status: "In Progress", date: "Jul 31, 2026", owner: "Risk Manager" },
            { title: "Regional Franchise Expansion Assessment", status: "Approved", date: "Aug 15, 2026", owner: "VP Operations" }
          ].map((item, idx) => (
            <div key={idx} className="py-4 flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-400">Assigned: {item.owner} • Due: {item.date}</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
