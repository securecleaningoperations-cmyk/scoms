"use client";

import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function CAPAPage() {
  const capas = [
    { id: "CAPA-2026-01", description: "Chemical Spill Prevention Protocol Adjustment", priority: "High", status: "Closed", date: "2026-07-12" },
    { id: "CAPA-2026-02", description: "Sanitization Audit Inspection Standard Update", priority: "Medium", status: "In Progress", date: "2026-07-22" },
    { id: "CAPA-2026-03", description: "Equipment Retraining & Calibration Checklist", priority: "Low", status: "Open", date: "2026-07-28" }
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Corrective & Preventive Action (CAPA)</h1>
          <p className="text-slate-500 text-sm mt-1">Incident root-cause mitigation and quality assurance workflows</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
            <tr>
              <th className="p-4 pl-6">CAPA ID</th>
              <th className="p-4">Description</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Logged Date</th>
              <th className="p-4 pr-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {capas.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 pl-6 font-mono font-bold text-slate-900">{c.id}</td>
                <td className="p-4 font-medium text-slate-800">{c.description}</td>
                <td className="p-4 font-semibold text-slate-700">{c.priority}</td>
                <td className="p-4 text-slate-500">{c.date}</td>
                <td className="p-4 pr-6">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.status === 'Closed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {c.status}
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
