"use client";

import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function QualityCompliancePage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Quality Compliance & Auditing</h1>
        <p className="text-slate-500 text-sm mt-1">Regulatory compliance tracking, ISO standards, and audit readiness</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
          <p className="text-sm text-slate-500">ISO 9001 Rating</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">100% Compliant</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-slate-500">OSHA Safety Index</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Grade A+</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-sm text-slate-500">Audit Status</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">Passed (Jul 2026)</p>
        </div>
      </div>
    </div>
  );
}
