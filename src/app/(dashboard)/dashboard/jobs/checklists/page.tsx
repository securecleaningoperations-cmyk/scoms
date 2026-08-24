"use client";

import { CheckSquare, Plus, FileText } from "lucide-react";

export default function JobChecklistsPage() {
  const checklists = [
    { title: "Standard Commercial Sanitation Checklist", items: 12, category: "Commercial" },
    { title: "Medical Facility Deep Clean Protocol", items: 18, category: "Healthcare" },
    { title: "Post-Construction Safety Sweep", items: 15, category: "Industrial" }
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Checklists & Templates</h1>
          <p className="text-slate-500 text-sm mt-1">Standardized field inspection protocols and cleaning verification templates</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Checklist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {checklists.map((c, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <CheckSquare className="w-6 h-6 text-blue-600 mb-3" />
            <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{c.category} • {c.items} Inspection Points</p>
            <button className="w-full mt-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              View Checklist Items
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
