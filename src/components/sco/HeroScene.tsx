"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive 3D "dust → clean" layer for the hero.
 * - ~260 dust motes live in real 3D (x,y,z) and are perspective-projected every frame.
 * - The cursor acts as a squeegee in 3D: motes near it are swept aside, brighten into sparkles,
 *   and leave a fading glint trail. They then drift back, so the room keeps "needing" attention.
 * - Pointer position also drives a camera orbit (rotateX/Y) on the footage, headline and copy
 *   via CSS variables, giving the whole hero real parallax depth.
 * Pure canvas + rAF (no extra dependency). Pauses off-screen, skipped for reduced motion / touch.
 */
export default function HeroScene({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current, root = rootRef.current;
    if (!canvas || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = fine ? 260 : 90;
    type P = { x: number; y: number; z: number; hx: number; hy: number; vx: number; vy: number; r: number; tw: number; glow: number };
    const parts: P[] = Array.from({ length: N }, () => {
      const x = (Math.random() - 0.5) * 2.6, y = (Math.random() - 0.5) * 1.6, z = Math.random() * 2 + 0.2;
      return { x, y, z, hx: x, hy: y, vx: 0, vy: 0, r: Math.random() * 1.6 + 0.5, tw: Math.random() * 6.28, glow: 0 };
    });
    const trail: { x: number; y: number; life: number; s: number }[] = [];

    const m = { x: 0, y: 0, tx: 0, ty: 0, px: -999, py: -999, active: false, speed: 0 };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      m.tx = (cx / r.width - 0.5) * 2; m.ty = (cy / r.height - 0.5) * 2;
      m.speed = Math.hypot(cx - m.px, cy - m.py);
      m.px = cx; m.py = cy; m.active = true;
      if (m.speed > 2) trail.push({ x: cx, y: cy, life: 1, s: 6 + Math.min(m.speed, 40) * 0.5 });
      if (trail.length > 70) trail.shift();
    };
    const onLeave = () => { m.active = false; m.tx = 0; m.ty = 0; };
    if (fine) { root.addEventListener("pointermove", onMove); root.addEventListener("pointerleave", onLeave); }

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(root);

    const F = 1.15; // focal length factor
    let t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      const dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;

      // camera orbit → CSS vars (footage, headline, copy tilt in 3D toward the pointer)
      root.style.setProperty("--hx-rx", `${(-m.y * 3.2).toFixed(2)}deg`);
      root.style.setProperty("--hx-ry", `${(m.x * 4.2).toFixed(2)}deg`);
      root.style.setProperty("--hx-tx", `${(m.x * -14).toFixed(1)}px`);
      root.style.setProperty("--hx-ty", `${(m.y * -9).toFixed(1)}px`);

      ctx.clearRect(0, 0, w, h);
      const cam = { x: m.x * 0.12, y: m.y * 0.08 };
      const scale = Math.min(w, h * 1.7);

      for (const p of parts) {
        p.tw += dt * 1.4;
        // idle float
        p.hx += Math.sin(p.tw * 0.6 + p.hy * 3) * 0.0004;
        p.hy += Math.cos(p.tw * 0.5 + p.hx * 3) * 0.0003 - 0.00008;
        if (p.hy < -0.9) { p.hy = 0.9; p.hx = (Math.random() - 0.5) * 2.6; }
        // spring to home + velocity
        p.vx += (p.hx - p.x) * 0.9 * dt; p.vy += (p.hy - p.y) * 0.9 * dt;
        p.vx *= 0.93; p.vy *= 0.93;
        p.x += p.vx; p.y += p.vy;

        // projection
        const depth = p.z + 0.2;
        const k = F / depth;
        const sx = w / 2 + (p.x - cam.x * p.z) * k * scale * 0.55;
        const sy = h / 2 + (p.y - cam.y * p.z) * k * scale * 0.55;

        // squeegee: sweep + sparkle near the cursor (in screen space, weighted by depth)
        if (m.active) {
          const dx = sx - m.px, dy = sy - m.py, d = Math.hypot(dx, dy), R = 130 * k;
          if (d < R) {
            const f = (1 - d / R);
            p.vx += (dx / (d || 1)) * f * 0.012 * (1 + m.speed * 0.04);
            p.vy += (dy / (d || 1)) * f * 0.012 * (1 + m.speed * 0.04);
            p.glow = Math.min(1, p.glow + f * 0.5);
          }
        }
        p.glow *= 0.94;

        const near = 1 - Math.min(depth / 2.4, 1);
        const a = (0.18 + near * 0.5) * (0.6 + 0.4 * Math.sin(p.tw * 2)) + p.glow * 0.8;
        const rad = (p.r + near * 2.2) * (1 + p.glow * 1.8);
        if (p.glow > 0.15) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 6);
          g.addColorStop(0, `rgba(255,244,214,${0.55 * p.glow})`); g.addColorStop(1, "rgba(255,244,214,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, rad * 6, 0, 6.283); ctx.fill();
          // 4-point sparkle
          ctx.strokeStyle = `rgba(255,255,255,${0.9 * p.glow})`; ctx.lineWidth = 1;
          const L = rad * 5 * p.glow;
          ctx.beginPath(); ctx.moveTo(sx - L, sy); ctx.lineTo(sx + L, sy); ctx.moveTo(sx, sy - L); ctx.lineTo(sx, sy + L); ctx.stroke();
        }
        ctx.fillStyle = `rgba(255,248,232,${Math.min(a, 1)})`;
        ctx.beginPath(); ctx.arc(sx, sy, rad, 0, 6.283); ctx.fill();
      }

      // squeegee glint trail
      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i]; t.life -= dt * 1.6;
        if (t.life <= 0) { trail.splice(i, 1); continue; }
        const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.s * 4);
        g.addColorStop(0, `rgba(190,215,255,${0.35 * t.life})`); g.addColorStop(1, "rgba(190,215,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(t.x, t.y, t.s * 4, 0, 6.283); ctx.fill();
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener("resize", resize);
      root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave);
    };
  }, [rootRef]);

  return <div className="hx3d" aria-hidden="true"><canvas ref={cv} /></div>;
}
