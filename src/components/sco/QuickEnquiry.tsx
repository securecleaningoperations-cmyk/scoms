"use client";

import Link from "next/link";
import { useState } from "react";
import { useScene } from "./motion";
import { services } from "@/lib/sco/content";

type Status = "idle" | "sending" | "done" | "error";

export default function QuickEnquiry() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 72%" } });
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(fd.entries()) as Record<string, string>;
    if (!values.name || !values.email || !values.organization) { setErr("Please add your name, organization and business email."); return; }
    setErr(""); setStatus("sending");
    try {
      const res = await fetch("/api/sco/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ form: "quick", values }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setMsg(json.next);
      setStatus("done");
    } catch (x) {
      setErr(x instanceof Error ? x.message : "We couldn't send this right now.");
      setStatus("error");
    }
  };

  return (
    <section ref={ref} className="section" id="enquire" aria-labelledby="qe-h" style={{ background: "var(--paper2)" }}>
      <div className="wrap two">
        <div>
          <p className="eyebrow" data-in>Start a conversation</p>
          <h2 id="qe-h" className="h-lg" style={{ marginTop: 18 }} data-in>Tell us about your <em>facility.</em></h2>
          <p className="lead" style={{ marginTop: 22 }} data-in>Share a few details and we&apos;ll follow up to schedule a walkthrough. For a detailed scope, use the full proposal request.</p>
          <ul className="cap-list" style={{ gridTemplateColumns: "1fr", marginTop: 30, maxWidth: 420 }} data-in>
            <li>Office hours: Monday – Friday, 10:00 AM – 5:30 PM</li>
            <li>Serving Pennsylvania, Maryland, Virginia and Washington, DC</li>
          </ul>
          <div className="cta-row" style={{ marginTop: 28 }} data-in>
            <Link href="/sco/request/proposal" className="tlink">Request a full proposal ↗</Link>
            <Link href="/sco/contact" className="tlink">Other ways to contact us ↗</Link>
          </div>
        </div>

        <div data-in>
          {status === "done" ? (
            <div className="success" role="status" style={{ textAlign: "left", padding: "20px 0" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ margin: "0 0 24px" }}><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" opacity=".3" /><path d="M7 12.5l3.2 3.2L17 9" stroke="var(--blue)" strokeWidth="1.6" /></svg>
              <h3 className="h-md">Thank you — your enquiry was received.</h3>
              <p className="ai-note" style={{ marginTop: 22 }}><b>Next step</b>{msg}</p>
              <button className="btn" style={{ marginTop: 28 }} onClick={() => setStatus("idle")}>Send another <span className="arr">→</span></button>
            </div>
          ) : (
            <form className="qform" onSubmit={submit} noValidate>
              <label className="field"><span className="field-l">Full name *</span><input className="input" name="name" autoComplete="name" required /></label>
              <label className="field"><span className="field-l">Organization *</span><input className="input" name="organization" autoComplete="organization" required /></label>
              <label className="field"><span className="field-l">Business email *</span><input className="input" name="email" type="email" autoComplete="email" required /></label>
              <label className="field"><span className="field-l">Phone</span><input className="input" name="phone" type="tel" autoComplete="tel" /></label>
              <label className="field"><span className="field-l">Service</span>
                <select className="select" name="service" defaultValue="">
                  <option value="">Select a service</option>
                  {services.map((s) => <option key={s.slug}>{s.title}</option>)}
                </select>
              </label>
              <label className="field"><span className="field-l">Location (city, ZIP or state)</span><input className="input" name="location" /></label>
              <label className="field full"><span className="field-l">What do you need?</span><textarea className="textarea" name="message" placeholder="Facility type, size, frequency, timing…" /></label>
              {/* honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }} />
              {err && <p className="alert err full" role="alert" style={{ marginTop: 24 }}>{err}</p>}
              <div className="full" style={{ marginTop: 36, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <button type="submit" className="btn" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send enquiry"} <span className="arr">→</span></button>
                <small style={{ opacity: .6, fontSize: 12.5, maxWidth: "40ch" }}>Messages are routed automatically to the right team and reviewed by a person.</small>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
