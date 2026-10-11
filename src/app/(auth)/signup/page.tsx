"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Eye, EyeOff, Hash, Lock, Mail, User } from "lucide-react";
import AuthShell, { Alert, Field, StrengthMeter } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui";
import { useAuth, type ScomsRole } from "@/lib/auth/AuthProvider";
import { signUp } from "@/lib/auth/service";
import { EMAIL_RE, PRIVILEGED_ROLES, ROLE_LABELS, SELF_SIGNUP_ROLES, homeFor, normalizeRole, passwordIssues, passwordStrength } from "@/lib/auth/roles";

type Errors = Partial<Record<"name" | "email" | "org" | "pw" | "confirm" | "terms", string>>;

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { loginAsUser } = useAuth();

  const [orgCode, setOrgCode] = useState("");
  const [orgName, setOrgName] = useState("Secure Cleaning Operations Inc.");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<ScomsRole>("field_employee");
  const [invitedRole, setInvitedRole] = useState<ScomsRole | null>(null);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState<string | null>(null);

  // invite links: /signup?org=ORG-…&role=…&email=…&name=…
  useEffect(() => {
    const org = params.get("org"); const r = params.get("role"); const e = params.get("email"); const n = params.get("name");
    if (org) setOrgCode(org.toUpperCase());
    if (e) setEmail(e);
    if (n) setFullName(n);
    if (r) { const nr = normalizeRole(r, "field_employee"); setRole(nr); setInvitedRole(nr); }
  }, [params]);

  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const roleOptions = invitedRole && PRIVILEGED_ROLES.includes(invitedRole) ? [invitedRole] : SELF_SIGNUP_ROLES;

  const validate = (): Errors => {
    const e: Errors = {};
    if (fullName.trim().split(/\s+/).length < 2) e.name = "Enter your first and last name.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid work email address.";
    if (!/^ORG-[A-Z0-9-]{3,}$/.test(orgCode.trim())) e.org = "Use the code from your administrator, e.g. ORG-XXXX-0000.";
    const issues = passwordIssues(pw);
    if (issues.length) e.pw = `Use ${issues.join(", ")}.`;
    if (confirm !== pw) e.confirm = "Passwords don't match.";
    if (!terms) e.terms = "Please accept the terms to continue.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    const res = await signUp({ fullName, email, password: pw, role, orgCode, orgName });
    setLoading(false);
    if (!res.ok) { setFormError(res.error); return; }
    if (res.needsConfirmation) { setConfirmSent(email.trim()); return; }
    loginAsUser(res.profile, true);
    router.replace(homeFor(res.profile.role));
  };

  if (confirmSent) {
    return (
      <div className="space-y-5">
        <Alert tone="success">We sent a confirmation link to <b>{confirmSent}</b>. Open it to activate your account, then sign in.</Alert>
        <Button href="/login" size="lg" block>Go to sign in</Button>
        <p className="text-[12px] text-slate-500">Didn&apos;t get it? Check spam, or wait a minute and try registering again.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {formError && <Alert>{formError}</Alert>}
      {invitedRole && <Alert tone="info">You&apos;re joining by invitation as <b>{ROLE_LABELS[invitedRole]}</b>.</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.2fr]">
        <Field label="Organization code" htmlFor="su-org" error={errors.org}>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="su-org" className="auth-input has-icon font-mono uppercase" placeholder="ORG-XXXX-0000" value={orgCode}
              onChange={(e) => setOrgCode(e.target.value.toUpperCase())} aria-invalid={!!errors.org} readOnly={!!params.get("org")} />
          </div>
        </Field>
        <Field label="Organization name" htmlFor="su-orgname">
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="su-orgname" className="auth-input has-icon" value={orgName} onChange={(e) => setOrgName(e.target.value)} autoComplete="organization" />
          </div>
        </Field>
      </div>

      <Field label="Full name" htmlFor="su-name" error={errors.name}>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="su-name" className="auth-input has-icon" placeholder="First and last name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
        </div>
      </Field>

      <Field label="Work email" htmlFor="su-email" error={errors.email}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="su-email" type="email" className="auth-input has-icon" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
        </div>
      </Field>

      <Field label="Role" htmlFor="su-role" hint={invitedRole && PRIVILEGED_ROLES.includes(invitedRole) ? "Set by your invitation." : "Administrative and finance roles are assigned by invitation only."}>
        <select id="su-role" className="auth-input" value={role} onChange={(e) => setRole(e.target.value as ScomsRole)} disabled={roleOptions.length === 1}>
          {roleOptions.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </Field>

      <Field label="Password" htmlFor="su-pw" error={errors.pw}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input id="su-pw" type={show ? "text" : "password"} className="auth-input has-icon has-trail" placeholder="At least 8 characters, with a number" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" aria-invalid={!!errors.pw} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {pw && !errors.pw && <StrengthMeter score={strength} />}
      </Field>

      <Field label="Confirm password" htmlFor="su-confirm" error={errors.confirm}>
        <input id="su-confirm" type={show ? "text" : "password"} className="auth-input" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" aria-invalid={!!errors.confirm} />
      </Field>

      <div>
        <label className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-700">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600" aria-invalid={!!errors.terms} />
          <span>I agree to the <Link href="/sco/legal/terms" className="font-semibold text-blue-600 hover:underline">Terms</Link> and <Link href="/sco/legal/privacy" className="font-semibold text-blue-600 hover:underline">Privacy Policy</Link>.</span>
        </label>
        {errors.terms && <p className="auth-err" role="alert">{errors.terms}</p>}
      </div>

      <Button type="submit" size="lg" block loading={loading}>Create account</Button>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join your organization's SCOMS workspace using the code from your administrator or an invitation link."
      clip="facility"
      panelTitle={<>Every site.<br />Every shift.<br />One standard.</>}
      footer={<p>Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link></p>}
    >
      <Suspense fallback={<div className="h-96" />}><SignUpForm /></Suspense>
    </AuthShell>
  );
}
