"use client";

import Link from "next/link";
import CineVideo from "./CineVideo";
import { useScene } from "./motion";
import { clips, type Clip } from "@/lib/sco/media";
import { COMPANY } from "@/lib/sco/content";

/* ─────────────────────────────── 1. Statement ─────────────────────────────── */
export function Statement() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.fromTo(root.querySelectorAll("[data-sw]"), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.05, ease: "none",
      scrollTrigger: { trigger: root.querySelector(".big"), start: "top 78%", end: "bottom 45%", scrub: 0.4 },
    });
    gsap.from(root.querySelectorAll(".stmt-meta > div"), {
      y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: root.querySelector(".stmt-meta"), start: "top 85%" },
    });
  });
  const text = "We clean the facilities organizations depend on — and we prove it. Every visit is assigned, performed to scope, inspected and documented.";
  return (
    <section ref={ref} className="stmt" aria-labelledby="stmt-h">
      <div className="wrap">
        <div className="stmt-grid">
          <p className="eyebrow" id="stmt-h">Who we are</p>
          <div>
            <p className="big">{text.split(" ").map((w, i) => <span key={i} data-sw>{w}</span>)}</p>
            <div className="stmt-meta">
              <div><h4>Defined scope</h4><p>Tasks, frequency and standards agreed with you before the first shift.</p></div>
              <div><h4>Trained people</h4><p>Uniformed teams using professional equipment and consistent methods.</p></div>
              <div><h4>Verified results</h4><p>Inspections and service records you can review — not just promises.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. Reel: pinned multi-clip scene ───────────────────────── */
const REEL: { clip: Clip; label: string; title: React.ReactNode; body: string; focus?: string }[] = [
  { clip: clips.team, label: "Coordinated teams", title: <>A crew that works <em>as one.</em></>, body: "Assigned roles, consistent methods and professional equipment — so every area of the floor is covered in the right order.", focus: "60% 50%" },
  { clip: clips.floor, label: "Floor care", title: <>Floors that <em>reflect</em> the standard.</>, body: "Auto-scrubbing, burnishing and finish care for lobbies, concourses and high-traffic floors.", focus: "50% 60%" },
  { clip: clips.facility, label: "Large facilities", title: <>Scaled for <em>whole buildings.</em></>, body: "Corridors, common areas and multi-floor portfolios maintained to one documented standard.", focus: "50% 50%" },
];

export function Reel() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce, small }) => {
    if (reduce || small) return;
    const frames = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".reel-frame"));
    const copies = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".reel-copy > div"));
    const idx = root.querySelectorAll(".reel-idx span");
    const bar = root.querySelector(".reel-bar i");

    gsap.set(frames.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(copies.slice(1), { autoAlpha: 0, y: 40 });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7,
        onUpdate: (s) => {
          const active = Math.min(frames.length - 1, Math.floor(s.progress * frames.length * 0.999));
          idx.forEach((el, i) => el.classList.toggle("on", i === active));
        },
      },
    });
    tl.to(bar, { scaleX: 1, duration: frames.length }, 0);
    frames.forEach((f, i) => {
      // slow push on every frame for the whole time it is visible
      tl.fromTo(f.querySelector(".cine"), { scale: 1.12, rotateY: i % 2 ? 4 : -4 }, { scale: 1, rotateY: 0, duration: 1.4 }, Math.max(0, i - 0.4));
      if (i === 0) return;
      const at = i - 0.35;
      tl.to(f, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "power2.inOut" }, at)
        .to(frames[i - 1].querySelector(".cine"), { yPercent: -10, duration: 0.55, ease: "power2.inOut" }, at)
        .to(copies[i - 1], { autoAlpha: 0, y: -40, duration: 0.18 }, at - 0.05)
        .to(copies[i], { autoAlpha: 1, y: 0, duration: 0.3 }, at + 0.28);
    });
  });

  return (
    <section ref={ref} className="reel" aria-label="How we work">
      <div className="reel-stage">
        {REEL.map((r, i) => (
          <div className="reel-frame" key={r.label} style={{ zIndex: i + 1 }}>
            <CineVideo clip={r.clip} focus={r.focus} />
            <div className="shade-l" />
            <div className="grain" />
          </div>
        ))}
        <div className="reel-copy">
          {REEL.map((r) => (
            <div key={r.label}>
              <p className="eyebrow">{r.label}</p>
              <h2 style={{ marginTop: 16 }}>{r.title}</h2>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
        <div className="reel-idx" aria-hidden="true">
          {REEL.map((r, i) => <span key={r.label} className={i === 0 ? "on" : ""}>{String(i + 1).padStart(2, "0")} {r.label}</span>)}
        </div>
        <div className="reel-bar" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}

/* ──────────────────── 3. Detail: footage expands out of a window ──────────────────── */
export function Detail() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce, small }) => {
    if (reduce || small) return;
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 } });
    tl.fromTo(".dtl-win", { clipPath: "inset(24% 32% 24% 32%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 0)
      .fromTo(".dtl-win .cine", { scale: 1.3 }, { scale: 1, duration: 1.2 }, 0)
      .to(".dtl-head", { autoAlpha: 0, duration: 0.3 }, 0.5)
      .to(".dtl-tint", { opacity: 1, duration: 0.4 }, 0.6)
      .fromTo(".dtl-copy > *", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.4 }, 0.75);
  });
  return (
    <section ref={ref} className="dtl" aria-labelledby="dtl-h">
      <div className="dtl-stage">
        <div className="dtl-head"><span>Attention to detail</span><span>Surface care · High-touch points</span></div>
        <div className="dtl-win"><CineVideo clip={clips.detail} focus="40% 50%" /></div>
        <div className="dtl-tint" />
        <div className="dtl-copy">
          <h2 id="dtl-h">The difference is in the <em>finish.</em></h2>
          <div>
            <p>Correct cloths, correct products, correct technique. High-touch points, desks and shared surfaces are cleaned methodically — the kind of care that is noticed when it is missing.</p>
            <div style={{ marginTop: 22 }}><Link href="/sco/about/standards" className="tlink">How we define the standard ↗</Link></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── 4. Standards ───────────────────────────── */
const STANDARDS = [
  ["01", "Scope before service", "Every program starts with a walkthrough, a written scope and an agreed frequency — so expectations are clear on both sides."],
  ["02", "Assigned, not anonymous", "Teams and supervisors are assigned to your site, using checklists matched to each area of the facility."],
  ["03", "Inspected before complete", "Work is checked against the scope. Issues are corrected and recorded, not left for the next visit."],
  ["04", "Documented and reviewable", "Service and inspection records are retained so facility managers can see what was done and when."],
  ["05", "Safety-conscious by default", "Appropriate PPE, labelled products and procedures that respect occupants, equipment and sensitive areas."],
];
export function Standards() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 72%" } });
    root.querySelectorAll(".std-row").forEach((row) => {
      gsap.from(row.children, { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 88%" } });
    });
  });
  return (
    <section ref={ref} className="section std" aria-labelledby="std-h">
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 32, flexWrap: "wrap", alignItems: "end", marginBottom: 56 }}>
          <div>
            <p className="eyebrow" data-in>Operating standards</p>
            <h2 id="std-h" className="h-lg" style={{ marginTop: 18, maxWidth: "14ch" }} data-in>Five commitments behind <em>every visit.</em></h2>
          </div>
          <Link href="/sco/about/safety-quality" className="btn" data-in>Safety &amp; Quality <span className="arr">→</span></Link>
        </div>
        {STANDARDS.map(([n, t, d]) => (
          <div className="std-row" key={n}><span className="n">{n}</span><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────── 5. Closing ───────────────────────────── */
export function Closing() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    if (reduce) return;
    gsap.fromTo(root.querySelector(".cine"), { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "center center", scrub: 0.6 } });
    gsap.from(root.querySelectorAll("[data-in]"), { y: 40, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 60%" } });
  });
  return (
    <section ref={ref} className="close" aria-labelledby="close-h">
      <CineVideo clip={clips.closing} focus="50% 55%" />
      <div className="close-shade" /><div className="grain" />
      <div className="wrap">
        <p className="eyebrow" data-in style={{ justifyContent: "center" }}>{COMPANY.inc}</p>
        <h2 id="close-h" data-in>Ready when your people <em>walk in.</em></h2>
        <div className="cta-row" data-in>
          <Link href="/sco/request/consultation" className="btn light" data-cursor="Go">Request a Consultation <span className="arr">→</span></Link>
          <Link href="/sco/request/proposal" className="btn ghost">Request a Proposal</Link>
        </div>
      </div>
    </section>
  );
}
