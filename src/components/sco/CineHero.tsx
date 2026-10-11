"use client";

import Link from "next/link";
import CineVideo from "./CineVideo";
import HeroScene from "./HeroScene";
import { useScene } from "./motion";
import { clips } from "@/lib/sco/media";
import { COMPANY } from "@/lib/sco/content";

const LINES = ["Cleaner buildings.", "Clearer standards.", <em key="e">Accountable people.</em>];

/**
 * Opening scene. Choreography (≈2.4s):
 *   footage un-masks from a centre band and settles from 1.18 scale →
 *   headline lines rise out of their masks → supporting copy, CTAs and the fact rail stagger in.
 * On scroll the footage drifts down slower than the page (parallax) while the copy lifts and
 * fades, handing the viewer to the statement section.
 */
export default function CineHero() {
  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    const media = root.querySelector<HTMLElement>(".hx-media")!;
    const cine = root.querySelector<HTMLElement>(".hx-media .cine")!;
    const lines = root.querySelectorAll(".ln > span");
    const rv = root.querySelectorAll("[data-rv]");
    const hdr = document.querySelector<HTMLElement>(".hdr");

    if (reduce) { gsap.set([...lines, ...rv], { autoAlpha: 1 }); return; }

    const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
    tl.fromTo(cine, { clipPath: "inset(46% 0% 46% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0)
      .fromTo(cine, { scale: 1.18 }, { scale: 1, duration: 2.6 }, 0)
      .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: 0.12 }, 0.85)
      .fromTo(rv, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08, ease: "power3.out" }, 1.3);
    if (hdr) tl.fromTo(hdr, { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power3.out", clearProps: "transform,opacity,visibility" }, 1.1);

    gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.6 } })
      .to(media, { yPercent: 16, scale: 1.06, ease: "none" }, 0)
      .to(root.querySelector(".hx-copy"), { yPercent: -22, autoAlpha: 0, ease: "none" }, 0)
      .to(root.querySelector(".hx-foot"), { autoAlpha: 0, ease: "none" }, 0);
    return () => { tl.kill(); };
  });

  return (
    <section ref={ref} className="hx" aria-labelledby="hx-h">
      <div className="hx-media"><CineVideo clip={clips.hero} eager focus="62% 50%" /></div>
      <div className="hx-shade" />
      <HeroScene rootRef={ref} />
      <span className="hx-hint">Move your cursor — sweep the room clean</span>
      <div className="grain" />
      <div className="wrap hx-in">
        <div className="hx-copy">
          <p className="eyebrow" data-rv>{COMPANY.inc} — Commercial Cleaning &amp; Facility Services</p>
          <h1 id="hx-h" style={{ marginTop: 24 }}>
            {LINES.map((l, i) => <span className="ln" key={i}><span>{l}</span></span>)}
          </h1>
          <p className="hx-sub" data-rv>Structured, inspected and documented cleaning programs for offices, healthcare, education, industrial and government facilities across the Mid-Atlantic.</p>
          <div className="cta-row" style={{ marginTop: 34 }} data-rv>
            <Link href="/sco/request/consultation" className="btn light" data-cursor="Go">Request a Consultation <span className="arr">→</span></Link>
            <Link href="#services" className="btn ghost">Explore Services</Link>
          </div>
        </div>
        <div className="hx-foot" data-rv>
          <div className="hx-facts">
            <div><span>Service area</span><b>PA · MD · VA · DC</b></div>
            <div><span>Office hours</span><b>Mon–Fri, 10:00–5:30</b></div>
            <div><span>Approach</span><b>Assigned · Inspected · Documented</b></div>
          </div>
          <span className="hx-count">Scroll to explore ↓</span>
        </div>
      </div>
    </section>
  );
}
