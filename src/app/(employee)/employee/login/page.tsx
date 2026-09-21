"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Invalid employee email or password. Please verify your assigned credentials."
          : authError.message);
        setLoading(false);
        return;
      }
      router.push('/employee/dashboard');
    } catch (e: any) {
      setError("An unexpected error occurred. Please contact your operations supervisor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-900/40 mb-4 text-white">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Team Member Portal</h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Secure Cleaning Operations Field Mobile App</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-base font-bold text-white mb-4">Sign in to Mobile Shifts</h2>

          {error && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Technician Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                placeholder="technician@securecleaningops.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Sign In to Field Dashboard</span>
            </button>
          </form>

          <div className="pt-4 mt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Need executive or operations access?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:underline">
              Corporate Login
            </Link>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Secure Cleaning Operations Inc. • Field Operations Engine v4.0
        </p>
      </div>
    </div>
  );
}
