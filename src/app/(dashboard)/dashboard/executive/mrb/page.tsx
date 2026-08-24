"use client";

import { Users, Calendar, CheckCircle2, FileText } from "lucide-react";

export default function MRBPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Management Review Board (MRB)</h1>
          <p className="text-slate-500 text-sm mt-1">Executive quarterly reviews, risk evaluations, and board resolutions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm text-slate-500">Next Board Meeting</p>
          <p className="text-xl font-bold text-slate-900 mt-1">August 12, 2026</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm text-slate-500">Passed Resolutions</p>
          <p className="text-xl font-bold text-slate-900 mt-1">24 Resolutions</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-sm text-slate-500">Board Members</p>
          <p className="text-xl font-bold text-slate-900 mt-1">7 Executive Members</p>
        </div>
      </div>
    </div>
  );
}
