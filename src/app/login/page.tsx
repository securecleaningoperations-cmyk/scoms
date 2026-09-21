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

  const handleOAuth = async (provider: "google" | "azure") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-page-title font-semibold text-text-primary">
            Sign in to SCOMS
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Secure Cleaning Operations Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="scoms-panel p-6">
          {/* SSO Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="btn btn-secondary justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuth("azure")}
              className="btn btn-secondary justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 21 21">
                <rect fill="#F25022" x="0" y="0" width="10" height="10" />
                <rect fill="#7FBA00" x="11" y="0" width="10" height="10" />
                <rect fill="#00A4EF" x="0" y="11" width="10" height="10" />
                <rect fill="#FFB900" x="11" y="11" width="10" height="10" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 text-caption text-text-muted uppercase tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

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
        </div>

        {/* Footer */}
        <p className="text-caption text-text-muted text-center mt-6">
          SCOMS Enterprise Platform • Secure Cleaning Operations
        </p>
      </div>
    </div>
  );
}
