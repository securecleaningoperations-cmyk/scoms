"use client";

import { useEffect, useLayoutEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function setupGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export type SceneCtx = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
  root: HTMLElement;
  reduce: boolean;
  small: boolean;
};

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP scene. `build` runs inside gsap.matchMedia so everything is reverted on
 * unmount / breakpoint change. `reduce` is true when the visitor prefers reduced motion.
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  build: (ctx: SceneCtx) => void | (() => void),
  deps: DependencyList = [],
) {
  const ref = useRef<T>(null);
  useIso(() => {
    const root = ref.current;
    if (!root) return;
    const { gsap: g, ScrollTrigger: st } = setupGsap();
    const mm = g.matchMedia(root);
    mm.add({ reduce: "(prefers-reduced-motion: reduce)", small: "(max-width: 760px)" }, (c) => {
      const { reduce, small } = c.conditions as { reduce: boolean; small: boolean };
      return build({ gsap: g, ScrollTrigger: st, root, reduce: !!reduce, small: !!small });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Scroll-scrubbed timeline across a tall container (used with CSS sticky stages). */
export function scrubTimeline(ctx: SceneCtx, scrub = 0.6) {
  return ctx.gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: ctx.root, start: "top top", end: "bottom bottom", scrub },
  });
}
