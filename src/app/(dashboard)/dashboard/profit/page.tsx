"use client";

import { useState } from "react";
import { 
  DollarSign, TrendingUp, TrendingDown, RefreshCw, 
  Download, PieChart, Building2, ShieldCheck, Printer, ArrowUpRight
} from "lucide-react";

export default function ProfitPage() {
  const [sectorBreakdown] = useState([
    { sector: "Cleanroom & Semiconductor Labs", revenue: 185000, margin: 44.2, laborCost: 78000, supplies: 25000 },
    { sector: "Hospital & Surgical Centers", revenue: 162000, margin: 41.5, laborCost: 72000, supplies: 22500 },
    { sector: "Logistics & Freight Terminals", revenue: 95500, margin: 32.8, laborCost: 48000, supplies: 16200 },
    { sector: "Corporate Commercial Offices", revenue: 40000, margin: 28.5, laborCost: 22500, supplies: 6100 },
  ]);

  const totalRevenue = sectorBreakdown.reduce((sum, s) => sum + s.revenue, 0);
  const totalLabor = sectorBreakdown.reduce((sum, s) => sum + s.laborCost, 0);
  const totalSupplies = sectorBreakdown.reduce((sum, s) => sum + s.supplies, 0);
  const grossProfit = totalRevenue - totalLabor - totalSupplies;
  const overallMargin = Math.round((grossProfit / totalRevenue) * 100);

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Financial Performance & Margins
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Profit & Loss Financial Analysis
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gross margins, direct labor allocation, chemical consumable cost, and vertical profitability.
          </p>
        </div>

        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" /> Export P&L Statement
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Monthly Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% vs last quarter
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Direct Technician Labor</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            ${totalLabor.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {Math.round((totalLabor / totalRevenue) * 100)}% of gross revenue
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chemicals & Consumables</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            ${totalSupplies.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            {Math.round((totalSupplies / totalRevenue) * 100)}% COGS ratio
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Operational Margin</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-3">
            ${grossProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {overallMargin}% overall gross margin
          </p>
        </div>
      </div>

      {/* Sector Profitability Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Industry Vertical Profitability & Margin Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Performance across specialized cleanroom, medical, and commercial contracts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Sector Vertical</th>
                <th className="p-4">Monthly Revenue</th>
                <th className="p-4">Direct Labor</th>
                <th className="p-4">Chemical Supplies</th>
                <th className="p-4">Net Contribution</th>
                <th className="p-4 pr-6 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectorBreakdown.map((s) => {
                const net = s.revenue - s.laborCost - s.supplies;
                return (
                  <tr key={s.sector} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-xs text-slate-900">{s.sector}</td>
                    <td className="p-4 text-xs font-bold text-slate-900">${s.revenue.toLocaleString()}</td>
                    <td className="p-4 text-xs text-slate-600">${s.laborCost.toLocaleString()}</td>
                    <td className="p-4 text-xs text-slate-600">${s.supplies.toLocaleString()}</td>
                    <td className="p-4 text-xs font-bold text-emerald-600">${net.toLocaleString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center font-bold text-xs px-2.5 py-0.5 rounded-full ${
                        s.margin >= 40 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        s.margin >= 30 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {s.margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jev System One Financial Rule Guardrail */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-400/30">
            <span>TypeSafe Jev Financial Guardrails</span>
          </div>
          <h3 className="text-xl font-black text-white">Immutable Double-Entry Ledger & Underbid Prevention</h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            SCOMS v4.0 enforces real-time rule evaluations: Jobs with margins below 22% are blocked from automated dispatch without Dual Supervisory Approval. Invoicing is locked until attendance verification is cryptographically confirmed.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Audit Accuracy</span>
            <span className="text-xl font-black text-emerald-400">100%</span>
          </div>
          <div className="text-center p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Ledger Edits</span>
            <span className="text-xl font-black text-rose-400">0 Allowed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
