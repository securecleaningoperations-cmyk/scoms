"use client";

import Link from "next/link";
import { useState } from "react";
import Environment from "./Environment";
import { useScene } from "./motion";
import type { SceneVariant } from "@/lib/sco/content";

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (i === items.length - 1 || !c.href ? <span key={i} aria-current={i === items.length - 1 ? "page" : undefined}>{c.label}</span> : <span key={i}><Link href={c.href}>{c.label}</Link></span>))}
    </nav>
  );
}

export function PageHero({ crumbs, eyebrow, title, lead, scene = "office", cta, cta2, clean = 0.9 }: {
  crumbs: { label: string; href?: string }[]; eyebrow?: string; title: React.ReactNode; lead?: string; scene?: SceneVariant;
  cta?: { href: string; label: string }; cta2?: { href: string; label: string }; clean?: number;
}) {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.from(root.querySelectorAll("[data-in]"), { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.09, ease: "expo.out", delay: 0.5 });
    gsap.fromTo(root.querySelector(".env"), { scale: 1.12 }, { scale: 1.02, duration: 2.2, ease: "expo.out" });
    gsap.to(root.querySelector(".env"), { yPercent: 10, ease: "none", scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } });
  });
  return (
    <section ref={ref} className="phero dark">
      <Environment variant={scene} style={{ ["--clean" as string]: clean }} />
      <div className="shade" /><div className="vignette" />
      <div className="wrap">
        <div data-in><Crumbs items={crumbs} /></div>
        {eyebrow && <p className="eyebrow" data-in>{eyebrow}</p>}
        <h1 style={{ marginTop: 20 }} data-in>{title}</h1>
        {lead && <p className="lead" style={{ marginTop: 24 }} data-in>{lead}</p>}
        {(cta || cta2) && (
          <div className="cta-row" style={{ marginTop: 34 }} data-in>
            {cta && <Link href={cta.href} className="btn light">{cta.label} <span className="arr">→</span></Link>}
            {cta2 && <Link href={cta2.href} className="btn ghost">{cta2.label}</Link>}
          </div>
        )}
      </div>
    </section>
  );
}

export function Reveal({ children, className = "", as: Tag = "div", style }: { children: React.ReactNode; className?: string; as?: "div" | "section"; style?: React.CSSProperties }) {
  const ref = useScene<HTMLDivElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 78%" } });
  });
  const T = Tag as "div";
  return <T ref={ref} className={className} style={style}>{children}</T>;
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {items.map((it, i) => (
        <div className="acc-i" key={it.q}>
          <button className="acc-q" aria-expanded={open === i} aria-controls={`acc-${i}`} onClick={() => setOpen(open === i ? null : i)}><span>{it.q}</span><i>+</i></button>
          <div id={`acc-${i}`} className={`acc-a ${open === i ? "on" : ""}`} role="region"><div><p>{it.a}</p></div></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div style={{ padding: "64px 0", textAlign: "center" }}>
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: "0 auto 22px", opacity: 0.55 }} aria-hidden="true"><rect x="10" y="14" width="44" height="36" stroke="currentColor" strokeWidth="1.5" /><path d="M10 24h44M22 38h20" stroke="currentColor" strokeWidth="1.5" /></svg>
      <h3 className="h-md">{title}</h3>
      <p style={{ opacity: 0.7, maxWidth: "46ch", margin: "12px auto 24px" }}>{body}</p>
      {cta && <Link href={cta.href} className="btn">{cta.label} <span className="arr">→</span></Link>}
    </div>
  );
}

export function CtaBand({ title, label = "Request a Consultation", href = "/sco/request/consultation" }: { title?: string; label?: string; href?: string }) {
  return (
    <Reveal className="section dark" as="section">
      <div className="wrap" style={{ display: "flex", justifyContent: "space-between", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
        <h2 className="h-lg" style={{ maxWidth: "18ch" }} data-in>{title ?? "Ready to talk about your facility?"}</h2>
        <div className="cta-row" data-in><Link href={href} className="btn light" data-cursor="Go">{label} <span className="arr">→</span></Link></div>
      </div>
    </Reveal>
  );
}
