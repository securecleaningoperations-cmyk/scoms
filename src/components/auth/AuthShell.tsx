"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { clips, type ClipKey } from "@/lib/sco/media";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** footage shown on the brand panel */
  clip?: ClipKey;
  /** headline on the brand panel */
  panelTitle?: React.ReactNode;
  panelBody?: string;
}

/** Split-screen auth layout: branded cinematic panel (desktop) + focused form column. */
export default function AuthShell({ title, subtitle, children, footer, clip = "team", panelTitle, panelBody }: Props) {
  const c = clips[clip];
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(max-width: 1023px)").matches) return;
    v.src = c.srcSm;
    v.play().catch(() => {});
  }, [c]);

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white text-slate-900">
      {/* Brand panel */}
      <aside className="relative hidden lg:block overflow-hidden bg-slate-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <video ref={vid} muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="inline-flex items-center gap-3 w-fit">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur"><ShieldCheck className="h-5 w-5" /></span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">Secure Cleaning Operations</span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-white/60">SCOMS Platform</span>
            </span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-[34px] xl:text-[40px] font-semibold leading-[1.08] tracking-tight">
              {panelTitle ?? <>One platform for every<br />site, shift and standard.</>}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/75">
              {panelBody ?? "Operations, workforce, quality, finance and client service for Secure Cleaning Operations Inc. — in one secure workspace."}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-white/60">
              <span>Role-based access</span><span>Audit-logged actions</span><span>Mon–Fri · 10:00–5:30</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> SCO</Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 border-t border-slate-200 pt-6 text-[13px] text-slate-600">{footer}</div>}
          </div>
        </div>
        <footer className="px-5 pb-6 sm:px-8 text-[11px] text-slate-400 flex flex-wrap gap-x-5 gap-y-1">
          <span>© {new Date().getFullYear()} Secure Cleaning Operations Inc.</span>
          <Link href="/sco/legal/privacy" className="hover:text-slate-600">Privacy</Link>
          <Link href="/sco/legal/terms" className="hover:text-slate-600">Terms</Link>
        </footer>
      </main>
    </div>
  );
}

/* ── small form primitives shared by auth pages ── */

export function Field({ label, htmlFor, error, hint, trailing, children }: { label: string; htmlFor: string; error?: string | null; hint?: React.ReactNode; trailing?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="auth-label">{label}</label>
        {trailing}
      </div>
      {children}
      {error ? <p id={`${htmlFor}-err`} className="auth-err" role="alert">{error}</p> : hint ? <p className="auth-hint">{hint}</p> : null}
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: React.ReactNode }) {
  const t = tone === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-200 bg-blue-50 text-blue-900";
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-[13px] leading-relaxed ${t}`}>{children}</div>;
}

export function StrengthMeter({ score }: { score: 0 | 1 | 2 | 3 | 4 }) {
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-slate-200", "bg-rose-500", "bg-amber-500", "bg-blue-600", "bg-emerald-600"];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1 rounded-full ${score >= i ? colors[score] : "bg-slate-200"}`} />)}</div>
      <p className="auth-hint">Password strength: <b className="font-semibold text-slate-700">{labels[score]}</b></p>
    </div>
  );
}
