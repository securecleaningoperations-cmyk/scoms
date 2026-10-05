"use client";

import { useState, useEffect } from "react";
import {
  UserPlus, CheckCircle, Clock, AlertCircle, FileText, UploadCloud,
  FileSignature, Copy, X, Loader2, ShieldCheck, Building2, MapPin,
  PhoneCall, DollarSign, Award, ChevronRight, Sparkles, Sliders,
  Check, ArrowRight, Shield, Layers, HelpCircle, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { InviteUserModal } from "@/components/InviteUserModal";

interface OnboardingMilestone {
  id: string;
  title: string;
  module: string;
  desc: string;
  completed: boolean;
  tag: string;
  actionText: string;
  actionHref?: string;
  actionType?: "navigate" | "modal";
}

export default function OnboardingCenter() {
  const [activeTab, setActiveTab] = useState<"platform" | "employees">("platform");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empForm, setEmpForm] = useState({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });
  const [newCredentials, setNewCredentials] = useState<{email: string, password: string} | null>(null);

  // Platform Organization Onboarding State
  const [orgConfig, setOrgConfig] = useState({
    companyName: "Secure Cleaning Operations Inc.",
    businessHours: "Monday – Friday, 10:00 AM – 5:30 PM",
    hqAddress: "1400 Commercial Blvd, Dallas, TX 75201",
    phoneHotline: "+1 (800) 555-SCOMS",
    geofenceRadius: 150,
    marginTarget: 40,
    twilioVoiceActive: true,
    letterheadUploaded: true,
  });

  const [milestones, setMilestones] = useState<OnboardingMilestone[]>([
    {
      id: "company_profile",
      title: "Organization Profile & Business Hours",
      module: "Core Enterprise Identity",
      desc: "Configure legal entity name, headquarters, operating hours (Mon-Fri 10:00 AM - 5:30 PM), and emergency dispatch line.",
      completed: true,
      tag: "Verified",
      actionText: "Review Profile",
      actionType: "modal",
    },
    {
      id: "facility_geofence",
      title: "Facility Geofencing & GPS Telemetry",
      module: "Workforce & Scheduling Engine",
      desc: "Set default 150-meter geofence perimeter for automated clock-in verification and spoof prevention.",
      completed: true,
      tag: "150m Perimeter",
      actionText: "Live Dispatch Board",
      actionHref: "/dashboard/scheduling/dispatch",
      actionType: "navigate",
    },
    {
      id: "pricing_tiers",
      title: "Commercial Service Packages & Pricing Matrix",
      module: "Bid Calculator & CRM",
      desc: "Configure 3-tier proposals (Silver, Gold, Platinum), base square footage rates, and minimum margin thresholds.",
      completed: true,
      tag: "3 Tiers Active",
      actionText: "Commercial Bid Calc",
      actionHref: "/dashboard/bid-calculator",
      actionType: "navigate",
    },
    {
      id: "twilio_phone",
      title: "Twilio Voice AI Phone Agent & Routing",
      module: "Communication Intelligence",
      desc: "24/7 AI business receptionist triage for new sales leads, service tickets, technician scheduling, and applicant screening.",
      completed: true,
      tag: "Active (24/7)",
      actionText: "Phone Console",
      actionHref: "/dashboard/phone-agent",
      actionType: "navigate",
    },
    {
      id: "document_branding",
      title: "Document Repository & Branded Cover Sheets",
      module: "SCOMS v6.1 Records Office",
      desc: "Standardize client contracts, vendor agreements, and employee handbooks with non-destructive official cover sheets.",
      completed: true,
      tag: "Templates Ready",
      actionText: "Document Center",
      actionHref: "/dashboard/documents",
      actionType: "navigate",
    },
    {
      id: "workforce_enrollment",
      title: "Workforce Roster & Compliance Certification",
      module: "HR & Field Services",
      desc: "Enroll supervisors, technicians, and assign OSHA 1910.1030 & GBAC Star biohazard certifications.",
      completed: false,
      tag: "In Progress",
      actionText: "Enroll Technician",
      actionType: "modal",
    },
  ]);

  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("scoms_org_onboarding_config");
        if (saved) {
          setOrgConfig(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hr/employees');
      const json = await res.json();
      if (json.data) {
        setEmployees(json.data || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...empForm })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create employee');
      
      setShowAddModal(false);
      setEmpForm({ first_name: '', last_name: '', email: '', role: 'field_employee', pay_type: 'hourly', pay_rate: '' });
      fetchEmployees();
      
      // Mark workforce step complete if at least 1 employee added
      setMilestones(prev => prev.map(m => m.id === "workforce_enrollment" ? { ...m, completed: true, tag: "Enrolled" } : m));
      
      if (json.credentials) {
        setNewCredentials(json.credentials);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (newCredentials) {
      navigator.clipboard.writeText(`Email: ${newCredentials.email}\nPassword: ${newCredentials.password}`);
      alert("Credentials copied to clipboard!");
    }
  };

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPct = Math.round((completedCount / milestones.length) * 100);

  const pendingOnboarding = employees.filter(e => e.status === 'onboarding').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8 font-sans antialiased pb-28 text-slate-900">
      
      {/* ── Top Header & Readiness Indicator ────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Master Blueprint Setup
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Production Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Onboarding &amp; Setup Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Secure Cleaning Operations Inc. &bull; System parameter definitions, facility compliance verification, and technician provisioning.
          </p>
        </div>

        {/* Overall Progress Box */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 min-w-[300px] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Platform Readiness
            </span>
            <span className="text-sm font-extrabold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {progressPct}% Ready
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{completedCount} of {milestones.length} Milestones Configured</span>
            <span className="text-emerald-700 font-bold">{progressPct === 100 ? "Ready for Audits" : "In Progress"}</span>
          </div>
        </div>
      </div>

      {/* ── Organization Code & Email Invites Banner ─────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-white rounded-2xl p-5 border border-blue-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                Active Organization
              </span>
              <span className="text-xs text-slate-500 font-mono">SCOMS Enterprise Multi-Tenant</span>
            </div>
            <p className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">Secure Cleaning Operations Inc.</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-600 font-medium">Organization ID Code:</span>
              <span className="font-mono text-xs font-black bg-white px-2.5 py-0.5 rounded-md border border-blue-300 text-blue-900 shadow-2xs">
                ORG-SCOMS-7749
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setInviteUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Users via Email</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "platform"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organization &amp; System Setup</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "platform" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
            {milestones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "employees"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Workforce Provisioning &amp; Sigs</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "employees" ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"}`}>
            {employees.length}
          </span>
        </button>

        <div className="ml-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Technician</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: Organization & Master Setup ──────────────────────── */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {m.module}
                    </span>
                    <button
                      onClick={() => toggleMilestone(m.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition ${
                        m.completed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 text-transparent hover:border-slate-400"
                      }`}
                      title={m.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {m.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    m.completed ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {m.tag}
                  </span>

                  {m.actionHref ? (
                    <Link
                      href={m.actionHref}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>{m.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        if (m.id === "company_profile") setShowConfigModal(true);
                        else if (m.id === "workforce_enrollment") setShowAddModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>{m.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Specifications Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Company Operational Parameters</h3>
                <p className="text-xs text-slate-500">Live system configuration across all 14 SCOMS engines</p>
              </div>
              <button
                onClick={() => setShowConfigModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Legal Company Name</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{orgConfig.companyName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Official Operating Hours</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{orgConfig.businessHours}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">GPS Geofence Radius</span>
                <p className="text-sm font-bold text-slate-900 mt-1">{orgConfig.geofenceRadius} meters</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Gross Margin</span>
                <p className="text-sm font-bold text-slate-900 mt-1 font-mono">{orgConfig.marginTarget}% minimum</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Employee Provisioning & Signatures ───────────────── */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-mono">{pendingOnboarding}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">In Progress</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-mono">{activeEmployees}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Staff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-600">
                <FileSignature className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-mono">0</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Pending E-Sigs</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-mono">100%</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">OSHA Verified</p>
            </div>
          </div>

          {/* Active Onboarding Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Workforce Provisioning Roster</h2>
                <p className="text-xs text-slate-500">Employee lifecycle from invite to verified field clearance</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Hire</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-6 py-3.5 font-bold">Technician Name</th>
                    <th className="px-6 py-3.5 font-bold">System Role</th>
                    <th className="px-6 py-3.5 font-bold">Progress</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        No employees currently enrolled. Click &ldquo;Add Hire&rdquo; to begin provisioning.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const name = `${emp.users?.first_name || emp.first_name || ''} ${emp.users?.last_name || emp.last_name || ''}`.trim() || 'Cleaning Specialist';
                      const progress = emp.status === 'active' ? 100 : 40;
                      const statusColor = emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500';

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                                {name.substring(0, 2)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{name}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{emp.users?.email || emp.email || "staff@securecleaningoperations.com"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700 capitalize">
                            {emp.users?.role?.replace(/_/g, ' ') || emp.role?.replace(/_/g, ' ') || 'Field Employee'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px]">
                                <div className={`${statusColor} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-900">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 capitalize border border-slate-200">
                              <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
                              {emp.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/dashboard/hr`} className="text-blue-600 hover:text-blue-800 font-bold hover:underline">
                              Profile &rarr;
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Documents Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Standard Onboarding Documents Checklist</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">W-4 Federal Tax Withholding</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">Auto-Generated</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">I-9 Employment Eligibility Verification</span>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">Digital Upload</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <FileSignature className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-slate-900">Safety SOPs &amp; Handbook Acknowledgment</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-bold">E-Sign Only</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 text-blue-600">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Batch Technician Import</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-xs">
                Upload CSV roster of commercial cleaners to provision credentials and dispatch checklists automatically.
              </p>
              <button
                onClick={() => alert("Batch CSV template downloaded.")}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Download Master CSV Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Employee ──────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative border border-slate-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Provision Field Personnel</h3>
                <p className="text-xs text-slate-500">Generate credentials and assign system roles</p>
              </div>
            </div>
            
            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name</label>
                  <input
                    required
                    type="text"
                    value={empForm.first_name}
                    onChange={e => setEmpForm(p => ({ ...p, first_name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Marcus"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    required
                    type="text"
                    value={empForm.last_name}
                    onChange={e => setEmpForm(p => ({ ...p, last_name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Vance"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email</label>
                <input
                  required
                  type="email"
                  value={empForm.email}
                  onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="marcus.v@securecleaningoperations.com"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Role</label>
                <select
                  required
                  value={empForm.role}
                  onChange={e => setEmpForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="field_employee">Lead Cleaner / Technician</option>
                  <option value="supervisor">Field Operations Supervisor</option>
                  <option value="operations_manager">Operations Manager</option>
                  <option value="hr_manager">HR &amp; Safety Director</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pay Type</label>
                  <select
                    required
                    value={empForm.pay_type}
                    onChange={e => setEmpForm(p => ({ ...p, pay_type: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Hourly ($/hr)</option>
                    <option value="salary">Salary (Annual)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pay Rate ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={empForm.pay_rate}
                    onChange={e => setEmpForm(p => ({ ...p, pay_rate: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="22.50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? "Provisioning..." : "Create Technician Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Credentials Created ───────────────────────────────── */}
      {newCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[60] p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-7 relative text-center border border-slate-200">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 border border-emerald-200">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Staff Account Active!</h3>
            <p className="text-slate-500 text-xs mb-6">
              Account created and linked to SCOMS workforce engine. Provide these secure credentials to the technician.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3 mb-6 relative">
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 shadow-xs transition"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email (Login ID)</p>
                <p className="font-mono text-slate-900 font-bold text-sm">{newCredentials.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temporary Password</p>
                <p className="font-mono text-slate-900 font-bold text-sm">{newCredentials.password}</p>
              </div>
            </div>

            <button
              onClick={() => setNewCredentials(null)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Organization Parameters ─────────────────────── */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative border border-slate-200">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">System Operating Parameters</h3>
                <p className="text-xs text-slate-500">Configure global business rules for Secure Cleaning Operations Inc.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={orgConfig.companyName}
                  onChange={e => setOrgConfig(p => ({ ...p, companyName: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Business Hours</label>
                <input
                  type="text"
                  value={orgConfig.businessHours}
                  onChange={e => setOrgConfig(p => ({ ...p, businessHours: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={orgConfig.hqAddress}
                  onChange={e => setOrgConfig(p => ({ ...p, hqAddress: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GPS Geofence (Meters)</label>
                  <input
                    type="number"
                    value={orgConfig.geofenceRadius}
                    onChange={e => setOrgConfig(p => ({ ...p, geofenceRadius: Number(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Margin (%)</label>
                  <input
                    type="number"
                    value={orgConfig.marginTarget}
                    onChange={e => setOrgConfig(p => ({ ...p, marginTarget: Number(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("scoms_org_onboarding_config", JSON.stringify(orgConfig));
                    setShowConfigModal(false);
                    alert("Operating parameters saved successfully.");
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                >
                  Save Parameters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Invite User Modal */}
      <InviteUserModal
        isOpen={inviteUserOpen}
        onClose={() => setInviteUserOpen(false)}
      />
    </div>
  );
}
