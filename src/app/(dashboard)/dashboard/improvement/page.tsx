"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  TrendingUp, Target, Plus, Loader2, AlertCircle, 
  ShieldCheck, Award, Star, Clock, Scale, CheckCircle2,
  AlertTriangle, Filter, Search, X
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface NonconformanceItem {
  id: string;
  code: string;
  facility: string;
  category: string;
  severity: "low" | "medium" | "critical";
  description: string;
  status: "open" | "in_progress" | "resolved";
  assigned_to: string;
  created_at: string;
}

export default function ImprovementPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [nonconformances, setNonconformances] = useState<NonconformanceItem[]>([
    {
      id: "nc-1",
      code: "CAPA-2026-081",
      facility: "Metro Surgical Tower - 4th Floor Sterile Core",
      category: "Airflow Differential & Bio-Seal",
      severity: "critical",
      description: "HEPA air filtration seal pressure drop below 0.05 w.g. threshold during terminal sanitation.",
      status: "in_progress",
      assigned_to: "Marcus Vance (Quality Lead)",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "nc-2",
      code: "CAPA-2026-082",
      facility: "Apex Logistics Tech Campus - Battery Room",
      category: "Chemical Secondary Containment",
      severity: "medium",
      description: "Industrial acid neutralizer spill tray not inspected within 7-day OSHA required frequency.",
      status: "open",
      assigned_to: "Robert Callahan (Site Supervisor)",
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "nc-3",
      code: "CAPA-2026-079",
      facility: "North Texas Freight Terminal",
      category: "Janitorial PPE & SDS Placement",
      severity: "low",
      description: "Safety Data Sheet binder for Quat disinfectant was stored in secondary cabinet rather than wall mount.",
      status: "resolved",
      assigned_to: "Derek Sterling",
      created_at: new Date(Date.now() - 432000000).toISOString(),
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"kpis" | "audits" | "nonconformance">("kpis");
  const [showNCModal, setShowNCModal] = useState(false);
  const [ncForm, setNCForm] = useState({
    facility: "",
    category: "Sanitation Protocol",
    severity: "medium" as "low" | "medium" | "critical",
    description: "",
    assigned_to: "",
  });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: a }, { data: i }] = await Promise.all([
        supabase.from('audits').select('*').order('created_at', { ascending: false }),
        supabase.from('qa_inspections').select('*').order('created_at', { ascending: false }),
      ]);
      setAudits(a && a.length > 0 ? a : [
        { id: "aud-1", audit_id: "AUD-TX-901", type: "ISO-14644 Cleanroom Audit", location: "Dallas BioTech Core", auditor: "Dr. Karen Wells", score: 98, status: "passed", audit_date: "2026-09-15" },
        { id: "aud-2", audit_id: "AUD-TX-902", type: "OSHA Chemical Safety", location: "North Texas Logistics Hub", auditor: "James Morales", score: 94, status: "passed", audit_date: "2026-09-12" },
        { id: "aud-3", audit_id: "AUD-TX-903", type: "Joint Commission Hospital Sanitation", location: "Metro Surgical Tower", auditor: "Elena Rostova", score: 99, status: "passed", audit_date: "2026-09-08" },
        { id: "aud-4", audit_id: "AUD-TX-904", type: "CMMC Level 2 Physical Security", location: "Defense Facility Sector 7", auditor: "Capt. Tyler Hayes", score: 96, status: "passed", audit_date: "2026-09-02" },
      ]);
      setInspections(i && i.length > 0 ? i : [
        { id: "ins-1", score: 98, status: "passed" },
        { id: "ins-2", score: 95, status: "passed" },
        { id: "ins-3", score: 92, status: "passed" },
        { id: "ins-4", score: 99, status: "passed" },
        { id: "ins-5", score: 94, status: "passed" },
        { id: "ins-6", score: 96, status: "passed" },
        { id: "ins-7", score: 97, status: "passed" },
      ]);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const avgScore = audits.length
    ? Math.round(audits.reduce((s, a) => s + (a.score || 0), 0) / audits.length)
    : 96;

  const passRate = inspections.length
    ? Math.round((inspections.filter(i => i.status === 'passed').length / inspections.length) * 100)
    : 98;

  const chartData = [
    { name: "Cleanroom 1", score: 98, benchmark: 90 },
    { name: "Surgical Ctr", score: 99, benchmark: 90 },
    { name: "BioTech Lab", score: 96, benchmark: 90 },
    { name: "Logistics Hub", score: 93, benchmark: 90 },
    { name: "Defense Bld 4", score: 97, benchmark: 90 },
    { name: "Metro Tower", score: 95, benchmark: 90 },
    { name: "Austin Campus", score: 98, benchmark: 90 },
  ];

  const kpis = [
    { label: "Avg Audit Score", value: `${avgScore}%`, trend: "+2.4%", positive: true, icon: ShieldCheck, color: "text-blue-600 bg-blue-50" },
    { label: "QA Pass Rate", value: `${passRate}%`, trend: "+5.1%", positive: true, icon: Award, color: "text-emerald-600 bg-emerald-50" },
    { label: "Active CAPA / Issues", value: `${nonconformances.filter(n => n.status !== 'resolved').length}`, trend: "-1 this week", positive: true, icon: AlertCircle, color: "text-amber-600 bg-amber-50" },
    { label: "Compliance Rate", value: "98.4%", trend: "+1.2%", positive: true, icon: Scale, color: "text-purple-600 bg-purple-50" },
    { label: "Client Satisfaction", value: "4.9 ★", trend: "+0.2", positive: true, icon: Star, color: "text-amber-500 bg-amber-50" },
    { label: "On-Time SLA", value: "97.8%", trend: "+1.8%", positive: true, icon: Clock, color: "text-teal-600 bg-teal-50" },
  ];

  const handleAddNC = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: NonconformanceItem = {
      id: `nc-${Date.now()}`,
      code: `CAPA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      facility: ncForm.facility,
      category: ncForm.category,
      severity: ncForm.severity,
      description: ncForm.description,
      status: "open",
      assigned_to: ncForm.assigned_to || "Field QA Lead",
      created_at: new Date().toISOString(),
    };
    setNonconformances([newItem, ...nonconformances]);
    setShowNCModal(false);
    setNCForm({ facility: "", category: "Sanitation Protocol", severity: "medium", description: "", assigned_to: "" });
  };

  const updateNCStatus = (id: string, newStatus: "open" | "in_progress" | "resolved") => {
    setNonconformances(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Operational Quality & Six Sigma
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Continuous Improvement & QA
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            KPI benchmarks, ISO/OSHA audit logs, root-cause CAPA, and operational performance trends.
          </p>
        </div>

        {tab === "nonconformance" && (
          <button
            onClick={() => setShowNCModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Nonconformance / CAPA
          </button>
        )}
      </div>

      {/* Segmented Tab Control */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 max-w-fit">
        {[
          { id: "kpis", label: "Operational KPIs & Trends" },
          { id: "audits", label: `Audit Log Registry (${audits.length})` },
          { id: "nonconformance", label: `CAPA & Nonconformance (${nonconformances.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm font-medium text-slate-500 mt-2">Loading performance data...</p>
        </div>
      ) : tab === "kpis" ? (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                    <div className={`p-2 rounded-xl ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{kpi.value}</p>
                    <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${!kpi.positive ? 'rotate-180' : ''}`} />
                      {kpi.trend} vs previous cycle
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* QA Score Trends Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Facility QA Inspection Scores</h3>
                <p className="text-xs text-slate-500 mt-0.5">Benchmarked against SCOMS 90% ISO standard compliance requirement</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Actual Score</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Standard (90%)</span>
              </div>
            </div>
            
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[80, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                    formatter={(val: any) => [`${val}%`, 'Score']}
                  />
                  <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : tab === "audits" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Comprehensive Audit Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Independent third-party, corporate, and regulatory site audits</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6">Audit ID</th>
                  <th className="p-4">Standard / Type</th>
                  <th className="p-4">Facility Location</th>
                  <th className="p-4">Certified Auditor</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-900">{a.audit_id}</td>
                    <td className="p-4 text-xs font-semibold text-slate-800">{a.type}</td>
                    <td className="p-4 text-xs text-slate-600">{a.location}</td>
                    <td className="p-4 text-xs text-slate-700">{a.auditor}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center font-bold text-xs px-2 py-0.5 rounded-md ${
                        (a.score || 0) >= 95 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        (a.score || 0) >= 90 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {a.score}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-xs text-slate-500">
                      {a.audit_date ? new Date(a.audit_date).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Nonconformance & CAPA Section */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Open CAPAs", count: nonconformances.filter(n => n.status === 'open').length, color: "border-red-200 bg-red-50/40 text-red-700" },
              { label: "In Remediation", count: nonconformances.filter(n => n.status === 'in_progress').length, color: "border-amber-200 bg-amber-50/40 text-amber-700" },
              { label: "Resolved & Closed", count: nonconformances.filter(n => n.status === 'resolved').length, color: "border-emerald-200 bg-emerald-50/40 text-emerald-700" },
            ].map(s => (
              <div key={s.label} className={`p-4 rounded-2xl border ${s.color} flex items-center justify-between`}>
                <span className="text-xs font-bold">{s.label}</span>
                <span className="text-2xl font-bold">{s.count}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Active Corrective & Preventive Actions (CAPA)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Root-cause investigation, corrective plans, and sign-off SLA</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {nonconformances.map((nc) => (
                <div key={nc.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{nc.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        nc.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        nc.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {nc.severity} severity
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">{nc.category}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm">{nc.facility}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{nc.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>Assigned to: <strong className="text-slate-600">{nc.assigned_to}</strong></span>
                      <span>•</span>
                      <span>Logged: {new Date(nc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    {nc.status === "open" && (
                      <button
                        onClick={() => updateNCStatus(nc.id, "in_progress")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                      >
                        Start Remediation
                      </button>
                    )}
                    {nc.status === "in_progress" && (
                      <button
                        onClick={() => updateNCStatus(nc.id, "resolved")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}
                    {nc.status === "resolved" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Nonconformance Modal */}
      {showNCModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Log Corrective Action (CAPA)</h3>
                <p className="text-xs text-slate-500">Record an operational deficiency or protocol nonconformance.</p>
              </div>
              <button onClick={() => setShowNCModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddNC} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name / Room</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Metro Surgical Tower - Suite 402"
                  value={ncForm.facility}
                  onChange={e => setNCForm({ ...ncForm, facility: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={ncForm.category}
                    onChange={e => setNCForm({ ...ncForm, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option>Sanitation Protocol</option>
                    <option>Chemical Safety / SDS</option>
                    <option>Cleanroom Pressure</option>
                    <option>PPE Compliance</option>
                    <option>Equipment Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={ncForm.severity}
                    onChange={e => setNCForm({ ...ncForm, severity: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Root Cause</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the observed deficiency, affected surfaces, or deviations from SOP..."
                  value={ncForm.description}
                  onChange={e => setNCForm({ ...ncForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned QA Lead / Supervisor</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sarah O'Connor (Operations Lead)"
                  value={ncForm.assigned_to}
                  onChange={e => setNCForm({ ...ncForm, assigned_to: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowNCModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold">
                  Register Nonconformance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
