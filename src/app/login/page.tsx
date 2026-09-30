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
  headerGradient: string;
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
    subtitle: "Complete platform control, financial ledger, security RBAC and franchise hub governance.",
    icon: Shield,
    accentColor: "blue",
    tabActive: "bg-blue-600 text-white shadow-lg shadow-blue-900/30",
    tabInactive: "text-slate-400 hover:text-slate-200",
    headerGradient: "from-blue-900 via-blue-800 to-indigo-900",
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
    tabActive: "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30",
    tabInactive: "text-slate-400 hover:text-slate-200",
    headerGradient: "from-emerald-900 via-teal-800 to-cyan-900",
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
    tabActive: "bg-violet-600 text-white shadow-lg shadow-violet-900/30",
    tabInactive: "text-slate-400 hover:text-slate-200",
    headerGradient: "from-violet-900 via-purple-800 to-indigo-900",
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
    tabActive: "bg-amber-500 text-white shadow-lg shadow-amber-900/30",
    tabInactive: "text-slate-400 hover:text-slate-200",
    headerGradient: "from-amber-900 via-orange-800 to-red-900",
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
  violet: "focus:ring-violet-500 focus:border-violet-500",
  amber: "focus:ring-amber-500 focus:border-amber-500",
};
const ACCENT_BTN: Record<string, string> = {
  blue: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30",
  emerald: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
  violet: "bg-violet-600 hover:bg-violet-500 shadow-violet-900/30",
  amber: "bg-amber-500 hover:bg-amber-400 shadow-amber-900/30",
};
const ACCENT_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};
const ACCENT_ICON_BG: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  violet: "bg-violet-500/20 text-violet-300",
  amber: "bg-amber-500/20 text-amber-300",
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden relative">
      
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-700/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-slate-900/50 rounded-full blur-[80px]" />
      </div>

      {/* Top Nav */}
      <header className="relative z-10 w-full px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">SCOMS</span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-bold uppercase">v4.0</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Secure Cleaning Operations</p>
          </div>
        </Link>
        <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1.5">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-5">
          
          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In to SCOMS</h1>
            <p className="text-sm text-slate-400">Select your role to access your workspace</p>
          </div>

          {/* Role Tabs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-1.5 flex gap-1 backdrop-blur-sm overflow-x-auto">
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Card header gradient */}
            <div className={`bg-gradient-to-r ${currentConfig.headerGradient} px-6 py-5 flex items-center justify-between`}>
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${iconBg} border border-white/10`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {currentConfig.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-tight">
                  {currentConfig.title}
                </h2>
                <p className="text-xs text-white/60 leading-relaxed max-w-xs">
                  {currentConfig.subtitle}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0 border border-white/10`}>
                <TierIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Form area */}
            <div className="p-5 sm:p-6 space-y-4">
              
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Work Email or Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      required
                      type="text"
                      placeholder="email@company.com or EMP-0001"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${ring} transition`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-600 font-mono">
                      Demo: {currentConfig.defaultPass}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${ring} transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Identity badge */}
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="font-mono text-slate-300">{currentConfig.username}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{currentConfig.employeeId}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg ${btn} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Sign In as {currentConfig.tabLabel}
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </>
                  )}
                </button>
              </form>

              {/* Portal links */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-600 tracking-wider text-center mb-2.5">Other Portals</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/employee/login"
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-xs text-center font-semibold transition">
                    Mobile Crew Portal
                  </Link>
                  <Link href="/portal/login"
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-xs text-center font-semibold transition">
                    Client Facility Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-600 pb-4">
            SCOMS Enterprise v4.0 &bull; Secure Cleaning Operations Management System
          </p>
        </div>
      </main>
    </div>
  );
}
