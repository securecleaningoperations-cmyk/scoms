"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Plus, Loader2, Download, CheckCircle2 } from "lucide-react";

export default function TaxPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tab, setTab] = useState<"reports" | "classifications">("reports");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: r }, { data: c }] = await Promise.all([
      supabase.from('tax_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('tax_classifications').select('*').order('created_at', { ascending: false }).limit(20),
    ]);
    setReports(r || []);
    setClassifications(c || []);
    setLoading(false);
  };

  const handleGenerateReport = async () => {
    // In a production environment, this would trigger an edge function to aggregate tax data from GL
    setIsGenerating(true);
    alert("In production, this triggers an aggregation of General Ledger data. For now, please ensure GL data is up to date.");
    setIsGenerating(false);
  };

  const typeLabel = (t: string) => ({
    monthly_summary: 'Monthly Summary',
    quarterly_filing: 'Quarterly Filing',
    annual_report: 'Annual Report',
    audit_bundle: 'Audit Bundle',
  }[t] || t);

  const typeBadge = (t: string) => ({
    monthly_summary: 'bg-blue-50 text-blue-700',
    quarterly_filing: 'bg-purple-50 text-purple-700',
    annual_report: 'bg-emerald-50 text-emerald-700',
    audit_bundle: 'bg-amber-50 text-amber-700',
  }[t] || 'bg-pebble text-slate-gray');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Tax Intelligence</h1>
          <p className="text-slate-gray font-medium mt-1">Engine 6.6 — Automated tax classification & filing exports</p>
        </div>
        <div className="flex gap-3">
          <button className="cal-btn-dark flex items-center gap-2 text-sm px-4 py-2.5">
            <Download className="w-4 h-4" /> Audit Mode
          </button>
          <button onClick={handleGenerateReport} disabled={isGenerating} className="cal-btn-primary flex items-center gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total Reports", value: reports.length },
          { label: "Quarterly Filings", value: reports.filter(r => r.report_type === 'quarterly_filing').length },
          { label: "Tax Classifications", value: classifications.length },
          { label: "Audit Bundles", value: reports.filter(r => r.report_type === 'audit_bundle').length },
        ].map(m => (
          <div key={m.label} className="cal-card p-6">
            <FileText className="w-5 h-5 text-signal-blue mb-3" />
            <p className="text-sm text-slate-gray">{m.label}</p>
            <p className="text-3xl font-bold text-ink-navy font-display mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(["reports", "classifications"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-signal-blue text-white' : 'text-slate-gray hover:bg-pebble bg-paper border border-hairline'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="cal-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
        ) : tab === "reports" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                  <th className="p-4 pl-6">Type</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Total Income</th>
                  <th className="p-4">Deductions</th>
                  <th className="p-4">Tax Liability</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {reports.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-slate-gray"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No reports generated yet.</p></td></tr>
                ) : reports.map(r => (
                  <tr key={r.id} className="hover:bg-cloud/50 transition-colors">
                    <td className="p-4 pl-6"><span className={`cal-badge text-xs ${typeBadge(r.report_type)}`}>{typeLabel(r.report_type)}</span></td>
                    <td className="p-4 text-sm text-slate-gray">{r.period_start} → {r.period_end}</td>
                    <td className="p-4 font-semibold text-emerald-600 font-display">${(r.total_income || 0).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-ink-navy">${(r.total_deductions || 0).toLocaleString()}</td>
                    <td className="p-4 font-semibold text-red-600">${(r.tax_liability || 0).toLocaleString()}</td>
                    <td className="p-4"><span className={`cal-badge text-xs ${r.status === 'filed' ? 'bg-emerald-50 text-emerald-700' : 'bg-pebble text-slate-gray'}`}>{r.status}</span></td>
                    <td className="p-4 pr-6">
                      <button className="flex items-center gap-1.5 text-xs text-signal-blue font-semibold hover:underline">
                        <Download className="w-3 h-3" /> Export PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                  <th className="p-4 pl-6">Classification</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Tax Year</th>
                  <th className="p-4">Notes</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {classifications.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-gray"><CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-semibold">No classifications yet. They are auto-generated from ledger entries.</p></td></tr>
                ) : classifications.map(c => (
                  <tr key={c.id} className="hover:bg-cloud/50 transition-colors">
                    <td className="p-4 pl-6"><span className="cal-badge text-xs capitalize">{c.classification?.replace(/_/g, ' ')}</span></td>
                    <td className="p-4 font-semibold text-ink-navy">${(c.amount || 0).toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-gray">{c.tax_year}</td>
                    <td className="p-4 text-sm text-slate-gray">{c.notes || '—'}</td>
                    <td className="p-4 pr-6 text-xs text-mist-gray">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
