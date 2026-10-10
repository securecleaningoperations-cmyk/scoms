"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

export type FieldDef = {
  name: string; label: string; type?: "text" | "email" | "tel" | "date" | "select" | "textarea" | "file" | "number" | "checks";
  options?: string[]; required?: boolean; full?: boolean; placeholder?: string; min?: number;
};
export type StepDef = { title: string; blurb?: string; fields: FieldDef[] };

interface Props {
  id: string;                     // storage + endpoint key
  title: string;
  steps: StepDef[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  successNext: { href: string; label: string };
  initial?: Record<string, string>;
  /** where to POST. If the endpoint is missing/unavailable we say so honestly. */
  endpoint?: string;
  dark?: boolean;
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function MultiStepForm({ id, title, steps, submitLabel, successTitle, successBody, successNext, initial = {}, endpoint = "/api/sco/forms", dark }: Props) {
  const key = `sco_form_${id}`;
  const [i, setI] = useState(0);
  const [vals, setVals] = useState<Record<string, string>>(initial);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [saved, setSaved] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) { const p = JSON.parse(s); setVals((v) => ({ ...p.vals, ...v, ...initial })); setI(Math.min(p.i ?? 0, steps.length - 1)); setSaved(true); } } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (status === "done") return;
    const t = setTimeout(() => { try { localStorage.setItem(key, JSON.stringify({ vals, i })); } catch {} }, 400);
    return () => clearTimeout(t);
  }, [vals, i, key, status]);

  useEffect(() => {
    if (!body.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(body.current.querySelectorAll("[data-f]"), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" });
  }, [i, status]);

  const step = steps[i];
  const pct = useMemo(() => Math.round(((i + (status === "done" ? 1 : 0)) / steps.length) * 100), [i, steps.length, status]);

  const validate = (s: StepDef) => {
    const e: Record<string, string> = {};
    s.fields.forEach((f) => {
      const v = (vals[f.name] ?? "").trim();
      if (f.required && !v) e[f.name] = "This field is required.";
      else if (f.type === "email" && v && !emailOk(v)) e[f.name] = "Enter a valid email address.";
      else if (f.type === "tel" && v && v.replace(/\D/g, "").length < 7) e[f.name] = "Enter a valid phone number.";
    });
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { setI((n) => n + 1); window.scrollTo({ top: (body.current?.offsetTop ?? 0) - 120, behavior: "smooth" }); } else setTimeout(() => body.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 30); };
  const back = () => setI((n) => Math.max(0, n - 1));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(step)) return;
    setStatus("sending");
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form: id, values: vals, attachments: files }) });
      if (!res.ok) throw new Error(String(res.status));
      try { localStorage.removeItem(key); } catch {}
      setStatus("done");
    } catch { setStatus("error"); }
  };

  if (status === "done") {
    return (
      <div className="success" role="status">
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" aria-hidden="true"><circle cx="42" cy="42" r="38" stroke="currentColor" strokeWidth="2" opacity=".25" /><path d="M24 43l13 13 24-28" stroke="#1b63c4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <h2 className="h-lg">{successTitle}</h2>
        <p className="lead" style={{ margin: "20px auto 32px" }}>{successBody}</p>
        <Link href={successNext.href} className="btn">{successNext.label} <span className="arr">→</span></Link>
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="form-shell">
        <nav className="steps-rail" aria-label={`${title} steps`}>
          {steps.map((s, k) => (
            <button key={s.title} type="button" className={k === i ? "on" : k < i ? "done" : ""} onClick={() => k < i && setI(k)} disabled={k > i} aria-current={k === i ? "step" : undefined}>
              <i>{k < i ? "✓" : k + 1}</i><span>{s.title}</span>
            </button>
          ))}
        </nav>
        <form onSubmit={i === steps.length - 1 ? submit : (e) => { e.preventDefault(); next(); }} noValidate ref={body as never}>
          <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Form progress"><i style={{ width: pct + "%" }} /></div>
          {saved && i > 0 && <p className="alert" style={{ marginBottom: 28 }} data-f>Welcome back — your progress was saved on this device.</p>}
          <p className="eyebrow" data-f>Step {i + 1} of {steps.length}</p>
          <h2 className="h-md" style={{ margin: "14px 0 6px" }} data-f>{step.title}</h2>
          {step.blurb && <p style={{ opacity: 0.7, maxWidth: "52ch" }} data-f>{step.blurb}</p>}
          <div className="f-grid">
            {step.fields.map((f) => {
              const err = errs[f.name];
              const common = { id: `${id}-${f.name}`, name: f.name, "aria-invalid": !!err, "aria-describedby": err ? `${id}-${f.name}-e` : undefined, value: vals[f.name] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement>) => setVals((v) => ({ ...v, [f.name]: e.target.value })) };
              return (
                <div key={f.name} className={`field ${f.full || f.type === "textarea" || f.type === "file" || f.type === "checks" ? "full" : ""}`} data-f>
                  <label className="field-l" htmlFor={common.id}>{f.label}{f.required && " *"}</label>
                  {f.type === "select" ? (
                    <select {...common} className="select"><option value="">Select…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
                  ) : f.type === "textarea" ? (
                    <textarea {...common} className="textarea" placeholder={f.placeholder} />
                  ) : f.type === "file" ? (
                    <label className="drop" htmlFor={common.id}>
                      <input id={common.id} type="file" hidden onChange={(e) => { const fl = e.target.files?.[0]; if (fl) { if (fl.size > 10 * 1024 * 1024) setErrs((x) => ({ ...x, [f.name]: "File is larger than 10 MB. Choose a smaller file." })); else { setErrs((x) => { const { [f.name]: _, ...r } = x; void _; return r; }); setFiles((x) => ({ ...x, [f.name]: fl.name })); } } }} />
                      {files[f.name] ? <span>📎 {files[f.name]}</span> : <span>Choose a file (max 10 MB)</span>}
                    </label>
                  ) : f.type === "checks" ? (
                    <div className="chips" style={{ marginTop: 6 }}>
                      {f.options?.map((o) => {
                        const on = (vals[f.name] ?? "").split("|").includes(o);
                        return <button type="button" key={o} className={`chip ${on ? "on" : ""}`} style={{ borderColor: "currentColor" }} aria-pressed={on} onClick={() => setVals((v) => { const cur = (v[f.name] ?? "").split("|").filter(Boolean); return { ...v, [f.name]: (on ? cur.filter((c) => c !== o) : [...cur, o]).join("|") }; })}>{o}</button>;
                      })}
                    </div>
                  ) : (
                    <input {...common} className="input" type={f.type ?? "text"} placeholder={f.placeholder} min={f.min} autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined} />
                  )}
                  {err && <p className="err-msg" id={`${id}-${f.name}-e`} role="alert">{err}</p>}
                </div>
              );
            })}
          </div>
          {status === "error" && <p className="alert err" role="alert" style={{ marginTop: 28 }}>We couldn&apos;t submit this form right now. Your answers are saved on this device — please try again, or <Link href="/sco/contact" style={{ textDecoration: "underline" }}>contact us directly</Link>.</p>}
          {status === "sending" && <div className="loading-bar" style={{ marginTop: 28 }} aria-label="Submitting" />}
          <div className="form-nav">
            <button type="button" className="btn ghost" onClick={back} disabled={i === 0} style={{ opacity: i === 0 ? 0.35 : 1 }}>← Back</button>
            <button type="submit" className="btn" disabled={status === "sending"}>{i === steps.length - 1 ? (status === "sending" ? "Sending…" : submitLabel) : "Continue"} <span className="arr">→</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}
