"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Shield, Eye, EyeOff, Building2, User,
  ArrowRight, Lock, Mail, KeyRound, Briefcase, AlertCircle, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth, type UserProfile, type ScomsRole } from "@/lib/auth/AuthProvider";

type RoleTier = "super_admin" | "company_client" | "manager_supervisor" | "cleaner_field";

interface RoleConfig {
  id: RoleTier;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  tabActive: string;
  tabInactive: string;
  headerBg: string;
  defaultEmail: string;
  defaultPass: string;
  username: string;
  employeeId: string;
  name: string;
  department: string;
  role: ScomsRole;
  redirectUrl: string;
}

const ROLE_CONFIGS: Record<RoleTier, RoleConfig> = {
  super_admin: {
    id: "super_admin",
    tabLabel: "Super Admin",
    badge: "Platform Owner",
    title: "Executive Super Admin",
    subtitle: "Complete platform control, financial ledger, security RBAC and operations.",
    icon: Shield,
    accentColor: "blue",
    tabActive: "bg-blue-600 text-white shadow-md shadow-blue-600/20",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    headerBg: "bg-blue-50/70 border-b border-blue-100 text-blue-950",
    defaultEmail: "admin@securecleaningoperations.com",
    defaultPass: "admin123",
    username: "@david.vance",
    employeeId: "EMP-0001",
    name: "David Vance",
    department: "Executive Platform Ownership",
    role: "super_admin",
    redirectUrl: "/dashboard"
  },
  company_client: {
    id: "company_client",
    tabLabel: "Client / Company",
    badge: "Facility Account",
    title: "Commercial Client Portal",
    subtitle: "Facility service requests, walkthrough approvals, invoices and live inspection reports.",
    icon: Building2,
    accentColor: "emerald",
    tabActive: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    headerBg: "bg-emerald-50/70 border-b border-emerald-100 text-emerald-950",
    defaultEmail: "client@apexlogistics.com",
    defaultPass: "client123",
    username: "@apex.facility",
    employeeId: "CLI-8092",
    name: "Apex Logistics",
    department: "Commercial Facility Operations",
    role: "client_admin",
    redirectUrl: "/portal/dashboard"
  },
  manager_supervisor: {
    id: "manager_supervisor",
    tabLabel: "Manager",
    badge: "Field Operations Lead",
    title: "Operations Manager",
    subtitle: "Route scheduling, shift team dispatch, CAPA inspections and daily walkthrough logs.",
    icon: Briefcase,
    accentColor: "violet",
    tabActive: "bg-indigo-600 text-white shadow-md shadow-indigo-600/20",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    headerBg: "bg-indigo-50/70 border-b border-indigo-100 text-indigo-950",
    defaultEmail: "ops.manager@securecleaningoperations.com",
    defaultPass: "manager123",
    username: "@marcus.v",
    employeeId: "EMP-1042",
    name: "Marcus Vance",
    department: "Operations Field Dispatch",
    role: "operations_manager",
    redirectUrl: "/dashboard"
  },
  cleaner_field: {
    id: "cleaner_field",
    tabLabel: "Field Crew",
    badge: "Cleaning Technician",
    title: "Field Technician Console",
    subtitle: "Mobile clock in/out, SDS chemical safety sheets, shift tasks and room sanitization checklist.",
    icon: User,
    accentColor: "amber",
    tabActive: "bg-amber-600 text-white shadow-md shadow-amber-600/20",
    tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    headerBg: "bg-amber-50/70 border-b border-amber-100 text-amber-950",
    defaultEmail: "cleaner.lead@securecleaningoperations.com",
    defaultPass: "cleaner123",
    username: "@carlos.tech",
    employeeId: "EMP-3015",
    name: "Carlos Rodriguez",
    department: "Commercial Cleaning Crew Lead",
    role: "field_employee",
    redirectUrl: "/employee/dashboard"
  }
};

const ACCENT_RING: Record<string, string> = {
  blue: "focus:ring-blue-500 focus:border-blue-500",
  emerald: "focus:ring-emerald-500 focus:border-emerald-500",
  violet: "focus:ring-indigo-500 focus:border-indigo-500",
  amber: "focus:ring-amber-500 focus:border-amber-500",
};
const ACCENT_BTN: Record<string, string> = {
  blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
  emerald: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
  violet: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
  amber: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
};
const ACCENT_DOT: Record<string, string> = {
  blue: "bg-blue-600",
  emerald: "bg-emerald-600",
  violet: "bg-indigo-600",
  amber: "bg-amber-600",
};
const ACCENT_ICON_BG: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-indigo-100 text-indigo-700",
  amber: "bg-amber-100 text-amber-700",
};

export default function LoginPage() {
  const router = useRouter();
  const { loginAsUser } = useAuth();

  const [activeTier, setActiveTier] = useState<RoleTier>("super_admin");
  const [email, setEmail] = useState(ROLE_CONFIGS.super_admin.defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentConfig = ROLE_CONFIGS[activeTier];
  const ring = ACCENT_RING[currentConfig.accentColor];
  const btn = ACCENT_BTN[currentConfig.accentColor];
  const dot = ACCENT_DOT[currentConfig.accentColor];
  const iconBg = ACCENT_ICON_BG[currentConfig.accentColor];
  const TierIcon = currentConfig.icon;

  const handleTabChange = (tier: RoleTier) => {
    setActiveTier(tier);
    setError(null);
    setEmail(ROLE_CONFIGS[tier].defaultEmail);
    setPassword("");
  };

  const executeLogin = (profile: UserProfile, url: string) => {
    loginAsUser(profile);
    router.push(url);
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (!authError && data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const detectedRole: ScomsRole = meta.role
          ? (meta.role.toLowerCase().replace(/\s+/g, "_") as ScomsRole)
          : currentConfig.role;
        const profile: UserProfile = {
          id: u.id,
          email: u.email || email,
          firstName: meta.first_name || currentConfig.name.split(" ")[0],
          lastName: meta.last_name || currentConfig.name.split(" ").slice(1).join(" "),
          role: detectedRole,
          employeeId: meta.employee_id || currentConfig.employeeId,
          username: meta.username || currentConfig.username,
          department: currentConfig.department
        };
        executeLogin(profile, currentConfig.redirectUrl);
        return;
      }
    } catch (err) {
      console.warn("Supabase auth error, falling back to credentials check:", err);
    }

    // Fallback: accept any password >= 4 chars for demo
    if (password.length >= 4) {
      const profile: UserProfile = {
        id: `usr-${currentConfig.employeeId.toLowerCase()}`,
        email,
        firstName: currentConfig.name.split(" ")[0],
        lastName: currentConfig.name.split(" ").slice(1).join(" ") || "",
        role: currentConfig.role,
        employeeId: currentConfig.employeeId,
        username: currentConfig.username,
        department: currentConfig.department
      };
      executeLogin(profile, currentConfig.redirectUrl);
    } else {
      setError("Invalid credentials. Password must be at least 4 characters.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Top Nav */}
      <header className="relative z-10 w-full px-5 sm:px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">SCOMS</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold uppercase">v4.0</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Secure Cleaning Operations Inc.</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-slate-600 hover:text-blue-600 transition flex items-center gap-1 font-semibold">
          <span>Back to Landing Page</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign In to SCOMS</h1>
            <p className="text-sm text-slate-600">Select your account tier to access your workspace</p>
          </div>

          {/* Role Tabs */}
          <div className="bg-slate-200/70 border border-slate-300/80 rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
            {(["super_admin", "company_client", "manager_supervisor", "cleaner_field"] as const).map((tierKey) => {
              const config = ROLE_CONFIGS[tierKey];
              const Icon = config.icon;
              const isActive = activeTier === tierKey;
              return (
                <button
                  key={tierKey}
                  onClick={() => handleTabChange(tierKey)}
                  className={`flex-1 min-w-[90px] py-2.5 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 shrink-0 ${isActive ? config.tabActive : config.tabInactive}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="leading-tight text-center">{config.tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Card header */}
            <div className={`${currentConfig.headerBg} px-6 py-5 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${iconBg} border border-slate-200/60`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {currentConfig.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {currentConfig.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                  {currentConfig.subtitle}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 border border-slate-200/60 shadow-xs`}>
                <TierIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Form area */}
            <div className="p-6 space-y-4">
              
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Work Email or Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="email@company.com or EMP-0001"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${ring} transition`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Default: {currentConfig.defaultPass}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${ring} transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Identity badge */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="font-mono text-slate-800 font-semibold">{currentConfig.username}</span>
                  </div>
                  <span className="font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{currentConfig.employeeId}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md ${btn} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Sign In as {currentConfig.tabLabel}</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>
              </form>

              {/* Portal links */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-center mb-2.5">Direct Portal Access</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/employee/login"
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs text-center font-bold transition">
                    Mobile Crew Portal
                  </Link>
                  <Link href="/portal/login"
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs text-center font-bold transition">
                    Client Facility Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 pb-4">
            SCOMS Enterprise v4.0 &bull; Secure Cleaning Operations Management System
          </p>
        </div>
      </main>
    </div>
  );
}
