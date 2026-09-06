"use client";

import Link from "next/link";
import { 
  ShieldCheck, Smartphone, ExternalLink, Briefcase, 
  DollarSign, Activity, Users, Network, ChevronRight, Lock
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DEMO_ROLES = [
  {
    role: "super_admin",
    title: "Corporate Super Admin",
    desc: "Executive Oversight, Master Audit & Config",
    url: "/dashboard",
    icon: ShieldCheck,
    color: "bg-blue-600 text-white"
  },
  {
    role: "operations_manager",
    title: "Operations & Dispatch",
    desc: "Live Operations, Scheduling & Job Control",
    url: "/dashboard/operations",
    icon: Activity,
    color: "bg-indigo-600 text-white"
  },
  {
    role: "finance_admin",
    title: "Finance & Accounting (CFO)",
    desc: "GL, AR/AP, Invoices, Job Costing & Taxes",
    url: "/dashboard/gl/accountant",
    icon: DollarSign,
    color: "bg-emerald-600 text-white"
  },
  {
    role: "field_employee",
    title: "Field Cleaning Specialist (Mobile App)",
    desc: "Site QR Check-in, GPS Shifts, Time Tracking",
    url: "/employee/dashboard",
    icon: Smartphone,
    color: "bg-purple-600 text-white"
  },
  {
    role: "client_admin",
    title: "Customer Self-Service Portal",
    desc: "Service Requests, Schedule, Invoices & QA",
    url: "/portal/dashboard",
    icon: ExternalLink,
    color: "bg-sky-600 text-white"
  },
  {
    role: "vendor_manager",
    title: "Subcontractors & Vendors Hub",
    desc: "Subcontractor Compliance, Rates & Auditing",
    url: "/dashboard/subcontractors",
    icon: Briefcase,
    color: "bg-amber-600 text-white"
  },
  {
    role: "franchise_admin",
    title: "Franchise Operations Hub",
    desc: "Multi-unit Compliance, Quality & Performance",
    url: "/dashboard/franchise",
    icon: Network,
    color: "bg-teal-600 text-white"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      if (data.session) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          router.push("/dashboard");
          return;
        }

        const role = userProfile?.role;
        
        if (role === 'field_employee' || role === 'supervisor') {
          router.push("/employee/dashboard");
        } else if (role === 'client_admin' || role === 'client_user') {
          router.push("/portal/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleQuickDemoAccess = (demoUrl: string) => {
    router.push(demoUrl);
  };

  return (
    <div className="min-h-screen bg-cloud flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Main Login Form */}
        <div className="lg:col-span-6 cal-card p-6 sm:p-8 md:p-10 relative overflow-hidden bg-white shadow-xl rounded-2xl border border-slate-200">
          {/* Decorative Blobs */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-cyan rounded-full mix-blend-multiply blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-coral-magenta rounded-full mix-blend-multiply blur-3xl opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5 text-blue-600 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            
            <h1 className="text-2xl sm:text-[28px] font-bold text-ink-navy font-display text-center mb-1">
              Welcome to SCOMS 6.1
            </h1>
            <p className="text-slate-gray text-xs sm:text-sm text-center mb-6">
              Enterprise Operations, Workforce &amp; Financial Management System
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              <button 
                type="button"
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-2 border border-hairline bg-paper rounded-xl p-2.5 hover:bg-cloud transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-ink-navy font-semibold text-xs">Google SSO</span>
              </button>
              
              <button 
                type="button"
                onClick={() => handleOAuth('azure')}
                className="flex items-center justify-center gap-2 bg-ink-navy rounded-xl p-2.5 hover:opacity-90 transition-opacity shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 21 21">
                  <path fill="#f3f3f3" d="M10 0H0v10h10V0zM21 0H11v10h10V0zM10 11H0v10h10V11zM21 11H11v10h10V11z"/>
                </svg>
                <span className="text-paper font-semibold text-xs">Microsoft Entra</span>
              </button>
            </div>
            
            <div className="flex items-center w-full gap-4 mb-6">
              <div className="flex-1 h-px bg-hairline"></div>
              <span className="text-[11px] text-mist-gray font-semibold uppercase tracking-wider">Or email login</span>
              <div className="flex-1 h-px bg-hairline"></div>
            </div>

            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-navy">Work Email</label>
                <input 
                  type="email" 
                  placeholder="admin@scoms.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-hairline rounded-xl p-3 bg-pebble text-ink-navy text-sm placeholder:text-mist-gray outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-navy">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-hairline rounded-xl p-3 bg-pebble text-ink-navy text-sm outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="cal-btn-primary w-full mt-3 flex justify-center items-center h-12 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign In to SCOMS"
                )}
              </button>
            </form>
            
            <p className="text-xs text-slate-gray mt-6 text-center">
              Need account provisioning? <Link href="/signup" className="cal-btn-ghost text-signal-blue font-semibold">Request Access</Link>
            </p>
          </div>
        </div>

        {/* Right Card: 1-Click Role Exploration & Testing */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">SCOMS 6.1 Multi-Role Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Instant Role Workspace Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
              Review and test every operational module according to SCOMS 6.1 Master Scope. Select any role below to launch its dedicated workspace instantly:
            </p>

            <div className="space-y-2.5">
              {DEMO_ROLES.map((d) => (
                <button
                  key={d.role}
                  onClick={() => handleQuickDemoAccess(d.url)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 hover:border-blue-500/50 flex items-center justify-between transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${d.color}`}>
                      <d.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 group-hover:text-white truncate">
                        {d.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {d.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Security: RBAC &amp; MFA Enabled</span>
              <span className="text-indigo-400 font-medium">Production Ready v6.1</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
