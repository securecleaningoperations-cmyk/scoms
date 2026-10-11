"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import AuthShell, { Alert, Field } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui";
import { requestPasswordReset } from "@/lib/auth/service";

const COOLDOWN = 60;

function ForgotForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => { const e = params.get("email"); if (e) setEmail(e); }, [params]);
  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (!res.ok) { setError(res.error || "Something went wrong."); return; }
    setSent(true);
    setDemoLink(res.demoLink ?? null);
    setWait(COOLDOWN);
  };

  if (sent) {
    return (
      <div className="space-y-5">
        <Alert tone="success">If an account exists for <b>{email.trim()}</b>, we&apos;ve sent a link to reset your password. It expires in 30 minutes.</Alert>
        {demoLink && (
          <Alert tone="info">
            <b>Demo mode:</b> no email is sent. <Link href={demoLink} className="font-semibold underline">Open your reset link</Link>.
          </Alert>
        )}
        <Button variant="secondary" size="lg" block disabled={wait > 0} loading={loading} onClick={(ev) => submit(ev as unknown as React.FormEvent)}>
          {wait > 0 ? `Resend in ${wait}s` : "Resend link"}
        </Button>
        <Button href="/login" variant="ghost" block>Back to sign in</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {error && <Alert>{error}</Alert>}
      <Field label="Work email" htmlFor="fp-email">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="fp-email" type="email" className="auth-input has-icon" autoComplete="email" autoFocus placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </Field>
      <Button type="submit" size="lg" block loading={loading}>Send reset link</Button>
      <p className="text-[12px] text-slate-500">Field team members without an email address: ask your supervisor to reset your password from the HR workspace.</p>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you use for SCOMS and we'll send you a secure link to choose a new password."
      clip="detail"
      footer={<p>Remembered it? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</Link></p>}
    >
      <Suspense fallback={<div className="h-48" />}><ForgotForm /></Suspense>
    </AuthShell>
  );
}
