"use client";

import { UserPlus, CheckCircle, Clock, AlertCircle, FileText, UploadCloud, FileSignature } from "lucide-react";

export default function OnboardingCenter() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-display">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-ink-navy mb-2 tracking-tight">Employee Onboarding</h1>
          <p className="text-slate-gray">Module 1.1 • Automated document collection, signatures, and setup.</p>
        </div>
        <button className="cal-btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Start New Onboarding
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-cloud rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-tangerine" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">8</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">In Progress</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#fee2e2] rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-[#ef4444]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">3</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Action Required</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-[#166534]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">12</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Completed (30d)</p>
        </div>
        <div className="cal-card p-6 border border-hairline bg-paper text-center">
          <div className="w-12 h-12 bg-[#dbeaff] rounded-full flex items-center justify-center mx-auto mb-3">
            <FileSignature className="w-6 h-6 text-[#1e3a8a]" />
          </div>
          <h2 className="text-3xl font-bold text-ink-navy">5</h2>
          <p className="text-sm font-semibold text-mist-gray uppercase tracking-widest mt-1">Pending Sigs</p>
        </div>
      </div>

      <div className="bg-paper border border-hairline rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-hairline bg-cloud/30">
          <h2 className="text-lg font-bold text-ink-navy">Active Onboarding Flows</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cloud text-xs uppercase tracking-widest text-mist-gray border-b border-hairline">
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {[
                { name: "Michael Chang", role: "Cleaning Supervisor", progress: 80, status: "Awaiting I-9", color: "bg-tangerine" },
                { name: "Sarah Williams", role: "Field Technician", progress: 45, status: "Missing Direct Deposit", color: "bg-[#ef4444]" },
                { name: "David Miller", role: "Area Manager", progress: 95, status: "Pending Final Review", color: "bg-[#10b981]" }
              ].map((person, idx) => (
                <tr key={idx} className="hover:bg-cloud/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-signal-blue text-white flex items-center justify-center font-bold text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-ink-navy text-sm">{person.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-gray">{person.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-pebble rounded-full h-2 max-w-[120px]">
                        <div className={`${person.color} h-2 rounded-full`} style={{ width: `${person.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-ink-navy">{person.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-gray flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${person.color}`}></span>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-signal-blue hover:text-ink-navy font-medium text-sm transition-colors">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cal-card p-6 bg-paper border border-hairline">
          <h3 className="text-lg font-bold text-ink-navy mb-4">Required Documents Checklist</h3>
          <ul className="space-y-3">
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">W-4 Tax Form</span>
                </div>
                <span className="text-xs bg-soft-mint text-vivid-green px-2 py-0.5 rounded font-semibold">Auto-Generated</span>
             </li>
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">I-9 Employment Eligibility</span>
                </div>
                <span className="text-xs bg-[#dbeaff] text-electric-blue px-2 py-0.5 rounded font-semibold">Requires Upload</span>
             </li>
             <li className="flex justify-between items-center p-3 bg-cloud rounded-lg border border-hairline">
                <div className="flex items-center gap-3">
                   <FileSignature className="w-4 h-4 text-signal-blue" />
                   <span className="text-sm font-medium text-ink-navy">Employee Handbook</span>
                </div>
                <span className="text-xs bg-paper-mist text-slate-gray px-2 py-0.5 rounded font-semibold border border-hairline">E-Sign Only</span>
             </li>
          </ul>
        </div>
        
        <div className="cal-card p-6 bg-paper border border-hairline flex flex-col justify-center items-center text-center border-dashed border-2">
           <div className="w-12 h-12 bg-cloud rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-signal-blue" />
           </div>
           <h3 className="font-bold text-ink-navy mb-1">Mass Import Employees</h3>
           <p className="text-sm text-slate-gray mb-4">Upload a CSV to invite multiple employees to the onboarding portal at once.</p>
           <button className="cal-btn-ghost border border-hairline">Download CSV Template</button>
        </div>
      </div>
    </div>
  );
}
