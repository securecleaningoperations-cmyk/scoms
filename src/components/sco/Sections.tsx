"use client";

import Link from "next/link";
import Environment from "./Environment";
import { useScene } from "./motion";
import { services, regions, COMPANY } from "@/lib/sco/content";

export function Services() {
  const ref = useScene<HTMLElement>(({ gsap, root, small, reduce }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    const track = root.querySelector<HTMLElement>(".hscroll")!;
    const bar = root.querySelector<HTMLElement>(".hs-bar i")!;
    if (reduce || small) {
      // touch-friendly native horizontal scroller
      track.parentElement!.style.overflowX = "auto";
      track.parentElement!.style.scrollSnapType = "x mandatory";
      Array.from(track.children).forEach((c) => ((c as HTMLElement).style.scrollSnapAlign = "start"));
      return;
    }
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: root.querySelector(".svc-pin"), start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) } });
  });
  return (
    <section ref={ref} className="svc" aria-labelledby="svc-h">
      <div className="svc-pin" style={{ paddingBlock: "calc(var(--hdr) + 14px) 24px", height: "100svh", minHeight: 600, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="wrap svc-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow" data-in>Services</p>
            <h2 id="svc-h" className="h-lg" style={{ marginTop: 18, maxWidth: "15ch" }} data-in>Thirteen service lines. <em>One standard.</em></h2>
          </div>
          <Link href="/sco/services" className="btn" data-in>All Services <span className="arr">→</span></Link>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="hscroll">
            {services.map((s, i) => (
              <Link key={s.slug} href={`/sco/services/${s.slug}`} className="svc-c" data-cursor="Explore">
                <Environment variant={s.scene} style={{ ["--clean" as string]: 0.92 }} />
                <div className="shade" />
                <span className="svc-n">{String(i + 1).padStart(2, "0")} / {services.length}</span>
                <div className="svc-b"><h3>{s.title}</h3><p>{s.short}</p></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="hs-bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

const ledger = [
  ["01", "Assigned", "People deployed to a defined scope"],
  ["02", "Performed", "Services executed to the standard"],
  ["03", "Inspected", "Quality checked before completion"],
  ["04", "Documented", "Appropriate records retained"],
  ["05", "Reviewed", "Performance monitored and improved"],
];

export function Accountability() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.from(root.querySelectorAll(".ledger-row"), { clipPath: "inset(0 100% 0 0)", x: -20, duration: 1, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".ledger", start: "top 80%" } });
  });
  return (
    <section ref={ref} className="section acc" aria-labelledby="acc-h">
      <div className="wrap acc-grid">
        <div>
          <p className="eyebrow" data-in>Accountability</p>
          <h2 id="acc-h" className="big-quote" style={{ marginTop: 22 }} data-in>More than cleaning. A more <em>accountable</em> standard.</h2>
          <p className="lead" style={{ marginTop: 26 }} data-in>Every engagement is built on clear scope, visible assignment, inspection and documentation — not on promises.</p>
          <div style={{ marginTop: 30 }} data-in><Link href="/sco/about/standards" className="tlink">Our Standards ↗</Link></div>
        </div>
        <div className="ledger" data-in>
          {ledger.map(([n, t, d]) => (
            <div className="ledger-row" key={n}><span className="n">{n}</span><div><h4>{t}</h4><p style={{ opacity: 0.65, fontSize: ".92rem", marginTop: 4 }}>{d}</p></div><small>Standard</small></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Critical() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    const words = root.querySelectorAll<HTMLElement>("[data-cw]");
    gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.06, ease: "none", scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: 0.4 } });
  });
  const text = "SCO operates where reliability, consistency and accountability matter — in facilities that cannot afford to be anything less than ready.";
  return (
    <section ref={ref} className="section dark" aria-label="Critical environments" style={{ background: "#0a1824" }}>
      <div className="wrap">
        <p className="eyebrow">Critical Environments</p>
        <p className="h-lg" style={{ marginTop: 28, fontFamily: "var(--f-display)", maxWidth: "24ch", lineHeight: 1.08 }}>
          {text.split(" ").map((w, i) => <span key={i} data-cw style={{ display: "inline-block", marginRight: ".26em" }}>{w}</span>)}
        </p>
      </div>
    </section>
  );
}

export function Locations() {
  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.from(root.querySelectorAll(".loc-row"), { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".loc-list", start: "top 80%" } });
  });
  return (
    <section ref={ref} className="section loc" aria-labelledby="loc-h">
      <div className="wrap">
        <p className="eyebrow" data-in>Locations</p>
        <h2 id="loc-h" className="h-lg" style={{ marginTop: 18 }} data-in>Serving the <em>Mid-Atlantic.</em></h2>
        <div className="loc-list">
          {regions.map((r) => (
            <Link key={r.slug} href={`/sco/locations/${r.slug}`} className="loc-row" data-cursor="View">
              <span className="abbr">{r.short}</span><h3>{r.name}</h3><span className="tlink">View service area →</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 36 }} data-in><Link href="/sco/find-services" className="btn">Find Your Service Area <span className="arr">→</span></Link></div>
      </div>
    </section>
  );
}

const gov = [
  ["Government Services", "Structured, documented facility service."], ["Procurement", "Information for procurement teams."], ["Contract Support", "Scope, schedule and standards, defined clearly."],
  ["Capability Information", "Request our capability information."], ["Vendor Information", "Vendor details for onboarding."], ["Compliance", "Documented processes and standards."],
];
export function Government() {
  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.from(root.querySelectorAll(".gov-c"), { autoAlpha: 0, y: 30, stagger: 0.08, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".gov-grid", start: "top 80%" } });
  });
  const slug = ["", "procurement", "contract-support", "capability", "vendor-information", "compliance"];
  return (
    <section ref={ref} className="section dark" aria-labelledby="gov-h" style={{ background: "#0c1b2a" }}>
      <div className="wrap">
        <p className="eyebrow" data-in>Government & Procurement</p>
        <h2 id="gov-h" className="h-lg" style={{ marginTop: 18, maxWidth: "16ch" }} data-in>A professional entry point for <em>procurement.</em></h2>
        <div className="gov-grid">
          {gov.map(([t, d], i) => (
            <Link key={t} href={`/sco/government${slug[i] ? "/" + slug[i] : ""}`} className="gov-c"><span className="n">{String(i + 1).padStart(2, "0")}</span><div><h3>{t}</h3><p>{d}</p></div></Link>
          ))}
        </div>
        <div className="cta-row" style={{ marginTop: 36 }} data-in>
          <Link href="/sco/government/capability" className="btn light">Request Our Capability Information <span className="arr">→</span></Link>
        </div>
      </div>
    </section>
  );
}

export function CareersBand() {
  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.fromTo(root.querySelector(".careers-vis .env"), { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: "none", scrollTrigger: { trigger: root, scrub: true } });
  });
  return (
    <section ref={ref} className="section" aria-labelledby="car-h">
      <div className="wrap careers-band">
        <div>
          <p className="eyebrow" data-in>Careers</p>
          <h2 id="car-h" className="h-lg" style={{ margin: "18px 0 22px" }} data-in>Join <em>Secure Cleaning Operations.</em></h2>
          <p className="lead" data-in>Build a career in facility services with defined roles, real equipment and a team that values accountability.</p>
          <div className="cta-row" style={{ marginTop: 30 }} data-in>
            <Link href="/sco/careers/positions" className="btn">View Open Positions <span className="arr">→</span></Link>
            <Link href="/sco/careers/apply" className="tlink">Start an application</Link>
          </div>
        </div>
        <div className="careers-vis" data-in><Environment variant="education" style={{ ["--clean" as string]: 0.95 }} /><div className="shade" /></div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 65%" } });
    gsap.fromTo(root.querySelector(".env"), { "--clean": 0.2 }, { "--clean": 1, ease: "none", scrollTrigger: { trigger: root, start: "top 80%", end: "center 40%", scrub: 0.6 } });
  });
  return (
    <section ref={ref} className="final dark" aria-labelledby="fin-h">
      <Environment variant="hospitality" />
      <div className="shade" /><div className="vignette" />
      <div className="wrap">
        <p className="eyebrow" data-in>{COMPANY.inc}</p>
        <h2 id="fin-h" style={{ margin: "22px 0 34px" }} data-in>Let&apos;s build the right cleaning &amp; facility <em>solution</em> for your organization.</h2>
        <div className="cta-row" data-in>
          <Link href="/sco/request/consultation" className="btn light" data-cursor="Go">Request a Consultation <span className="arr">→</span></Link>
          <Link href="/sco/request/proposal" className="btn ghost">Request a Proposal</Link>
        </div>
        <p className="eyebrow" style={{ marginTop: 56 }} data-in>People • Process • Quality • Technology • Accountability</p>
      </div>
    </section>
  );
}
