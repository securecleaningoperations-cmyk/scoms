"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
        // Fetch user profile to determine role
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Fallback to default dashboard if profile fetch fails
          router.push("/dashboard");
          return;
        }

        const role = userProfile?.role;
        
        if (role === 'field_employee' || role === 'supervisor') {
          router.push("/employee/dashboard");
        } else if (role === 'client_admin' || role === 'client_user') {
          router.push("/portal/dashboard");
        } else {
          // Executives, admins, HR, dispatch, etc. go to main dashboard
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

  return (
    <div className="min-h-screen bg-cloud flex items-center justify-center p-4">
      <div className="cal-card max-w-[440px] w-full p-8 md:p-10 relative overflow-hidden">
        
        {/* Decorative Blobs */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-sky-cyan rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-coral-magenta rounded-full mix-blend-multiply blur-3xl opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-cloud border border-hairline flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-signal-blue" />
          </div>
          
          <h1 className="text-[28px] font-bold text-ink-navy font-display text-center mb-2">Welcome back</h1>
          <p className="text-slate-gray text-center mb-8">Sign in to your SCOMS workspace</p>
          
          <button 
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 border border-hairline bg-paper rounded-lg p-3 hover:bg-cloud transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-ink-navy font-semibold text-sm">Sign in with Google</span>
          </button>
          
          <button 
            type="button"
            onClick={() => handleOAuth('azure')}
            className="w-full flex items-center justify-center gap-3 bg-ink-navy rounded-lg p-3 hover:opacity-90 transition-opacity mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 21 21">
              <path fill="#f3f3f3" d="M10 0H0v10h10V0zM21 0H11v10h10V0zM10 11H0v10h10V11zM21 11H11v10h10V11z"/>
            </svg>
            <span className="text-paper font-semibold text-sm">Sign in with Microsoft</span>
          </button>
          
          <div className="flex items-center w-full gap-4 mb-8">
            <div className="flex-1 h-px bg-hairline"></div>
            <span className="text-xs text-mist-gray font-semibold uppercase tracking-wider">Or continue with email</span>
            <div className="flex-1 h-px bg-hairline"></div>
          </div>

          {error && (
            <div className="w-full bg-[#fff0f0] border border-[#ffcccc] text-[#ef4444] text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
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
                "Log in to workspace"
              )}
            </button>
          </form>
          
          <p className="text-sm text-slate-gray mt-8 text-center">
            Don't have an account? <Link href="/signup" className="cal-btn-ghost text-signal-blue">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
