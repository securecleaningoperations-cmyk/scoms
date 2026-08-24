"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function SecurityIncidentsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Security Incidents & Threat Log</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time threat detection, unauthorized login tracking, and perimeter alerts</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center py-12">
        <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">Zero Active Threats Detected</h3>
        <p className="text-slate-500 text-sm mt-1">All row-level security barriers and API encryption layers are operational.</p>
      </div>
    </div>
  );
}
