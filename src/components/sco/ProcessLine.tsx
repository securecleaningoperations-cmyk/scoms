"use client";

import { useScene } from "./motion";
import { processSteps } from "@/lib/sco/content";

export default function ProcessLine() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".p-step"));
    if (reduce) { steps.forEach((s) => s.classList.add("on")); gsap.set(root.querySelector(".proc-line i"), { scaleX: 1 }); return; }
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.from(steps, { y: 30, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: ".proc-grid", start: "top 80%" } });
    gsap.to(root.querySelector(".proc-line i"), {
      scaleX: 1, ease: "none",
      scrollTrigger: {
        trigger: ".proc-grid", start: "top 70%", end: "bottom 55%", scrub: 0.5,
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle("on", self.progress >= (i + 0.2) / steps.length)),
      },
    });
  });
  return (
    <section ref={ref} className="section proc" aria-labelledby="proc-h">
      <div className="wrap">
        <p className="eyebrow" data-in>Our Process</p>
        <h2 id="proc-h" className="h-lg" style={{ marginTop: 18, maxWidth: "14ch" }} data-in>One line, <em>seven</em> disciplines.</h2>
        <div className="proc-grid">
          <div className="proc-line" aria-hidden="true"><i /></div>
          <ol className="proc-steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {processSteps.map((s, i) => (
              <li key={s.label} className="p-step">
                <div className="p-dot" />
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.label}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
