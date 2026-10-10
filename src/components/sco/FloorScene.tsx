"use client";

import Link from "next/link";
import Environment from "./Environment";
import { useScene, scrubTimeline } from "./motion";

const steps = ["Scrubbing", "Stripping", "Waxing", "Finishing", "Buffing", "Burnishing", "Auto-Scrubbing", "Hard-Floor Maintenance"];

function Scrubber() {
  return (
    <svg viewBox="0 0 300 207" fill="none" aria-hidden="true">
      <ellipse cx="150" cy="190" rx="130" ry="11" fill="rgba(0,0,0,.35)" />
      <rect x="40" y="128" width="210" height="52" rx="9" fill="#1d2a38" />
      <rect x="40" y="128" width="210" height="14" rx="6" fill="#1b63c4" />
      <rect x="30" y="170" width="236" height="14" rx="4" fill="#0c141d" />
      <rect x="236" y="176" width="46" height="9" rx="3" fill="#30566f" />
      <circle cx="82" cy="180" r="14" fill="#0c141d" /><circle cx="82" cy="180" r="6" fill="#59656f" />
      <circle cx="210" cy="180" r="14" fill="#0c141d" /><circle cx="210" cy="180" r="6" fill="#59656f" />
      <rect x="64" y="70" width="140" height="62" rx="8" fill="#2a76d6" />
      <rect x="76" y="80" width="64" height="30" rx="3" fill="#cfe5fb" opacity=".85" />
      <rect x="148" y="82" width="46" height="8" rx="2" fill="#0f2030" opacity=".6" />
      <path d="M206 78 L250 22 L262 28 L222 90" stroke="#0f2030" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
      <rect x="244" y="14" width="30" height="12" rx="5" fill="#0f2030" />
      <circle cx="208" cy="100" r="7" fill="#f2b705" />
    </svg>
  );
}

export default function FloorScene() {
  const ref = useScene<HTMLDivElement>((ctx) => {
    const { gsap, root, reduce, small } = ctx;
    const env = root.querySelector<HTMLElement>(".wake .env")!;
    const wake = root.querySelector<HTMLElement>(".wake")!;
    const line = root.querySelector<HTMLElement>(".wake-line")!;
    const mach = root.querySelector<HTMLElement>(".scrubber")!;
    const chips = Array.from(root.querySelectorAll<HTMLElement>(".floor-list span"));
    const copy = root.querySelectorAll<HTMLElement>("[data-fc]");
    if (reduce) { gsap.set(wake, { "--reveal": "100%" }); gsap.set(env, { "--clean": 1 }); chips.forEach((c) => c.classList.add("on")); return; }
    const W = () => root.querySelector<HTMLElement>(".floor-stage")!.clientWidth;
    gsap.set(wake, { "--reveal": "0%" });
    gsap.set(env, { "--clean": 1 });
    const progress = { v: 0 };
    const tl = scrubTimeline(ctx, 0.5);
    tl.fromTo(copy, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.12 }, 0)
      .to(progress, {
        v: 1, duration: 0.82, ease: "none",
        onUpdate: () => {
          const w = W(); const mw = mach.clientWidth;
          const x = -mw * 0.6 + progress.v * (w + mw * 0.7);
          const pct = Math.max(0, Math.min(100, ((x + mw * 0.58) / w) * 100));
          gsap.set(mach, { x });
          gsap.set(wake, { "--reveal": pct + "%" });
          gsap.set(line, { left: pct + "%", autoAlpha: pct > 0 && pct < 100 ? 1 : 0 });
          const idx = Math.min(chips.length - 1, Math.floor(progress.v * chips.length));
          chips.forEach((c, i) => c.classList.toggle("on", i <= idx && pct > 2));
        },
      }, 0.1)
      .to(root.querySelector(".reflect"), { autoAlpha: 1, duration: 0.2 }, 0.8)
      .to(root.querySelector(".floor-bg"), { scale: small ? 1.04 : 1.08, duration: 0.9 }, 0);
  });

  return (
    <div ref={ref} className="stage-track floor-track">
      <div className="stage floor-stage dark">
        {/* BEFORE: dull, hazy floor. AFTER (.wake): cleaned, reflective, revealed behind the machine */}
        <div className="floor-bg" style={{ position: "absolute", inset: 0 }}>
          <Environment variant="hospitality" style={{ ["--clean" as string]: 0, ["--blur" as string]: 0 }} />
        </div>
        <div className="wake"><Environment variant="hospitality" style={{ ["--clean" as string]: 1 }} /></div>
        <div className="wake-line" style={{ opacity: 0 }} />
        <div className="reflect" style={{ opacity: 0 }} />
        <div className="scrubber"><Scrubber /></div>
        <div className="shade" /><div className="vignette" />
        <div className="floor-copy">
          <p className="eyebrow" data-fc>Professional Floor Care</p>
          <h2 className="h-xl" style={{ margin: "20px 0 22px" }} data-fc>The floor tells the <em>whole story.</em></h2>
          <p className="lead" data-fc>Auto-scrubbing, finishing and burnishing restore hard floors to a refined, reflective standard — one pass at a time.</p>
        </div>
        <div className="floor-cap" data-fc>
          <div className="floor-list" aria-label="Floor care capabilities">{steps.map((s) => <span key={s}>{s}</span>)}</div>
          <div style={{ marginTop: 22 }}><Link href="/sco/services/floor-care" className="btn light">Explore Floor Care <span className="arr">→</span></Link></div>
        </div>
      </div>
    </div>
  );
}
