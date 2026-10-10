"use client";

import Environment from "./Environment";
import { useScene, scrubTimeline } from "./motion";
import { pillars } from "@/lib/sco/content";

function Person({ role }: { role: "cleaner" | "supervisor" }) {
  const shirt = role === "cleaner" ? "#1b63c4" : "#f4f5f7";
  return (
    <svg className="p-person" viewBox="0 0 120 240" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="232" rx="42" ry="6" fill="rgba(0,0,0,.35)" />
      <rect x="40" y="148" width="18" height="78" rx="6" fill="#0d1218" /><rect x="62" y="148" width="18" height="78" rx="6" fill="#0d1218" />
      <rect x="36" y="222" width="24" height="9" rx="3" fill="#3b2f26" /><rect x="60" y="222" width="24" height="9" rx="3" fill="#3b2f26" />
      <rect x="30" y="66" width="60" height="90" rx="14" fill={shirt} stroke="rgba(0,0,0,.2)" />
      <rect x="64" y="84" width="16" height="10" rx="2" fill="rgba(0,0,0,.18)" />
      <rect x="14" y="72" width="16" height="72" rx="8" fill={shirt} stroke="rgba(0,0,0,.2)" /><rect x="90" y="72" width="16" height="72" rx="8" fill={shirt} stroke="rgba(0,0,0,.2)" />
      <circle cx="60" cy="42" r="19" fill="#c79a78" />
      <path d="M41 40a19 19 0 0 1 38 0v2H41z" fill={role === "cleaner" ? "#1b63c4" : "#fff"} />
    </svg>
  );
}

const tags = [
  { k: "people", t: "Lead Cleaner · Badge verified", x: "58%", y: "30%" },
  { k: "process", t: "Plan → Assign → Execute", x: "34%", y: "40%" },
  { k: "quality", t: "Inspection in progress", x: "62%", y: "36%" },
  { k: "technology", t: "Assignment synced", x: "40%", y: "34%" },
  { k: "accountability", t: "Completion verified", x: "55%", y: "30%" },
];

export default function Pillars() {
  const ref = useScene<HTMLDivElement>((ctx) => {
    const { gsap, root, reduce } = ctx;
    const env = root.querySelector<HTMLElement>(".env")!;
    const words = Array.from(root.querySelectorAll<HTMLElement>(".pil-layer"));
    const nav = Array.from(root.querySelectorAll<HTMLElement>(".pil-word span"));
    const route = root.querySelector<SVGPathElement>(".p-route path")!;
    const checks = Array.from(root.querySelectorAll<HTMLElement>(".p-check div"));
    const person = root.querySelector<HTMLElement>(".p-person")!;
    const tg = Array.from(root.querySelectorAll<HTMLElement>(".tag3"));

    if (reduce) { words.forEach((w, i) => gsap.set(w, { autoAlpha: i === words.length - 1 ? 1 : 0 })); gsap.set(env, { "--clean": 1 }); nav.forEach((n) => n.classList.add("on")); return; }
    gsap.set(route, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(words, { autoAlpha: 0 }); gsap.set(words[0], { autoAlpha: 1 });
    gsap.set(checks, { autoAlpha: 0, x: 30 }); gsap.set(tg, { autoAlpha: 0, y: 12 }); gsap.set(person, { autoAlpha: 0, x: 60 });
    gsap.set(env, { "--clean": 0.45, "--haze": 0.4, "--streak": 0.4, "--dust": 0.3 });

    const mark = (i: number) => () => nav.forEach((n, k) => n.classList.toggle("on", k === i));
    const swap = (tl: gsap.core.Timeline, from: number, to: number, at: number) => {
      tl.to(words[from], { autoAlpha: 0, y: -50, duration: 0.05 }, at)
        .fromTo(words[to], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.07 }, at + 0.03)
        .call(mark(to), undefined, at + 0.04);
    };
    const tl = scrubTimeline(ctx, 0.7);
    tl.call(mark(0), undefined, 0)
      // PEOPLE
      .to(person, { autoAlpha: 1, x: 0, duration: 0.07 }, 0.03).to(tg[0], { autoAlpha: 1, y: 0, duration: 0.05 }, 0.07)
      .to(env, { "--clean": 0.6, duration: 0.1 }, 0.05);
    // PROCESS
    swap(tl, 0, 1, 0.18);
    tl.to(tg[0], { autoAlpha: 0, duration: 0.03 }, 0.18)
      .to(route, { strokeDashoffset: 0, duration: 0.16 }, 0.22).to(tg[1], { autoAlpha: 1, y: 0, duration: 0.05 }, 0.26)
      .to(env, { "--haze": 0.2, duration: 0.1 }, 0.25);
    // QUALITY
    swap(tl, 1, 2, 0.4);
    tl.to(tg[1], { autoAlpha: 0, duration: 0.03 }, 0.4)
      .to(env, { "--clean": 0.9, "--streak": 0, "--haze": 0, "--dust": 0, duration: 0.14 }, 0.42)
      .to(tg[2], { autoAlpha: 1, y: 0, duration: 0.05 }, 0.5);
    // TECHNOLOGY
    swap(tl, 2, 3, 0.62);
    tl.to(tg[2], { autoAlpha: 0, duration: 0.03 }, 0.62)
      .to(checks, { autoAlpha: 1, x: 0, stagger: 0.025, duration: 0.05 }, 0.66).to(tg[3], { autoAlpha: 1, y: 0, duration: 0.05 }, 0.68);
    // ACCOUNTABILITY
    swap(tl, 3, 4, 0.82);
    tl.to(tg[3], { autoAlpha: 0, duration: 0.03 }, 0.82)
      .call(() => root.querySelectorAll(".p-check b").forEach((b) => b.classList.add("done")), undefined, 0.86)
      .to(env, { "--clean": 1, duration: 0.1 }, 0.86).to(tg[4], { autoAlpha: 1, y: 0, duration: 0.05 }, 0.9);
  });

  return (
    <div ref={ref} className="stage-track pil-track">
      <div className="stage pil-stage dark">
        <Environment variant="office" />
        <div className="shade" /><div className="vignette" />
        <div className="pil-word" aria-hidden="true">{pillars.map((p) => <span key={p.key}>{p.label}</span>)}</div>
        <div className="pil-ui" aria-hidden="true">
          <svg className="p-route" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M8 78 C 22 78, 20 52, 34 52 S 52 66, 62 50 S 82 40, 90 44" pathLength={1} /></svg>
          <Person role="cleaner" />
          {tags.map((t, i) => <div key={t.k} className="tag3" style={{ left: t.x, top: t.y }}>{t.t}<span style={{ display: "none" }}>{i}</span></div>)}
          <div className="p-check">
            {["Team assigned", "Service completed", "Inspection passed", "Documentation recorded"].map((c) => <div key={c}><b className="" />{c}</div>)}
          </div>
        </div>
        {pillars.map((p, i) => (
          <div key={p.key} className="pil-layer" aria-hidden={false}>
            <div>
              <h2>{p.label}<em>.</em></h2>
              <p>{p.line}</p>
              {i === pillars.length - 1 && <p className="eyebrow" style={{ marginTop: 28 }}>People • Process • Quality • Technology • Accountability</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
