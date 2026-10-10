"use client";

import Link from "next/link";
import { useState } from "react";
import Environment from "./Environment";
import { useScene } from "./motion";
import { industries, services } from "@/lib/sco/content";

export default function IndustryPanels() {
  const list = industries.slice(0, 8);
  const [open, setOpen] = useState(0);
  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 36, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 70%" } });
    gsap.from(root.querySelectorAll(".ind-p"), { clipPath: "inset(100% 0 0 0)", duration: 1.2, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".ind-wrap", start: "top 80%" } });
  });
  return (
    <section ref={ref} className="section ind" aria-labelledby="ind-h">
      <div className="wrap">
        <p className="eyebrow" data-in>Industries</p>
        <h2 id="ind-h" className="h-lg" style={{ marginTop: 18, maxWidth: "16ch" }} data-in>Built for the environments you <em>operate in</em></h2>
        <div className="ind-wrap" data-in>
          {list.map((ind, i) => (
            <div key={ind.slug} className="ind-p" role="button" tabIndex={0} aria-expanded={open === i} data-cursor={open === i ? "" : "Open"}
              onMouseEnter={() => window.matchMedia("(hover:hover)").matches && setOpen(i)} onClick={() => setOpen(i)} onFocus={() => setOpen(i)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(i)}>
              <Environment variant={ind.scene} style={{ ["--clean"as string]: 0.95 }} />
              <div className="shade" />
              <span className="ind-name">{ind.title}</span>
              <div className="ind-more">
                <p style={{ fontSize: "1.1rem", maxWidth: "36ch" }}>{ind.line}</p>
                <ul>{ind.services.map((s) => <li key={s}>{services.find((x) => x.slug === s)?.title}</li>)}</ul>
                <Link href={`/sco/industries/${ind.slug}`} className="btn light" tabIndex={open === i ? 0 : -1}>Explore {ind.title} Solutions <span className="arr">→</span></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
