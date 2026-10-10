"use client";

import Link from "next/link";
import { useState } from "react";
import Environment from "./Environment";
import { useScene } from "./motion";
import { needOptions, needToSlug, services } from "@/lib/sco/content";
import { detectRegion, regionName } from "@/lib/sco/geo";

export default function Discovery() {
  const [need, setNeed] = useState<string>("Commercial Cleaning");
  const [loc, setLoc] = useState("");
  const [shown, setShown] = useState<{ need: string; loc: string } | null>(null);
  const [wipe, setWipe] = useState(0);

  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
  });

  const svc = services.find((s) => s.slug === needToSlug[shown?.need ?? need])!;
  const region = shown ? detectRegion(shown.loc) : null;

  const explore = (e: React.FormEvent) => {
    e.preventDefault();
    setShown({ need, loc });
    setWipe((n) => n + 1);
  };

  return (
    <section ref={ref} className="section disc" aria-labelledby="disc-h">
      <div className="wrap">
        <p className="eyebrow" data-in>Facility Need Discovery</p>
        <h2 id="disc-h" className="h-lg" style={{ marginTop: 18 }} data-in>What does your <em>facility</em> need?</h2>
        <div className="disc-grid">
          <form onSubmit={explore} data-in>
            <div className="need-list" role="group" aria-label="Choose a service need">
              {needOptions.map((n) => (
                <button type="button" key={n} className="need" aria-pressed={need === n} onClick={() => setNeed(n)}>{n}</button>
              ))}
            </div>
            <label className="field">
              <span className="field-l">Facility location (ZIP, city, county or state)</span>
              <input className="input" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. 21201 or Richmond" autoComplete="postal-code" />
            </label>
            <div style={{ marginTop: 36 }}><button className="btn" type="submit">Explore Solutions <span className="arr">→</span></button></div>
          </form>

          <div className="disc-result" data-in aria-live="polite">
            <div key={wipe} style={{ position: "absolute", inset: 0, animation: wipe ? "discWipe 1.1s var(--ease-io)" : undefined }}>
              <Environment variant={svc.scene} style={{ ["--clean" as string]: shown ? 1 : 0.35 }} />
            </div>
            <div className="shade" />
            <div className="res-body">
              <span className="eyebrow">{shown ? "Recommended starting point" : "Select a need"}</span>
              <h3>{svc.title}</h3>
              <p style={{ opacity: 0.85, maxWidth: "46ch", marginBottom: 18 }}>{svc.short}</p>
              {shown && shown.loc.trim() && (
                <p style={{ marginBottom: 18 }}>
                  {region ? <span className="region-pill">● {regionName(region)} service area</span> : <span className="region-pill">○ Location not yet matched — we will confirm</span>}
                </p>
              )}
              <div className="cta-row">
                <Link href={`/sco/services/${svc.slug}`} className="btn light">View {svc.title} <span className="arr">→</span></Link>
                <Link href={`/sco/request/consultation?service=${svc.slug}${shown?.loc ? `&location=${encodeURIComponent(shown.loc)}` : ""}`} className="tlink">Request a Consultation</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes discWipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }`}</style>
    </section>
  );
}
