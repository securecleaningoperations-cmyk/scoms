"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Environment from "./Environment";
import { useScene } from "./motion";
import type { SceneVariant } from "@/lib/sco/content";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  cta?: { href: string; label: string };
  variant?: SceneVariant;
}

/**
 * Real pointer-driven glass cleaning. A canvas holds the "dirty glass" coverage; dragging (mouse or
 * touch) erases it with a squeegee-width stroke, exposing the clear environment + headline below.
 * Keyboard / reduced-motion visitors get a "Clean the glass" button that auto-wipes it.
 */
export default function GlassReveal({ eyebrow, title, body, cta, variant = "healthcare" }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [started, setStarted] = useState(false);
  const wiped = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const auto = useRef<number | null>(null);

  const ref = useScene<HTMLElement>(({ gsap, root }) => {
    gsap.from(root.querySelectorAll("[data-in]"), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: root, start: "top 65%" } });
  });

  // Size canvas and paint an opaque mask (erased by wiping).
  useEffect(() => {
    const c = canvas.current!;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = r.width * dpr; c.height = r.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, r.width, r.height);
      wiped.current = 0; setPct(0);
      if (over.current) { over.current.style.opacity = "1"; over.current.style.webkitMaskImage = over.current.style.maskImage = "none"; }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  const measure = () => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const w = 48, h = 27;
    const tmp = document.createElement("canvas"); tmp.width = w; tmp.height = h;
    const t = tmp.getContext("2d")!;
    t.drawImage(c, 0, 0, w, h);
    const d = t.getImageData(0, 0, w, h).data;
    let clear = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 40) clear++;
    void ctx;
    const p = Math.round((clear / (w * h)) * 100);
    wiped.current = p; setPct(p);
    if (p > 62 && over.current) { over.current.style.transition = "opacity 1s"; over.current.style.opacity = "0"; }
  };

  const maskT = useRef(0);
  const syncMask = (force = false) => {
    const now = performance.now();
    if (!force && now - maskT.current < 70) return;
    maskT.current = now;
    const c = canvas.current, o = over.current;
    if (!c || !o) return;
    const url = `url(${c.toDataURL("image/png")})`;
    o.style.webkitMaskImage = url; o.style.maskImage = url;
    o.style.webkitMaskSize = "100% 100%"; o.style.maskSize = "100% 100%";
  };

  const stroke = (x: number, y: number) => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(70, c.getBoundingClientRect().width * 0.07);
    ctx.beginPath();
    const l = last.current ?? { x, y };
    ctx.moveTo(l.x, l.y); ctx.lineTo(x, y); ctx.stroke();
    last.current = { x, y };
    syncMask();
  };

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e: React.PointerEvent) => { setStarted(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); const p = pos(e); last.current = null; stroke(p.x, p.y); };
  const move = (e: React.PointerEvent) => { if (e.buttons === 0 && e.pointerType === "mouse") return; const p = pos(e); stroke(p.x, p.y); };
  const up = () => { last.current = null; syncMask(true); measure(); };

  const autoClean = () => {
    setStarted(true);
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    const rows = 7; let i = 0; const total = rows * 60;
    const step = () => {
      const row = Math.floor(i / 60), t = (i % 60) / 59;
      const x = (row % 2 === 0 ? t : 1 - t) * r.width;
      const y = ((row + 0.5) / rows) * r.height;
      if (i % 60 === 0) last.current = null;
      stroke(x, y); i++;
      if (i < total) auto.current = requestAnimationFrame(step); else { last.current = null; syncMask(true); measure(); }
    };
    auto.current = requestAnimationFrame(step);
  };
  useEffect(() => () => { if (auto.current) cancelAnimationFrame(auto.current); }, []);

  return (
    <section ref={ref} className="glass-stage dark" aria-labelledby="glass-h">
      <div className="glass-under">
        <Environment variant={variant} style={{ ["--clean" as string]: 1 }} />
        <div className="shade" />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <p className="eyebrow" data-in>{eyebrow}</p>
          <h2 id="glass-h" className="h-xl" style={{ margin: "22px 0 24px" }} data-in>{title}</h2>
          <p className="lead" data-in>{body}</p>
          {cta && <div style={{ marginTop: 32 }} data-in><Link href={cta.href} className="btn light">{cta.label} <span className="arr">→</span></Link></div>}
        </div>
      </div>
      <div className="glass-over" ref={over} />
      <canvas
        ref={canvas}
        className="glass-canvas"
        aria-hidden="true"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        style={{ opacity: 0.001 }}
      />
      <button className="btn light glass-btn" onClick={autoClean} aria-label="Clean the glass to reveal the content">Clean the glass</button>
      <div className="glass-hint" style={{ opacity: started && pct > 8 ? 0 : 1 }}>{pct < 62 ? "Drag across the glass to clean it" : "Clean"} · {pct}%</div>
    </section>
  );
}
