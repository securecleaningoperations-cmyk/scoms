import { useId, type CSSProperties, type ReactNode } from "react";
import type { SceneVariant } from "@/lib/sco/content";
import { clips, scenePoster } from "@/lib/sco/media";

const CROPS = ["50% 50%", "20% 60%", "80% 40%", "35% 30%", "65% 70%", "10% 50%", "90% 55%", "50% 20%"];

/**
 * One-point-perspective commercial interior, drawn in SVG, with separate "grime" and "gloss"
 * layers that scroll/scrub timelines drive through CSS variables:
 *   --clean   0..1  default driver for haze/dust/streaks/gloss
 *   --haze --dust --streak --gloss --plastic --light  individual overrides
 *   --sweep   % position of a slanted cleaning edge (needs `sweep` prop)
 *
 * It is an illustrated stand-in, not footage. `media` lets real footage/stills be dropped in
 * later without touching any animation code.
 */

const VP = { x: 80, y: 40 };
const K = 1.857; // back wall sits at depth 1 => scale .35
const sc = (d: number) => 1 / (1 + K * d);
const P = (x: number, y: number, d: number) => {
  const s = sc(d);
  return `${(VP.x + (x - VP.x) * s).toFixed(2)},${(VP.y + (y - VP.y) * s).toFixed(2)}`;
};
const poly = (pts: string[]) => pts.join(" ");

const lampRuns: [number, number][] = [[0.03, 0.1], [0.17, 0.27], [0.36, 0.5], [0.62, 0.78], [0.9, 1]];
const lampXs = [38, 80, 122];
const crossDepths = [0.04, 0.1, 0.18, 0.28, 0.42, 0.6, 0.82, 1];

function lamps(variant: SceneVariant) {
  const w = variant === "industrial" ? 18 : variant === "entertainment" ? 6 : 12;
  const xs = variant === "industrial" ? [30, 80, 130] : lampXs;
  return xs.flatMap((x) =>
    lampRuns.map(([a, b]) => poly([P(x - w / 2, 0, a), P(x + w / 2, 0, a), P(x + w / 2, 0, b), P(x - w / 2, 0, b)])),
  );
}

function floorLines() {
  const along: string[] = [];
  for (let x = -240; x <= 400; x += 20) along.push(`M${P(x, 90, 0)} L${P(x, 90, 1)}`);
  const across = crossDepths.map((d) => `M${P(-400, 90, d)} L${P(560, 90, d)}`);
  return [...along, ...across].join(" ");
}

function seams(side: "L" | "R", variant: SceneVariant) {
  const x = side === "L" ? 0 : 160;
  const ds = [0.12, 0.3, 0.52, 0.76, 1];
  return ds.map((d) => `M${P(x, 0, d)} L${P(x, 90, d)}`).join(" ") +
    (variant === "government" || variant === "hospitality" ? "" : ` M${P(x, 56, 0)} L${P(x, 56, 1)}`);
}

export interface EnvironmentProps {
  variant?: SceneVariant;
  className?: string;
  style?: CSSProperties;
  /** enable the slanted sweep mask (--sweep) */
  sweep?: boolean;
  media?: { src?: string; poster?: string; kind?: "video" | "image"; alt?: string };
  children?: ReactNode;
}

export default function Environment({ variant = "office", className = "", style, sweep, media, children }: EnvironmentProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const lampPolys = lamps(variant);
  const isConstruction = variant === "construction";
  const isIndustrial = variant === "industrial";
  // Real footage stills by default; the SVG stays underneath as a loading fallback.
  const hash = Array.from(uid).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const real = media?.src ? media : { kind: "image" as const, src: clips[scenePoster[variant] ?? "team"].posterSm, alt: "" };
  const crop = media?.src ? undefined : CROPS[hash % CROPS.length];

  return (
    <div className={`env env--real ${sweep ? "env--sweep" : ""} ${className}`} data-variant={variant} style={style} aria-hidden="true">
      <svg className="env-svg" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--e-sky1)" />
            <stop offset="1" stopColor="var(--e-sky2)" />
          </linearGradient>
          <linearGradient id={`wall${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--e-wall)" />
            <stop offset="1" stopColor="var(--e-wall2)" />
          </linearGradient>
          <linearGradient id={`wallR${uid}`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="var(--e-wall)" />
            <stop offset="1" stopColor="var(--e-wall2)" />
          </linearGradient>
          <linearGradient id={`floor${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--e-floor)" />
            <stop offset="1" stopColor="var(--e-floor2)" />
          </linearGradient>
          <linearGradient id={`ceil${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--e-ceil)" />
            <stop offset="1" stopColor="var(--e-ceil2)" />
          </linearGradient>
        </defs>

        {/* exterior beyond the glass */}
        <rect x="52" y="26" width="56" height="31.5" fill={`url(#sky${uid})`} />
        <g fill="var(--e-city)" opacity=".75">
          <rect x="54" y="43" width="5" height="14.5" /><rect x="60" y="38" width="4" height="19.5" />
          <rect x="65" y="46" width="7" height="11.5" /><rect x="73" y="35" width="4.5" height="22.5" />
          <rect x="79" y="44" width="6" height="13.5" /><rect x="86" y="39" width="4" height="18.5" />
          <rect x="91" y="47" width="8" height="10.5" /><rect x="100" y="41" width="5" height="16.5" />
        </g>

        {/* floor */}
        <polygon points={poly([P(-400, 90, 0), P(560, 90, 0), P(560, 90, 1), P(-400, 90, 1)])} fill={`url(#floor${uid})`} />
        <path d={floorLines()} stroke="var(--e-grid)" strokeWidth=".12" fill="none" />
        {isIndustrial && (
          <g stroke="var(--e-accent)" strokeWidth=".9" fill="none" opacity=".85">
            <path d={`M${P(34, 90, 0)} L${P(34, 90, 1)}`} />
            <path d={`M${P(126, 90, 0)} L${P(126, 90, 1)}`} />
          </g>
        )}

        {/* ceiling */}
        <polygon points={poly([P(0, 0, 0), P(160, 0, 0), P(160, 0, 1), P(0, 0, 1)])} fill={`url(#ceil${uid})`} />
        {isConstruction ? (
          <g stroke="var(--e-grid)" strokeWidth=".25" opacity=".55" fill="none">
            {[28, 80, 132].map((x) => <path key={x} d={`M${P(x, 0, 0)} L${P(x, 0, 1)}`} />)}
            {crossDepths.map((d) => <path key={d} d={`M${P(0, 0, d)} L${P(160, 0, d)}`} />)}
          </g>
        ) : (
          lampPolys.map((p, i) => <polygon key={i} points={p} className="env-lamp" />)
        )}

        {/* side walls */}
        <polygon points={poly([P(0, 0, 0), P(0, 0, 1), P(0, 90, 1), P(0, 90, 0)])} fill={`url(#wall${uid})`} />
        <polygon points={poly([P(160, 0, 0), P(160, 0, 1), P(160, 90, 1), P(160, 90, 0)])} fill={`url(#wallR${uid})`} />
        <path d={seams("L", variant)} stroke="var(--e-seam)" strokeWidth=".18" fill="none" />
        <path d={seams("R", variant)} stroke="var(--e-seam)" strokeWidth=".18" fill="none" />

        {/* right wall glazing */}
        {!isIndustrial && (
          <g>
            {[[0.1, 0.34], [0.4, 0.62], [0.68, 0.9]].map(([a, b], i) => (
              <polygon key={i} points={poly([P(160, 14, a), P(160, 14, b), P(160, 66, b), P(160, 66, a)])} fill="var(--e-glass)" opacity=".8" />
            ))}
          </g>
        )}
        {(variant === "healthcare" || variant === "education") && (
          <g fill="var(--e-door)">
            {[[0.12, 0.2], [0.34, 0.44], [0.58, 0.7]].map(([a, b], i) => (
              <polygon key={i} points={poly([P(0, 24, a), P(0, 24, b), P(0, 74, b), P(0, 74, a)])} />
            ))}
          </g>
        )}
        {(variant === "government" || variant === "hospitality") && (
          <g fill="var(--e-column)">
            {[0.16, 0.42, 0.72].map((d, i) => (
              <g key={i}>
                <polygon points={poly([P(22, 0, d), P(32, 0, d), P(32, 90, d), P(22, 90, d)])} />
                <polygon points={poly([P(128, 0, d), P(138, 0, d), P(138, 90, d), P(128, 90, d)])} />
              </g>
            ))}
          </g>
        )}
        {isIndustrial && (
          <g stroke="var(--e-accent)" strokeWidth=".35" fill="none" opacity=".8">
            {[0.1, 0.3, 0.56, 0.86].map((d, i) => (
              <g key={i}>
                <path d={`M${P(4, 10, d)} L${P(4, 80, d)} M${P(4, 28, d)} L${P(4, 28, d + 0.2)} M${P(4, 52, d)} L${P(4, 52, d + 0.2)}`} />
              </g>
            ))}
          </g>
        )}
        {variant === "entertainment" && (
          <g>
            <polygon points={poly([P(40, 8, 1), P(120, 8, 1), P(120, 82, 1), P(40, 82, 1)])} fill="var(--e-accent)" opacity=".55" />
            {[0.2, 0.34, 0.5, 0.68].map((d, i) => (
              <polygon key={i} points={poly([P(30, 74, d), P(130, 74, d), P(130, 90, d), P(30, 90, d)])} fill="var(--e-door)" opacity=".5" />
            ))}
          </g>
        )}

        {/* glass curtain wall (back) mullions */}
        <g stroke="var(--e-mullion)" strokeWidth=".3" fill="none">
          {Array.from({ length: 9 }, (_, i) => 52 + i * 7).map((x) => <path key={x} d={`M${x},26 L${x},57.5`} />)}
          <path d="M52,41.5 L108,41.5" strokeWidth=".2" />
          <rect x="52" y="26" width="56" height="31.5" strokeWidth=".5" />
        </g>
      </svg>

      {real.src && (real.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="env-media" src={real.src} alt={real.alt ?? ""} loading="lazy" decoding="async" style={crop ? { objectPosition: crop } : undefined} />
      ) : (
        <video className="env-media" src={real.src} poster={media?.poster} muted loop playsInline autoPlay preload="metadata" />
      ))}

      {/* GLOSS (appears as it is cleaned) */}
      <div className="env-gloss">
        <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="env-svg">
          <defs>
            <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--e-lamp)" stopOpacity=".7" />
              <stop offset="1" stopColor="var(--e-lamp)" stopOpacity="0" />
            </linearGradient>
            <filter id={`b${uid}`}><feGaussianBlur stdDeviation=".7" /></filter>
          </defs>
          <g filter={`url(#b${uid})`}>
            {(isConstruction ? [] : [50, 66, 80, 94, 110]).map((x, i) => (
              <polygon key={i} points={`${x - 1.4},57.5 ${x + 1.4},57.5 ${80 + (x - 80) * 1.9 + 3},90 ${80 + (x - 80) * 1.9 - 3},90`} fill={`url(#g${uid})`} opacity={i === 2 ? 0.9 : 0.55} />
            ))}
            <polygon points="52,57.5 108,57.5 108,60 52,60" fill="var(--e-lamp)" opacity=".5" />
          </g>
          <polygon points="0,90 52,57.5 108,57.5 160,90" fill="var(--e-lamp)" opacity=".07" />
          <polygon points="54,27 70,27 59,57 54,57" fill="#fff" opacity=".12" />
          <polygon points="76,27 86,27 75,57 66,57" fill="#fff" opacity=".07" />
        </svg>
        <div className="g-light" />
      </div>

      {/* GRIME (disappears as it is cleaned) */}
      <div className="env-grime">
        <div className="g-floor" />
        <div className="g-haze" />
        <div className="g-streak" />
        <div className="g-smudge" />
        <div className="g-dust" />
        {isConstruction && <div className="env-plastic" />}
      </div>

      {children}
    </div>
  );
}
