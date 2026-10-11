"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import AuthShell, { Alert, Field, StrengthMeter } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui";
import { completePasswordReset } from "@/lib/auth/service";
import { passwordIssues, passwordStrength, supabaseConfigured } from "@/lib/auth/roles";
import { supabase } from "@/lib/supabase";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const demoToken = params.get("demo_token");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean | null>(demoToken ? true : null);

  // Supabase recovery links sign the user in with a temporary session (hash/code in URL).
  useEffect(() => {
    if (demoToken) return;
    if (!supabaseConfigured()) { setReady(false); return; }
    const code = params.get("code");
    (async () => {
      if (code) { try { await supabase.auth.exchangeCodeForSession(code); } catch { /* fallthrough */ } }
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((evt) => { if (evt === "PASSWORD_RECOVERY") setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, [demoToken, params]);

  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const issues = passwordIssues(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (issues.length) { setError(`Password needs ${issues.join(", ")}.`); return; }
    if (pw !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    const res = await completePasswordReset(pw, demoToken);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Couldn't update your password."); return; }
    router.replace("/login?reset=1");
  };

  if (ready === null) return <div className="h-40 animate-pulse rounded-lg bg-slate-100" aria-label="Checking reset link" />;
  if (!ready) {
    return (
      <div className="space-y-5">
        <Alert>This reset link is invalid or has expired. Reset links can be used once and last 30 minutes.</Alert>
        <Button href="/forgot-password" size="lg" block>Request a new link</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <Field label="New password" htmlFor="rp-pw">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="rp-pw" type={show ? "text" : "password"} className="auth-input has-icon has-trail" autoComplete="new-password" autoFocus placeholder="At least 8 characters, with a number" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {pw && <StrengthMeter score={strength} />}
      </Field>
      <Field label="Confirm new password" htmlFor="rp-confirm">
        <input id="rp-confirm" type={show ? "text" : "password"} className="auth-input" autoComplete="new-password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
      <Button type="submit" size="lg" block loading={loading}>Update password</Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="For your security, you'll be asked to sign in again after updating it."
      clip="detail"
      footer={<p><Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</Link></p>}
    >
      <Suspense fallback={<div className="h-48" />}><ResetForm /></Suspense>
    </AuthShell>
  );
}
