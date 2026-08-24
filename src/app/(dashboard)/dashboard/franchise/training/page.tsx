"use client";

import { Award, BookOpen } from "lucide-react";

export default function FranchiseTrainingPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Franchise Onboarding & Training</h1>
        <p className="text-slate-500 text-sm mt-1">Franchisee owner certification programs and operational training modules</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center py-12">
        <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">Franchise Owner Academy</h3>
        <p className="text-slate-500 text-sm mt-1">All registered franchise owners have completed 100% of required certification modules.</p>
      </div>
    </div>
  );
}
