"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart2, TrendingUp, Target, Plus, Loader2, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ImprovementPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"kpis" | "audits" | "nonconformance">("kpis");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: a }, { data: i }] = await Promise.all([
      supabase.from('audits').select('*').order('created_at', { ascending: false }),
      supabase.from('qa_inspections').select('*').order('created_at', { ascending: false }),
    ]);
    setAudits(a || []);
    setInspections(i || []);
    setLoading(false);
  };

  const avgScore = audits.length
    ? Math.round(audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length)
    : 0;

  const passRate = inspections.length
    ? Math.round((inspections.filter(i => i.status === 'passed').length / inspections.length) * 100)
    : 0;

  const chartData = inspections.slice(0, 10).map((ins, idx) => ({
    name: `#${idx + 1}`,
    score: ins.score || 0,
  })).reverse();

  const kpis = [
    { label: "Avg Audit Score", value: `${avgScore}%`, trend: "+2%", positive: true },
    { label: "QA Pass Rate", value: `${passRate}%`, trend: "+5%", positive: true },
    { label: "Open CAPAs", value: "—", trend: "0", positive: true },
    { label: "Compliance Rate", value: "94%", trend: "+1%", positive: true },
    { label: "Client Satisfaction", value: "4.7★", trend: "+0.2", positive: true },
    { label: "On-Time Completion", value: "91%", trend: "-2%", positive: false },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[38px] font-bold font-display text-ink-navy tracking-tight">Continuous Improvement</h1>
          <p className="text-slate-gray font-medium mt-1">KPIs, QA trends, nonconformance & operational performance</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(["kpis", "audits", "nonconformance"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-signal-blue text-white' : 'text-slate-gray hover:bg-pebble bg-paper border border-hairline'}`}>
            {t === "kpis" ? "KPIs" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-signal-blue" /></div>
      ) : tab === "kpis" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {kpis.map(kpi => (
              <div key={kpi.label} className="cal-card p-6">
                <p className="text-sm text-slate-gray font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold text-ink-navy font-display mt-2">{kpi.value}</p>
                <p className={`text-sm font-semibold mt-2 flex items-center gap-1 ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${!kpi.positive ? 'rotate-180' : ''}`} />
                  {kpi.trend} vs last period
                </p>
              </div>
            ))}
          </div>
          <div className="cal-card p-6">
            <h3 className="font-bold text-ink-navy font-display text-lg mb-6">QA Scores Trend</h3>
            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-gray text-sm">No inspection data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4e0ed" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#476788', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#476788', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #d4e0ed' }} />
                  <Bar dataKey="score" fill="#006bff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      ) : tab === "audits" ? (
        <div className="cal-card p-0 overflow-hidden">
          <div className="p-5 border-b border-hairline bg-paper">
            <h2 className="font-bold text-ink-navy font-display">Audit History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cloud text-xs uppercase tracking-wider text-mist-gray font-semibold border-b border-hairline">
                  <th className="p-4 pl-6">Audit ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Auditor</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {audits.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-slate-gray">No audits found.</td></tr>
                ) : audits.map(a => (
                  <tr key={a.id} className="hover:bg-cloud/50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-slate-gray">{a.audit_id}</td>
                    <td className="p-4 text-sm text-ink-navy">{a.type}</td>
                    <td className="p-4 text-sm text-slate-gray">{a.location}</td>
                    <td className="p-4 text-sm text-ink-navy">{a.auditor}</td>
                    <td className="p-4">
                      <span className={`font-bold text-sm ${(a.score || 0) >= 90 ? 'text-emerald-600' : (a.score || 0) >= 70 ? 'text-amber-600' : 'text-red-600'}`}>{a.score}%</span>
                    </td>
                    <td className="p-4"><span className="cal-badge text-xs">{a.status}</span></td>
                    <td className="p-4 pr-6 text-xs text-mist-gray">{a.audit_date ? new Date(a.audit_date).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="cal-card p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mb-4 opacity-60" />
          <h3 className="font-bold text-ink-navy text-xl mb-2">Nonconformance Tracking</h3>
          <p className="text-slate-gray max-w-md">Track corrective and preventive actions (CAPA). Connect from QA Inspections to log nonconformances and assign remediation tasks.</p>
          <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-lg text-sm">
            {['Open', 'In Progress', 'Resolved'].map((s, i) => (
              <div key={s} className="cal-card p-4 text-center">
                <p className="font-bold text-2xl text-ink-navy font-display">0</p>
                <p className="text-slate-gray mt-1">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
