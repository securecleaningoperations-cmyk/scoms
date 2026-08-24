"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { fetchCFOMetrics, generateReport } from "@/lib/queries/cfo";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";

export default function ProfitPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const metrics = await fetchCFOMetrics();
      setData(metrics);
      setLoading(false);
    }
    load();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const url = await generateReport(data);
      alert(`Report generated successfully! View at: ${url}`);
    } catch (e: any) {
      alert(`Error generating report: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Profit & Loss</h1>
          <p className="text-slate-gray font-medium mt-1">Financial performance and margins</p>
        </div>
        <button onClick={handleGenerateReport} disabled={loading || !data} className="cal-btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="cal-card p-6">
          <TrendingUp className="w-5 h-5 text-emerald-500 mb-3" />
          <p className="text-sm text-slate-gray">Total Revenue</p>
          <p className="text-3xl font-bold text-ink-navy font-display mt-1">
            ${((data?.netProfit || 0) + (data?.payrollLiability || 0)).toLocaleString()}
          </p>
        </div>
        <div className="cal-card p-6">
          <TrendingDown className="w-5 h-5 text-red-500 mb-3" />
          <p className="text-sm text-slate-gray">Total Expenses</p>
          <p className="text-3xl font-bold text-ink-navy font-display mt-1">
            ${(data?.payrollLiability || 0).toLocaleString()}
          </p>
        </div>
        <div className="cal-card p-6">
          <DollarSign className="w-5 h-5 text-signal-blue mb-3" />
          <p className="text-sm text-slate-gray">Net Profit</p>
          <p className="text-3xl font-bold text-ink-navy font-display mt-1">
            ${(data?.netProfit || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
