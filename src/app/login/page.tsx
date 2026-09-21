"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shield, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // FIXED: Do NOT bypass auth on error — show the error to the user
        setError(authError.message === "Invalid login credentials"
          ? "Invalid email or password. Please check your credentials and try again."
          : authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Determine role and redirect appropriately
        let role = data.session.user.user_metadata?.role;

        if (!role) {
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("role")
              .eq("id", data.session.user.id)
              .single();
            role = userData?.role;
          } catch {
            // Fall through to default
          }
        }

        const normalizedRole = role?.toLowerCase().replace(/\s+/g, "_") || "super_admin";

        if (normalizedRole === "field_employee" || normalizedRole === "supervisor") {
          router.push("/employee/dashboard");
        } else if (normalizedRole === "client_admin" || normalizedRole === "client_user") {
          router.push("/portal/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="group flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-page-title font-semibold text-text-primary">
              Sign in to SCOMS
            </h1>
          </Link>
          <p className="text-body-sm text-text-secondary mt-1 text-center">
            Secure Cleaning Operations Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="scoms-panel p-6 shadow-sm border border-border">

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-danger-50 border border-danger-100 text-body-sm text-danger-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-label font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-label font-medium text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center btn-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-caption text-text-muted text-center mt-4">
            Need access?{" "}
            <Link href="/signup" className="text-text-link hover:underline font-medium">
              Request an account
            </Link>
          </p>

          <div className="mt-4 pt-3 border-t border-border text-center">
            <Link href="/" className="text-caption text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1 font-medium">
              ← Return to Platform Overview
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-caption text-text-muted text-center mt-6">
          SCOMS Enterprise Platform • Secure Cleaning Operations Inc.
        </p>
      </div>
    </div>
  );
}
