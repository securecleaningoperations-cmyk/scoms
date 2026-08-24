"use client";

import { useState } from "react";
import { Shield, FileCheck, CheckCircle2, AlertTriangle, Plus } from "lucide-react";

export default function GovernancePage() {
  const [policies] = useState([
    { name: "Enterprise Anti-Bribery Policy", category: "Legal", status: "Active", reviewed: "2026-06-15", version: "v2.1" },
    { name: "OSHA Chemical Handling Safety Standard", category: "Safety", status: "Active", reviewed: "2026-07-01", version: "v4.0" },
    { name: "Data Protection & HIPAA Compliance", category: "Security", status: "Active", reviewed: "2026-05-20", version: "v1.8" },
    { name: "Vendor Procurement & Ethics Code", category: "Operations", status: "Under Review", reviewed: "2026-07-10", version: "v3.2" },
  ]);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Corporate Governance</h1>
          <p className="text-slate-500 text-sm mt-1">Board policies, regulatory compliance, and statutory standards</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Policy Standard
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4 pl-6">Policy Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Version</th>
              <th className="p-4">Last Reviewed</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {policies.map((p, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-semibold text-slate-900 flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  {p.name}
                </td>
                <td className="p-4 text-slate-600">{p.category}</td>
                <td className="p-4 text-slate-600 font-mono text-xs">{p.version}</td>
                <td className="p-4 text-slate-600">{p.reviewed}</td>
                <td className="p-4 pr-6">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
