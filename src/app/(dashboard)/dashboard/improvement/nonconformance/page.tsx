"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function NonConformancePage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Non-Conformance Reports (NCR)</h1>
        <p className="text-slate-500 text-sm mt-1">Quality variance tracking and non-conformance resolution management</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">100% Quality Standards Satisfied — No Unresolved NCR Reports</span>
        </div>
      </div>
    </div>
  );
}
