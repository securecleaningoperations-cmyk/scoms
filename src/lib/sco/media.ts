/**
 * Production media library for the public site.
 * Every clip below was generated through Higgsfield (GPT Image 2.5 keyframe → Kling 3.0 Turbo
 * image-to-video, 1080p, 5s) and re-encoded locally as a seamless ping-pong loop.
 * Full provenance lives in /public/assets/media-manifest.json.
 */
export type ClipKey = "hero" | "team" | "detail" | "facility" | "floor" | "closing";

export interface Clip {
  key: ClipKey;
  src: string;      // 1080p H.264
  srcSm: string;    // 720p H.264 for small / data-constrained screens
  poster: string;   // 1920 webp
  posterSm: string; // 960 webp
  alt: string;
}

const clip = (key: ClipKey, alt: string): Clip => ({
  key,
  src: `/assets/video/${key}.mp4`,
  srcSm: `/assets/video/${key}-720.mp4`,
  poster: `/assets/images/${key}-poster.webp`,
  posterSm: `/assets/images/${key}-poster-sm.webp`,
  alt,
});

/** Real footage stills used behind inner-page heroes (lightweight: image only). */
export const scenePoster: Record<string, ClipKey> = {
  office: "team", government: "facility", healthcare: "detail", education: "facility",
  hospitality: "hero", industrial: "floor", construction: "floor", entertainment: "closing",
};

export const clips: Record<ClipKey, Clip> = {
  hero: clip("hero", "A cleaner guides a janitorial cart across a polished corporate lobby at dusk."),
  team: clip("team", "A three-person cleaning team works in a modern office after hours."),
  detail: clip("detail", "A gloved hand draws a microfiber cloth across a walnut desk, leaving a streak-free finish."),
  facility: clip("facility", "A long, immaculate office corridor with polished floors and glass meeting rooms."),
  floor: clip("floor", "An operator runs a walk-behind auto-scrubber across a stone atrium floor."),
  closing: clip("closing", "An immaculate boardroom at blue hour, chairs aligned and the table spotless."),
};
