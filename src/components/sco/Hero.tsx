"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Environment from "./Environment";
import { useScene } from "./motion";
import { COMPANY } from "@/lib/sco/content";

const KEY = "sco_intro_seen_v1";

function Words({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className={`split ${className}`}><span data-w>{w}&nbsp;</span></span>
      ))}
    </>
  );
}

/** Cinematic entrance: a hazy, slightly neglected lobby is wiped clean by a squeegee line,
 *  lights resolve, then the identity appears. Skippable, short, once per session. */
function Intro({ onDone }: { onDone: () => void }) {
  const [gone, setGone] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const finish = useCallback(() => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    setGone(true);
    onDone();
  }, [onDone]);

  const ref = useScene<HTMLDivElement>(({ gsap, root }) => {
    const env = root.querySelector<HTMLElement>(".env")!;
    const sq = root.querySelector<HTMLElement>(".squeegee")!;
    const bar = root.querySelector<HTMLElement>(".intro-bar i")!;
    const cap1 = root.querySelector<HTMLElement>("[data-cap1]")!;
    const cap2 = root.querySelector<HTMLElement>("[data-cap2]")!;
    gsap.set(env, { "--sweep": "0%", "--clean": 0 });
    gsap.set(sq, { left: "0%", xPercent: -150 });
    const t = gsap.timeline({ onComplete: finish });
    tl.current = t;
    t.fromTo(cap1, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.1)
      .to(bar, { scaleX: 1, duration: 3.6, ease: "none" }, 0)
      .to(env, { "--sweep": "112%", duration: 2.3, ease: "power2.inOut" }, 0.7)
      .to(sq, { left: "112%", duration: 2.3, ease: "power2.inOut" }, 0.7)
      .to(env, { "--clean": 1, duration: 2.0, ease: "power2.out" }, 1.1)
      .to(cap1, { autoAlpha: 0, y: -10, duration: 0.5 }, 2.2)
      .fromTo(cap2, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.9)
      .to(root, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 3.7);
    return () => { t.kill(); };
  }, [finish]);

  if (gone) return null;
  return (
    <div ref={ref} className="intro" role="dialog" aria-label="Opening sequence" aria-live="polite">
      <div className="intro-env"><Environment variant="office" sweep /></div>
      <div className="squeegee" aria-hidden="true"><i /></div>
      <div className="intro-cap">
        <p className="mono" data-cap1>Preparing the environment</p>
        <p className="mono" data-cap2 style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", visibility: "hidden" }}>Presentation-ready</p>
      </div>
      <div className="intro-bar" aria-hidden="true"><i /></div>
      <button className="intro-skip" onClick={() => { tl.current?.kill(); finish(); }}>Skip intro</button>
    </div>
  );
}

export default function Hero() {
  const [phase, setPhase] = useState<"check" | "intro" | "ready">("check");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch {}
    setPhase(reduce || seen ? "ready" : "intro");
  }, []);

  const ref = useScene<HTMLElement>(({ gsap, root, reduce }) => {
    const env = root.querySelector<HTMLElement>(".env")!;
    const words = root.querySelectorAll("[data-w]");
    const rv = root.querySelectorAll("[data-rv]");
    if (phase === "check" || phase === "intro") { gsap.set([...words, ...rv], { autoAlpha: 0 }); return; }
    gsap.set(env, { "--clean": 1, "--haze": 0.0, "--streak": 0.0 });
    if (!reduce) {
      gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: "expo.out", stagger: 0.055, delay: 0.1 });
      gsap.fromTo(rv, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.09, delay: 0.55 });
      // environment: slow push-in, then scroll turns the hero back toward "needs cleaning" -> reverses on return
      gsap.fromTo(root.querySelector(".hero-bg"), { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "expo.out" });
      gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.8 } })
        .to(".hero-bg", { scale: 1.18, yPercent: 8, ease: "none" }, 0)
        .to(".hero-in", { yPercent: -14, autoAlpha: 0.15, ease: "none" }, 0)
        .to(env, { "--clean": 0.55, ease: "none" }, 0);
    } else gsap.set([...words, ...rv], { autoAlpha: 1, yPercent: 0, y: 0 });
  }, [phase]);

  return (
    <>
      {phase === "intro" && <Intro onDone={() => setPhase("ready")} />}
      <section ref={ref} className="hero dark" aria-labelledby="hero-h">
        <div className="hero-bg" style={{ position: "absolute", inset: 0 }}><Environment variant="office" style={{ ["--clean" as string]: 1 }} /></div>
        <div className="shade" />
        <div className="vignette" />
        <div className="wrap hero-in">
          <p className="eyebrow" data-rv>{COMPANY.inc}</p>
          <h1 id="hero-h" style={{ marginTop: 22 }}><Words text="Professional Commercial Cleaning & Facility Services Built for" /><span className="split"><span data-w><em>Critical&nbsp;Environments.</em></span></span></h1>
          <div className="hero-pillars" data-rv><span>People</span><span>Process</span><span>Quality</span><span>Technology</span><span>Accountability</span></div>
          <div className="cta-row" data-rv>
            <Link href="/sco/request/consultation" className="btn light" data-cursor="Go">Request a Consultation <span className="arr">→</span></Link>
            <Link href="/sco/services" className="btn ghost">Explore Services</Link>
            <Link href="/sco/find-services" className="tlink" style={{ marginLeft: 10 }}>Find Your Service Area ↗</Link>
          </div>
        </div>
        <div className="hero-meta" data-rv><span className="scrollcue"><span>Scroll</span><i /></span></div>
      </section>
    </>
  );
}
