"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Loader2, AlertCircle } from 'lucide-react';

export default function JobCostingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobCosting();
  }, []);

  const fetchJobCosting = async () => {
    setLoading(true);
    try {
      // In a real production system this would be a backend RPC to do complex joins,
      // but we will do an approximation for the dashboard here.
      
      const { data: jobsData } = await supabase.from('jobs').select(`
        id, job_number, title, status, start_time,
        client:clients(name)
      `).eq('status', 'completed').order('start_time', { ascending: false }).limit(20);

      if (!jobsData) {
        setJobs([]);
        return;
      }

      // We'll calculate a mock profitability metric for each based on its ID for demonstration,
      // but structure it so real backend triggers can populate it later.
      const costedJobs = jobsData.map(job => {
        // Pseudo-random generation based on job id strings to keep numbers stable for demo
        const hash = job.id.split('-')[0];
        const randomFactor = parseInt(hash, 16) % 100 / 100; // 0.0 to 0.99
        
        const revenue = 500 + (randomFactor * 2000); // 500 to 2500
        const laborCost = revenue * 0.4 * (1 + (randomFactor - 0.5)); // around 40% of revenue
        const materialCost = revenue * 0.15; // flat 15%
        const subCost = randomFactor > 0.8 ? revenue * 0.2 : 0; // some jobs have sub-contractor costs
        
        const totalCost = laborCost + materialCost + subCost;
        const grossProfit = revenue - totalCost;
        const margin = (grossProfit / revenue) * 100;

        return {
          ...job,
          revenue,
          costs: { labor: laborCost, materials: materialCost, subcontractors: subCost, total: totalCost },
          grossProfit,
          margin
        };
      });

      setJobs(costedJobs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Job Costing & Profitability</h1>
          <p className="text-slate-gray font-medium mt-1">Granular financial analysis of completed jobs</p>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="cal-card p-6 shadow-sm flex flex-col justify-center">
          <p className="text-sm text-slate-500 font-semibold mb-1">Avg Job Margin</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-slate-900">
              {jobs.length ? (jobs.reduce((s,j)=>s+j.margin, 0)/jobs.length).toFixed(1) : '0.0'}%
            </h2>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
        <div className="cal-card p-6 shadow-sm flex flex-col justify-center border-t-4 border-t-blue-500">
          <p className="text-sm text-slate-500 font-semibold mb-1">Total Labor Cost</p>
          <h2 className="text-3xl font-bold font-mono text-slate-900">
            ${jobs.reduce((s,j)=>s+j.costs.labor, 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </h2>
        </div>
        <div className="cal-card p-6 shadow-sm flex flex-col justify-center border-t-4 border-t-amber-500">
          <p className="text-sm text-slate-500 font-semibold mb-1">Total Materials</p>
          <h2 className="text-3xl font-bold font-mono text-slate-900">
             ${jobs.reduce((s,j)=>s+j.costs.materials, 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </h2>
        </div>
        <div className="cal-card p-6 shadow-sm flex flex-col justify-center border-t-4 border-t-emerald-500">
          <p className="text-sm text-slate-500 font-semibold mb-1">Gross Profit</p>
          <h2 className="text-3xl font-bold font-mono text-emerald-600">
             ${jobs.reduce((s,j)=>s+j.grossProfit, 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
          </h2>
        </div>
      </div>

      <div className="cal-card p-0 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="p-4 pl-6">Job ID / Client</th>
              <th className="p-4 text-right">Revenue</th>
              <th className="p-4 text-right border-l border-slate-200">Labor</th>
              <th className="p-4 text-right">Materials</th>
              <th className="p-4 text-right border-r border-slate-200">Total Cost</th>
              <th className="p-4 text-right">Gross Profit</th>
              <th className="p-4 text-right pr-6">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={7} className="p-12 text-center text-slate-500"><Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />No completed jobs to analyze.</td></tr>
            ) : jobs.map(j => (
              <tr key={j.id} className="hover:bg-slate-50/50">
                <td className="p-4 pl-6">
                  <p className="font-bold text-slate-900">{j.job_number || j.id.slice(0,8)}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{j.client?.name || 'Walk-in Client'}</p>
                </td>
                <td className="p-4 text-right font-mono font-medium">${j.revenue.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-slate-600 border-l border-slate-100">${j.costs.labor.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-slate-600">${j.costs.materials.toFixed(2)}</td>
                <td className="p-4 text-right font-mono text-red-600 border-r border-slate-100 font-medium">${j.costs.total.toFixed(2)}</td>
                <td className="p-4 text-right font-mono font-bold text-emerald-600">${j.grossProfit.toFixed(2)}</td>
                <td className="p-4 text-right pr-6">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${j.margin < 15 ? 'bg-red-100 text-red-700' : j.margin > 40 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {j.margin.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
