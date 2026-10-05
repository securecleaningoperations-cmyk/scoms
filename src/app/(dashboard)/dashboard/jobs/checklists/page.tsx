"use client";

import Link from "next/link";
import { CheckSquare, Plus, ClipboardList, ShieldCheck, AlertTriangle } from "lucide-react";

export default function JobChecklistsPage() {
  const checklists = [
    { title: "Standard Commercial Sanitation Checklist", items: 12, category: "Commercial", frequency: "Daily Shift" },
    { title: "Medical Facility Deep Clean Protocol", items: 18, category: "Healthcare", frequency: "Weekly Strict" },
    { title: "Post-Construction Safety Sweep", items: 15, category: "Industrial", frequency: "Pre-Turnover" },
    { title: "Cleanroom Class 10,000 ISO Disinfection", items: 22, category: "Controlled Env", frequency: "Bi-Daily" },
    { title: "Restroom High-Touch Bactericidal Sweep", items: 14, category: "Restroom Ops", frequency: "Hourly Routine" },
    { title: "Food Service Grade Degreasing Verification", items: 16, category: "Commercial Kitchen", frequency: "Night Shift" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1300px] mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Job Checklists &amp; Templates</h1>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-bold uppercase">
              Field Protocols
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Standardized field inspection protocols, chemical verification, and task completion checklists</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition shrink-0">
          <Plus className="w-4 h-4" /> Create Checklist
        </button>
      </div>

      {/* Operations / Inspection Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto scrollbar-none pb-px">
        <Link
          href="/dashboard/jobs"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <ClipboardList className="w-4 h-4 text-blue-500" />
          <span>All Jobs</span>
        </Link>
        <Link
          href="/dashboard/jobs/checklists"
          className="px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-2 shrink-0"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Active Checklists ({checklists.length})</span>
        </Link>
        <Link
          href="/dashboard/quality"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>QA Inspections</span>
        </Link>
        <Link
          href="/dashboard/quality/capa"
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 flex items-center gap-2 transition shrink-0"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Six Sigma CAPA</span>
        </Link>
      </div>

      {/* Checklists Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {checklists.map((c, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  {c.frequency}
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5">{c.category} &bull; <strong className="text-slate-700">{c.items} Inspection Points</strong></p>
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition shadow-2xs">
              View Checklist Protocols &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
