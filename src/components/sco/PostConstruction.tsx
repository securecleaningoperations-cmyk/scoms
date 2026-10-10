"use client";

import Link from "next/link";
import Environment from "./Environment";
import { useScene, scrubTimeline } from "./motion";

const stages = ["Construction complete", "Dust cleared", "Protection removed", "Glass cleaned", "Surfaces finished", "Floor transformed", "Move-in ready"];

export default function PostConstruction() {
  const ref = useScene<HTMLDivElement>((ctx) => {
    const { gsap, root, reduce } = ctx;
    const env = root.querySelector<HTMLElement>(".env")!;
    const steps = Array.from(root.querySelectorAll<HTMLElement>(".pc-step"));
    const final = root.querySelector<HTMLElement>(".pc-final")!;
    const copy = root.querySelector<HTMLElement>(".pc-copy")!;
    const light = root.querySelector<HTMLElement>(".pc-light")!;
    const dim = root.querySelector<HTMLElement>(".pc-dim")!;
    const titles = Array.from(root.querySelectorAll<HTMLElement>("[data-t]"));

    if (reduce) { gsap.set(env, { "--clean": 1, "--dust": 0, "--plastic": 0, "--haze": 0, "--floor": 0, "--streak": 0, "--gloss": 1 }); gsap.set(final, { opacity: 1 }); gsap.set(copy, { autoAlpha: 0 }); gsap.set(dim, { autoAlpha: 0 }); return; }

    gsap.set(env, { "--clean": 0, "--dust": 0.95, "--plastic": 1, "--haze": 1, "--floor": 1, "--streak": 1, "--gloss": 0, "--light": 0, "--blur": 1 });
    gsap.set(titles, { autoAlpha: 0, y: 30 }); gsap.set(titles[0], { autoAlpha: 1, y: 0 });
    gsap.set(final, { autoAlpha: 0 });

    const mark = (i: number) => () => steps.forEach((s, k) => s.classList.toggle("on", k <= i));
    const tl = scrubTimeline(ctx, 0.7);
    // 0 → construction state
    tl.call(mark(0), undefined, 0)
      // 1 dust clears
      .to(env, { "--dust": 0, duration: 0.14 }, 0.1).call(mark(1), undefined, 0.14)
      .to(titles[0], { autoAlpha: 0, y: -24, duration: 0.05 }, 0.12).to(titles[1], { autoAlpha: 1, y: 0, duration: 0.07 }, 0.15)
      // 2 protective material peeled off
      .to(env, { "--plastic": 0, duration: 0.14 }, 0.28).call(mark(2), undefined, 0.3)
      .to(titles[1], { autoAlpha: 0, y: -24, duration: 0.05 }, 0.3).to(titles[2], { autoAlpha: 1, y: 0, duration: 0.07 }, 0.33)
      // 3 glass clears
      .to(env, { "--haze": 0, "--streak": 0, "--blur": 0, duration: 0.14 }, 0.44).call(mark(3), undefined, 0.46)
      .to(titles[2], { autoAlpha: 0, y: -24, duration: 0.05 }, 0.46).to(titles[3], { autoAlpha: 1, y: 0, duration: 0.07 }, 0.49)
      // 4 surfaces finished -> lighting wakes up
      .to(env, { "--light": 1, "--gloss": 0.5, duration: 0.12 }, 0.6).call(mark(4), undefined, 0.62)
      .to(titles[3], { autoAlpha: 0, y: -24, duration: 0.05 }, 0.62).to(titles[4], { autoAlpha: 1, y: 0, duration: 0.07 }, 0.65)
      // 5 floor transforms
      .to(env, { "--floor": 0, "--clean": 1, "--gloss": 1, duration: 0.14 }, 0.74).call(mark(5), undefined, 0.76)
      .to(titles[4], { autoAlpha: 0, y: -24, duration: 0.05 }, 0.76).to(titles[5], { autoAlpha: 1, y: 0, duration: 0.07 }, 0.79)
      // 6 resolve
      .to(light, { opacity: 0.9, duration: 0.12 }, 0.84).to(dim, { opacity: 0, duration: 0.1 }, 0.84)
      .to(titles[5], { autoAlpha: 0, duration: 0.04 }, 0.88).to(copy, { autoAlpha: 0, duration: 0.05 }, 0.88)
      .to(final, { autoAlpha: 1, duration: 0.08 }, 0.9).call(mark(6), undefined, 0.9)
      .to(root.querySelector(".pc-bg"), { scale: 1.07, duration: 1 }, 0);
  });

  return (
    <div ref={ref} className="stage-track pc-track" id="post-construction">
      <div className="stage pc-stage dark">
        <div className="pc-bg" style={{ position: "absolute", inset: 0 }}><Environment variant="construction" /></div>
        <div className="pc-dim" />
        <div className="shade" /><div className="vignette" /><div className="pc-light" />
        <ul className="pc-stagelist" style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label="Cleaning progress">
          {stages.map((s) => <li key={s} className="pc-step">{s}</li>)}
        </ul>
        <div className="pc-copy">
          <p className="eyebrow">Post-Construction Signature</p>
          <div style={{ position: "relative", minHeight: "clamp(130px, 22vw, 260px)", marginTop: 18 }}>
            {["Dust settles on every surface.", "Protective material comes down.", "Glass regains its clarity.", "Surfaces are finished and checked.", "The floor is brought to standard."].map((t, i) => (
              <h2 key={i} data-t className="h-lg" style={{ position: "absolute", inset: 0 }}>{t}</h2>
            ))}
          </div>
        </div>
        <div className="pc-final">
          <div>
            <p className="eyebrow" style={{ marginBottom: 24 }}>Post-Construction Cleaning</p>
            <h2>From Construction Complete to <em>Move-In Ready.</em></h2>
            <div style={{ marginTop: 36 }}><Link href="/sco/request/proposal?service=post-construction-cleaning" className="btn light">Request Post-Construction Services <span className="arr">→</span></Link></div>
          </div>
        </div>
      </div>
    </div>
  );
}
