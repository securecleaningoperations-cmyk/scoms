"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield, Building2, Mail, Lock, User, KeyRound,
  ArrowRight, CheckCircle2, AlertCircle, ChevronRight, Hash
} from "lucide-react";
import { useAuth, type UserProfile, type ScomsRole } from "@/lib/auth/AuthProvider";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsUser } = useAuth();

  const [orgCode, setOrgCode] = useState("ORG-SCOMS-7749");
  const [orgName, setOrgName] = useState("Secure Cleaning Operations Inc.");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<ScomsRole>("operations_manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill from invite URL params if available
  useEffect(() => {
    if (!searchParams) return;
    const org = searchParams.get("org");
    const roleParam = searchParams.get("role");
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");

    if (org) setOrgCode(org);
    if (roleParam) setRole(roleParam as ScomsRole);
    if (emailParam) setEmail(emailParam);
    if (nameParam) setFullName(nameParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || "User";
      const lastName = parts.slice(1).join(" ") || "";
      const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email: email.trim().toLowerCase(),
        firstName,
        lastName,
        role,
        employeeId,
        username: `@${firstName.toLowerCase()}.${lastName ? lastName[0].toLowerCase() : "user"}`,
        department: role === "super_admin" ? "Executive Platform Ownership" : "Operations Management",
        organizationName: orgName,
        organizationCode: orgCode
      };

      // Store in registered users store
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("scoms_registered_users");
          const existing = raw ? JSON.parse(raw) : [];
          const updated = [...existing.filter((u: any) => u.email !== newProfile.email), {
            ...newProfile,
            password
          }];
          localStorage.setItem("scoms_registered_users", JSON.stringify(updated));
        } catch {}
      }

      setSuccess(true);

      setTimeout(() => {
        loginAsUser(newProfile);
        if (role === "client_admin" || role === "client_user") {
          router.push("/portal/dashboard");
        } else if (role === "field_employee") {
          router.push("/employee/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 1000);

    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Organization Account</h1>
        <p className="text-sm text-slate-600">Join your team&apos;s workspace with an assigned Organization ID</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Header Strip */}
        <div className="bg-blue-50/80 border-b border-blue-100 p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
              Workspace Access
            </span>
            <h2 className="text-base font-extrabold text-blue-950">Enterprise Registration</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Account registered successfully! Redirecting to workspace...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Organization ID & Name Strip */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Organization Code
                </span>
                <span className="text-[10px] text-slate-500">Provided by admin</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    required
                    type="text"
                    value={orgCode}
                    onChange={e => setOrgCode(e.target.value.toUpperCase())}
                    placeholder="ORG-SCOMS-7749"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                  />
                </div>
                <input
                  required
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Organization Name"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="e.g. David Vance"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Role Tier
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as ScomsRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="super_admin">Executive Super Admin</option>
                <option value="operations_manager">Operations Manager</option>
                <option value="supervisor">Field Supervisor</option>
                <option value="quality_manager">Quality & Compliance Officer</option>
                <option value="field_employee">Field Cleaning Technician</option>
                <option value="client_admin">Client Facility Admin</option>
              </select>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    placeholder="At least 6 chars"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Join Workspace</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Back to sign in */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Sign In to Workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
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
        <Link href="/login" className="text-xs text-slate-600 hover:text-blue-600 transition flex items-center gap-1 font-semibold">
          <span>Already registered? Sign In</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading sign-up form...</div>}>
          <SignUpContent />
        </Suspense>
      </main>
    </div>
  );
}
