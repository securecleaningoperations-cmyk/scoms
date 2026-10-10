"use client";

import Link from "next/link";
import { useState } from "react";
import Environment from "./Environment";
import { EmptyState } from "./templates";
import { detectRegion, regionName } from "@/lib/sco/geo";
import { services, industries, regions, needOptions, needToSlug } from "@/lib/sco/content";

export default function FindServices() {
  const [q, setQ] = useState("");
  const [svc, setSvc] = useState("");
  const [res, setRes] = useState<{ q: string; slug: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true); setRes(null);
    setTimeout(() => { setRes({ q, slug: detectRegion(q) }); setBusy(false); }, 650);
  };
  const region = regions.find((r) => r.slug === res?.slug);
  const picked = svc ? services.find((s) => s.slug === needToSlug[svc]) : null;

  return (
    <div>
      <form onSubmit={search} className="f-grid" style={{ alignItems: "end" }}>
        <label className="field full"><span className="field-l">ZIP, city, county, state or market</span>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. 20001, Baltimore, Fairfax" aria-label="Location" /></label>
        <label className="field"><span className="field-l">Service (optional)</span>
          <select className="select" value={svc} onChange={(e) => setSvc(e.target.value)}><option value="">Any service</option>{needOptions.map((o) => <option key={o}>{o}</option>)}</select></label>
        <div className="field"><button className="btn" type="submit" disabled={busy}>{busy ? "Searching…" : "Find Services Near You"} <span className="arr">→</span></button></div>
      </form>
      {busy && <div className="loading-bar" style={{ marginTop: 32 }} />}
      <div aria-live="polite" style={{ marginTop: 56 }}>
        {res && region && (
          <div>
            <div style={{ position: "relative", aspectRatio: "21/8", overflow: "hidden", background: "var(--ink)", color: "#fff", animation: "findIn .9s var(--ease-io)" }}>
              <Environment variant="government" style={{ ["--clean" as string]: 1 }} /><div className="shade" />
              <div style={{ position: "absolute", left: 28, bottom: 28, zIndex: 3 }}>
                <span className="badge ok">Service area</span>
                <h2 className="h-lg" style={{ marginTop: 12 }}>{region.name}</h2>
                <p style={{ opacity: 0.8, marginTop: 6 }}>Matched from “{res.q}”. We will confirm availability for your exact location.</p>
              </div>
            </div>
            <div className="two" style={{ marginTop: 48 }}>
              <div><p className="eyebrow">Available services{picked ? " · filtered" : ""}</p></div>
              <div>{(picked ? [picked] : services).map((s) => <Link key={s.slug} href={`/sco/services/${s.slug}`} className="mega-link" style={{ fontSize: "1.1rem" }}>{s.title}<span>→</span></Link>)}</div>
            </div>
            <div className="chips" style={{ marginTop: 32 }}>{industries.map((i) => <Link key={i.slug} className="chip" style={{ borderColor: "currentColor" }} href={`/sco/industries/${i.slug}`}>{i.title}</Link>)}</div>
            <div className="cta-row" style={{ marginTop: 36 }}><Link href={`/sco/request/service?location=${encodeURIComponent(res.q)}${svc ? `&service=${needToSlug[svc]}` : ""}`} className="btn">Request Service <span className="arr">→</span></Link></div>
          </div>
        )}
        {res && !region && (
          <EmptyState title="No service area found" body={`We couldn't match “${res.q}” to one of our current service areas — Pennsylvania, Maryland, Virginia or Washington, DC. Tell us about your location and we'll let you know what's possible.`} cta={{ href: `/sco/contact?location=${encodeURIComponent(res.q)}`, label: "Contact Us About Your Location" }} />
        )}
      </div>
      <style>{`@keyframes findIn { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }`}</style>
      <span hidden>{regionName(null)}</span>
    </div>
  );
}
