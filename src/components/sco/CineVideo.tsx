"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Clip } from "@/lib/sco/media";

interface Props {
  clip: Clip;
  /** Load immediately (hero). Otherwise the video is attached only when near the viewport. */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
  /** object-position for art-directed cropping, e.g. "70% 50%" */
  focus?: string;
  /** Exposed so GSAP can drive scroll-linked effects on the element itself. */
  dataAttr?: string;
}

/**
 * Poster-first cinematic background video.
 * - Shows the webp poster instantly (no blank frames), crossfades to video once it can play.
 * - Lazy-attaches the source with IntersectionObserver; pauses when off-screen so only
 *   on-screen clips decode at any time.
 * - Serves 720p on small screens / Save-Data; never plays under prefers-reduced-motion.
 * - If playback fails the poster simply remains — the section is never empty.
 */
export default function CineVideo({ clip, eager, className = "", style, focus = "50% 50%", dataAttr }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    const v = vid.current;
    if (!el || !v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const sm = window.matchMedia("(max-width: 760px)").matches || !!conn?.saveData;
    setSmall(sm);
    if (reduce) return; // poster only
    const chosen = sm ? clip.srcSm : clip.src;

    let attached = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!attached) { attached = true; setSrc(chosen); }
          else v.play().catch(() => {});
        } else if (attached) v.pause();
      },
      { rootMargin: eager ? "0px" : "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [clip, eager]);

  useEffect(() => {
    const v = vid.current;
    if (!src || !v) return;
    v.load();
    v.play().catch(() => {});
  }, [src]);

  return (
    <div ref={wrap} className={`cine ${ready ? "is-ready" : ""} ${className}`} style={style} {...(dataAttr ? { [dataAttr]: "" } : {})}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cine-poster"
        src={small ? clip.posterSm : clip.poster}
        srcSet={`${clip.posterSm} 960w, ${clip.poster} 1920w`}
        sizes="100vw"
        alt={clip.alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        style={{ objectPosition: focus }}
      />
      <video
        ref={vid}
        className="cine-video"
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        aria-hidden="true"
        tabIndex={-1}
        style={{ objectPosition: focus }}
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
        {...(src ? { src } : {})}
      />
    </div>
  );
}
