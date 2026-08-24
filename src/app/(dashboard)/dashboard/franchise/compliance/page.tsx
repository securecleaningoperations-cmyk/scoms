"use client";

import { Building2, ShieldCheck } from "lucide-react";

export default function FranchiseCompliancePage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Franchise Compliance & Standards</h1>
        <p className="text-slate-500 text-sm mt-1">Multi-location franchisee audits, brand standards, and royalty compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Building2 className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-bold text-slate-900">Northwest Regional Franchise</h3>
          <p className="text-xs text-slate-500 mt-0.5">Audited: Jul 2026 • Rating: 99.1%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Building2 className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-slate-900">Southeast Metro Franchise</h3>
          <p className="text-xs text-slate-500 mt-0.5">Audited: Jun 2026 • Rating: 98.4%</p>
        </div>
      </div>
    </div>
  );
}
