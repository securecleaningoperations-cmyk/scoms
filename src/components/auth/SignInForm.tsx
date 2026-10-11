"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, Mail, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { DEMO_ACCOUNTS, authMode, safeNext, signIn } from "@/lib/auth/service";
import { ROLE_LABELS, homeFor, workspaceFor, type Workspace } from "@/lib/auth/roles";
import { Button } from "@/components/ui";
import { Alert, Field } from "./AuthShell";

interface Props {
  /** Restrict which workspace this surface signs into (portal / field app). */
  expect?: Workspace;
}

export default function SignInForm({ expect }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { loginAsUser } = useAuth();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState<"id" | "pw" | null>(null);
  const [mode, setMode] = useState<ReturnType<typeof authMode>>("demo");
  const pwRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMode(authMode()), []);
  const notice = params.get("verified") ? "Email confirmed — you can sign in now."
    : params.get("reset") ? "Password updated. Sign in with your new password."
    : params.get("signedout") ? "You have been signed out."
    : params.get("next") ? "Please sign in to continue." : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setField(null);
    if (!id.trim()) { setField("id"); setError("Enter your work email or Employee ID."); return; }
    if (!pw) { setField("pw"); setError("Enter your password."); pwRef.current?.focus(); return; }
    setLoading(true);
    const res = await signIn(id, pw);
    if (!res.ok) {
      setLoading(false);
      setError(res.error);
      setField(res.code === "not_found" ? "id" : res.code === "bad_password" ? "pw" : null);
      return;
    }
    const ws = workspaceFor(res.profile.role);
    if (expect && ws !== expect) {
      setLoading(false);
      const where = ws === "client" ? "/portal/login" : ws === "field" ? "/employee/login" : "/login";
      setError(`This account is a ${ROLE_LABELS[res.profile.role]} account. Use the ${ws === "client" ? "Client Portal" : ws === "field" ? "Field Team" : "Corporate"} sign-in instead.`);
      router.prefetch(where);
      return;
    }
    loginAsUser(res.profile, remember);
    const next = safeNext(params.get("next"));
    router.replace(next && next.startsWith(homeFor(res.profile.role).split("/").slice(0, 2).join("/")) ? next : homeFor(res.profile.role));
  };

  const demos = DEMO_ACCOUNTS.filter((d) => !expect || workspaceFor(d.role) === expect);

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {notice && !error && <Alert tone={params.get("next") ? "info" : "success"}>{notice}</Alert>}
      {error && <Alert>{error}</Alert>}
      {mode === "unavailable" && <Alert tone="info">Sign-in isn&apos;t configured for this environment. Contact your administrator.</Alert>}

      <Field label="Work email or Employee ID" htmlFor="si-id" error={field === "id" ? " " : null}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="si-id" className="auth-input has-icon" autoComplete="username" inputMode="email" autoFocus
            placeholder="name@company.com or EMP-0000" value={id} onChange={(e) => setId(e.target.value)}
            aria-invalid={field === "id"} />
        </div>
      </Field>

      <Field label="Password" htmlFor="si-pw" error={field === "pw" ? " " : null}
        trailing={<Link href={`/forgot-password${id.includes("@") ? `?email=${encodeURIComponent(id.trim())}` : ""}`} className="text-[12px] font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>}>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input ref={pwRef} id="si-pw" className="auth-input has-icon has-trail" type={show ? "text" : "password"} autoComplete="current-password"
            placeholder="Enter your password" value={pw} onChange={(e) => setPw(e.target.value)} aria-invalid={field === "pw"} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <label className="flex items-center gap-2.5 text-[13px] text-slate-700 select-none">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
        Keep me signed in on this device
      </label>

      <Button type="submit" size="lg" block loading={loading} disabled={mode === "unavailable"}>Sign in</Button>

      {mode === "demo" && demos.length > 0 && (
        <details className="group rounded-lg border border-slate-200 bg-slate-50/70">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[13px] font-semibold text-slate-700">
            Demo accounts
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-slate-200 p-2">
            {demos.map((d) => (
              <button type="button" key={d.email} onClick={() => { setId(d.email); setPw(d.password); setError(null); setField(null); }}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left hover:bg-white">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-slate-800">{ROLE_LABELS[d.role]}</span>
                  <span className="block truncate font-mono text-[11px] text-slate-500">{d.email}</span>
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-blue-600">Use</span>
              </button>
            ))}
            <p className="px-3 pb-1 pt-2 text-[11px] text-slate-500">Demo mode only — disabled when Supabase is configured with NEXT_PUBLIC_DEMO_MODE=false.</p>
          </div>
        </details>
      )}
    </form>
  );
}
