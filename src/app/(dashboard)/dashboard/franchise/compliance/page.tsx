"use client";

import { useState } from "react";
import { 
  Building2, ShieldCheck, CheckCircle2, AlertTriangle, 
  FileText, Award, Download, Filter, ChevronRight, Check
} from "lucide-react";

interface FranchiseAudit {
  id: string;
  code: string;
  franchiseName: string;
  location: string;
  owner: string;
  auditScore: number;
  royaltyStatus: "current" | "overdue" | "pending";
  oshaCompliance: boolean;
  brandingCompliance: boolean;
  chemicalHazmatCertified: boolean;
  lastAuditDate: string;
}

export default function FranchiseCompliancePage() {
  const [franchises, setFranchises] = useState<FranchiseAudit[]>([
    {
      id: "f-1",
      code: "FRN-7701",
      franchiseName: "Secure Cleaning — Dallas Metro Hub",
      location: "Dallas, TX",
      owner: "Robert Callahan",
      auditScore: 99.1,
      royaltyStatus: "current",
      oshaCompliance: true,
      brandingCompliance: true,
      chemicalHazmatCertified: true,
      lastAuditDate: "2026-09-14",
    },
    {
      id: "f-2",
      code: "FRN-5082",
      franchiseName: "Secure Cleaning — Phoenix Central",
      location: "Phoenix, AZ",
      owner: "Vanessa Morales",
      auditScore: 98.2,
      royaltyStatus: "current",
      oshaCompliance: true,
      brandingCompliance: true,
      chemicalHazmatCertified: true,
      lastAuditDate: "2026-09-10",
    },
    {
      id: "f-3",
      code: "FRN-8557",
      franchiseName: "Secure Cleaning — Atlanta Commercial Hub",
      location: "Atlanta, GA",
      owner: "Marcus Vance Jr.",
      auditScore: 97.9,
      royaltyStatus: "current",
      oshaCompliance: true,
      brandingCompliance: true,
      chemicalHazmatCertified: true,
      lastAuditDate: "2026-08-28",
    },
    {
      id: "f-4",
      code: "FRN-3120",
      franchiseName: "Secure Cleaning — Austin Tech Corridor",
      location: "Austin, TX",
      owner: "Derek Sterling",
      auditScore: 98.7,
      royaltyStatus: "current",
      oshaCompliance: true,
      brandingCompliance: true,
      chemicalHazmatCertified: true,
      lastAuditDate: "2026-09-02",
    },
    {
      id: "f-5",
      code: "FRN-4491",
      franchiseName: "Secure Cleaning — Chicago Loop Facility Ops",
      location: "Chicago, IL",
      owner: "Sarah O'Connor",
      auditScore: 98.0,
      royaltyStatus: "current",
      oshaCompliance: true,
      brandingCompliance: true,
      chemicalHazmatCertified: true,
      lastAuditDate: "2026-08-22",
    }
  ]);

  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseAudit | null>(null);

  const avgAuditScore = Math.round(
    franchises.reduce((acc, f) => acc + f.auditScore, 0) / franchises.length
  );

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-6 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Brand Governance & Standards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Franchise Compliance & Standards
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Multi-location franchisee audits, brand consistency, OSHA safety protocol adherence, and royalty tracking.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 text-blue-600" /> Export Compliance Summary
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Active Franchise Hubs</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{franchises.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% operational standing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Avg Audit Score</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{avgAuditScore}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Exceeds 95% target</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">OSHA Safety Compliance</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">100%</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Zero critical violations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Royalty Fee Status</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Current</p>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">All settlements reconciled</p>
        </div>
      </div>

      {/* Franchise Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Franchisee Brand Audit Records</h3>
            <p className="text-xs text-slate-500 mt-0.5">Physical equipment, chemical handling, and uniform brand standard scores</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 pl-6">Franchise Code</th>
                <th className="p-4">Hub Location</th>
                <th className="p-4">Owner / Operator</th>
                <th className="p-4">Audit Score</th>
                <th className="p-4">OSHA Certified</th>
                <th className="p-4">Brand Verified</th>
                <th className="p-4">Royalty</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {franchises.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-xs text-slate-900">{f.code}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900 text-xs">{f.franchiseName}</p>
                    <p className="text-[11px] text-slate-500">{f.location}</p>
                  </td>
                  <td className="p-4 text-xs font-medium text-slate-700">{f.owner}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {f.auditScore}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Passed
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compliant
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {f.royaltyStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => setSelectedFranchise(f)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Audit Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Franchise Detail Modal */}
      {selectedFranchise && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{selectedFranchise.franchiseName}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedFranchise.code} • Last Audited: {selectedFranchise.lastAuditDate}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedFranchise.auditScore}%
              </span>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">Operating Franchisee: {selectedFranchise.owner}</p>
                <p className="text-slate-500">Territory: {selectedFranchise.location} Regional Market</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Standard Verification Checklist:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="font-medium text-slate-700">OSHA Safety & Secondary Containment</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="font-medium text-slate-700">Official SCOMS Livery & Crew Badges</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="font-medium text-slate-700">HAZMAT & Bloodborne Pathogen Training</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> 100% Crew</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="font-medium text-slate-700">Monthly Revenue Share & Royalty Remittance</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> Paid</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setSelectedFranchise(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
