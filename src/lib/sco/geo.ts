import { regions } from "./content";

const PLACES: Record<string, string[]> = {
  pennsylvania: ["pa", "pennsylvania", "philadelphia", "pittsburgh", "harrisburg", "allentown", "erie", "lancaster", "reading"],
  maryland: ["md", "maryland", "baltimore", "annapolis", "rockville", "frederick", "bethesda", "silver spring"],
  virginia: ["va", "virginia", "richmond", "arlington", "alexandria", "norfolk", "fairfax", "reston", "roanoke"],
  "washington-dc": ["dc", "d c", "washington dc", "district of columbia"],
};

/** Maps a ZIP / city / county / state string to one of the four service regions. */
export function detectRegion(input: string): string | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  const zip = raw.match(/\b(\d{5})\b/);
  if (zip) {
    const n = parseInt(zip[1].slice(0, 3), 10);
    if (n === 200 || (n >= 202 && n <= 205)) return "washington-dc";
    if (n >= 206 && n <= 219) return "maryland";
    if (n === 201 || (n >= 220 && n <= 246)) return "virginia";
    if (n >= 150 && n <= 196) return "pennsylvania";
    return null;
  }
  const padded = ` ${raw.replace(/[,.]/g, " ").replace(/\s+/g, " ")} `;
  for (const [slug, words] of Object.entries(PLACES)) {
    if (words.some((w) => padded.includes(` ${w} `))) return slug;
  }
  return null;
}

export function regionName(slug: string | null) {
  return regions.find((r) => r.slug === slug)?.name ?? null;
}
