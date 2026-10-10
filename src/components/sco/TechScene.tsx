"use client";

import Link from "next/link";
import Environment from "./Environment";
import { useScene } from "./motion";

const pins = [{ x: 24, y: 62 }, { x: 46, y: 48 }, { x: 68, y: 58 }, { x: 80, y: 40 }];
const log = ["Facility mapped", "Team assigned", "Service completed", "Inspection verified", "Record documented"];

export default function TechScene() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".tc-log div"));
    const pinEls = Array.from(root.querySelectorAll<HTMLElement>(".tc-pin"));
    if (reduce) { gsap.set(rows, { autoAlpha: 1, x: 0 }); pinEls.forEach((p) => p.classList.add("on")); return; }
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".tech-card", start: "top 70%", toggleActions: "play none none reverse" } });
    rows.forEach((r, i) => tl.to(r, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" }, i * 0.55).call(() => pinEls[Math.min(i, pinEls.length - 1)]?.classList.add("on"), undefined, i * 0.55));
    tl.fromTo(root.querySelector(".tc-trace"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: "none" }, 0);
  });
  return (
    <section ref={ref} className="section tech dark" aria-labelledby="tech-h">
      <div className="wrap" style={{ display: "grid", gap: 56 }}>
        <div>
          <p className="eyebrow" data-in>Technology</p>
          <h2 id="tech-h" className="h-lg" style={{ marginTop: 18, maxWidth: "18ch" }} data-in>Technology that supports <em>accountability.</em></h2>
          <p className="lead" style={{ marginTop: 22 }} data-in>The physical work stays first. Assignment, completion, inspection and documentation are recorded around it — so the standard can be demonstrated.</p>
        </div>
        <div className="tech-card" data-in>
          <Environment variant="government" style={{ ["--clean" as string]: 0.9, opacity: 0.55 }} />
          <div className="tc-ui">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <path className="tc-trace" pathLength={1} d={`M${pins.map((p) => `${p.x} ${p.y}`).join(" L")}`} stroke="#8fb9ff" strokeWidth=".35" strokeDasharray="1" strokeDashoffset="1" fill="none" vectorEffect="non-scaling-stroke" />
            </svg>
            {pins.map((p, i) => <span key={i} className="tc-pin" style={{ left: p.x + "%", top: p.y + "%" }} />)}
          </div>
          <div className="tc-log">{log.map((l) => <div key={l}>{l}</div>)}</div>
        </div>
        <div data-in><Link href="/sco/about/technology" className="tlink">How technology supports the operation ↗</Link></div>
      </div>
    </section>
  );
}
