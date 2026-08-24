"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // If auto-confirm is enabled in Supabase, we log them in directly
      // Otherwise they need to check their email. For now, we route to dashboard or login
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/login?message=Check your email to verify your account");
      }
    } catch (err: any) {
      let msg = err.message || "Failed to sign up";
      if (msg === "{}" || msg === "[object Object]") {
        msg = "Database schema error. Please ensure you ran the latest supabase.sql in your Supabase dashboard.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cloud flex items-center justify-center p-4 py-12">
      <div className="cal-card max-w-[500px] w-full p-8 md:p-10 relative overflow-hidden">
        
        {/* Decorative Blobs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-cyan rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-coral-magenta rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-cloud border border-hairline flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-signal-blue" />
          </div>
          
          <h1 className="text-[28px] font-bold text-ink-navy font-display text-center mb-2">Create your workspace</h1>
          <p className="text-slate-gray text-center mb-8">Start your free 14-day compliance assessment</p>
          
          {error && (
            <div className="w-full bg-[#fff0f0] border border-[#ffcccc] text-[#ef4444] text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-ink-navy">First Name</label>
                 <input 
                   type="text" 
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                   className="w-full border border-hairline rounded-lg p-3 bg-pebble text-ink-navy outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                   required
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-sm font-semibold text-ink-navy">Last Name</label>
                 <input 
                   type="text" 
                   value={lastName}
                   onChange={(e) => setLastName(e.target.value)}
                   className="w-full border border-hairline rounded-lg p-3 bg-pebble text-ink-navy outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                   required
                 />
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink-navy">Company / Organization</label>
              <input 
                type="text" 
                placeholder="Acme Defense Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-hairline rounded-lg p-3 bg-pebble text-ink-navy outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink-navy">Work Email</label>
              <input 
                type="email" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-hairline rounded-lg p-3 bg-pebble text-ink-navy placeholder:text-mist-gray outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink-navy">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-hairline rounded-lg p-3 bg-pebble text-ink-navy outline-none focus:border-signal-blue focus:ring-1 focus:ring-signal-blue transition-all"
                required
                minLength={8}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="cal-btn-primary w-full mt-4 flex justify-center items-center h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          
          <p className="text-sm text-slate-gray mt-8 text-center">
            Already have an account? <Link href="/login" className="cal-btn-ghost text-signal-blue">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
