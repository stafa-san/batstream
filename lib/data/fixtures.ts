// Deterministic demo season — one source of truth used by BOTH the demo
// fallback (when Firebase isn't configured/seeded) and scripts/seed.ts.
// Shapes match docs/DESIGN.md §5 and §9 exactly.
import type {
  Clip,
  Night,
  Site,
  Species,
  TallyBucket,
  ViewerGeo,
} from "@/lib/types";

export const SITE_SLUG = "winton-woods-bat-barn";
const SEASON_YEAR = 2026;

/** Mulberry32 — small, seeded, stable across runs. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const site: Site = {
  id: "site-winton-woods",
  name: "The Winton Woods Bat Barn",
  slug: SITE_SLUG,
  locationLabel: "Winton Woods, Hamilton County, Ohio",
  isLocationProtected: true,
  timeZone: "America/New_York",
  status: "Live",
  streamUrl: process.env.NEXT_PUBLIC_STREAM_URL ?? "",
  seasonStart: `${SEASON_YEAR}-05-15`,
  seasonEnd: `${SEASON_YEAR}-08-31`,
};

/* ---------------- sunset & night math ---------------- */

function dayOfYear(d: Date): number {
  return Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000,
  );
}

/** Approximate Cincinnati sunset (local minutes after midnight, EDT). */
export function sunsetMinutes(date: Date): number {
  const d = dayOfYear(date);
  // 21:09 at the solstice (day ~172), quadratic falloff — good to ±5 min.
  return Math.round(1269 - Math.pow(d - 172, 2) * 0.0125);
}

function localDateAt(dateIso: string, minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  // Season is entirely EDT (UTC-4).
  return `${dateIso}T${hh}:${mm}:00-04:00`;
}

export function seasonDates(): string[] {
  const out: string[] = [];
  const start = new Date(`${SEASON_YEAR}-05-15T12:00:00-04:00`);
  const end = new Date(`${SEASON_YEAR}-08-31T12:00:00-04:00`);
  for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * The shape of a night (docs/DESIGN.md §9): near-zero by day, a steep ramp
 * ~20 min before sunset, a peak shortly after, a taper. `t` is minutes
 * relative to sunset.
 */
export function activityAt(t: number): number {
  if (t < -25) return 0.02;
  return Math.exp(-Math.pow((t - 16) / 24, 2)) + 0.03;
}

/** Seasonal envelope: colony + audience ramp to a mid-July peak, then taper. */
function seasonEnvelope(dateIso: string): number {
  const d = dayOfYear(new Date(`${dateIso}T12:00:00-04:00`));
  const peak = 193; // ~July 12
  return 0.35 + 0.65 * Math.exp(-Math.pow((d - peak) / 42, 2));
}

export function makeNight(dateIso: string): Night {
  const rand = prng(hashCode(dateIso));
  const noon = new Date(`${dateIso}T12:00:00-04:00`);
  const sunsetMin = sunsetMinutes(noon);
  const suppressed = rand() < 0.08; // a few cold/rainy nights
  const env = seasonEnvelope(dateIso) * (suppressed ? 0.22 : 1);
  const night: Night = {
    id: `night-${dateIso}`,
    siteId: site.id,
    date: dateIso,
    sunset: localDateAt(dateIso, sunsetMin),
    streamOpen: localDateAt(dateIso, sunsetMin - 30),
    streamClose: localDateAt(dateIso, 24 * 60 - 1),
    stampTotal: 0, // filled from buckets below
    watcherPeak: Math.round(60 + env * (180 + rand() * 160)),
    clipCount: 0,
    note: suppressed ? "Cold and rainy — the barn stayed quiet." : undefined,
  };
  night.stampTotal = makeBuckets(night).reduce((s, b) => s + b.stampCount, 0);
  night.clipCount = clips.filter((c) => c.nightId === night.id).length;
  return night;
}

/** 5-minute buckets from streamOpen to streamClose. */
export function makeBuckets(night: Night): TallyBucket[] {
  const rand = prng(hashCode(night.id));
  const open = new Date(night.streamOpen).getTime();
  const close = new Date(night.streamClose).getTime();
  const sunset = new Date(night.sunset).getTime();
  const env = seasonEnvelope(night.date) * (night.note ? 0.22 : 1);
  const buckets: TallyBucket[] = [];
  for (let t = open; t < close; t += 5 * 60000) {
    const rel = (t - sunset) / 60000;
    const a = activityAt(rel);
    const stampCount = Math.round(a * env * 90 * (0.7 + rand() * 0.6));
    const watcherCount = Math.round(
      night.watcherPeak * (0.45 + 0.55 * Math.min(1, a + 0.1)) * (0.9 + rand() * 0.2),
    );
    const bucketStart = new Date(t).toISOString();
    buckets.push({
      id: `${night.id}_${bucketStart}`,
      siteId: site.id,
      nightId: night.id,
      bucketStart,
      stampCount,
      watcherCount,
    });
  }
  return buckets;
}

/* ---------------- clips (the board) ---------------- */

const clipSeeds: Array<[string, string, number, boolean]> = [
  ["2026-07-09", "Three of them, low over the beams", 214, true],
  ["2026-07-01", "The first big circle of the night", 187, true],
  ["2026-07-05", "Right past the camera — close one", 159, false],
  ["2026-06-29", "A slow loop under the ridge line", 121, false],
  ["2026-06-27", "Two crossing paths mid-frame", 104, false],
  ["2026-06-23", "The whole roost stirring at once", 98, false],
  ["2026-07-11", "One drops from the rafters", 91, false],
  ["2026-07-13", "Figure-eights above the door", 86, false],
  ["2026-06-19", "A long glide, corner to corner", 74, false],
  ["2026-07-15", "The busiest five minutes so far", 69, false],
  ["2026-06-15", "Something small and quick", 55, false],
  ["2026-06-08", "First clear pass of the season", 51, false],
  ["2026-05-28", "A shape against the vent light", 38, false],
  ["2026-05-19", "Opening night — was that one?", 33, false],
];

export const clips: Clip[] = clipSeeds.map(([date, caption, keepCount, isFeatured], i) => {
  const rand = prng(hashCode(date + caption));
  const noon = new Date(`${date}T12:00:00-04:00`);
  const min = sunsetMinutes(noon) + 5 + Math.floor(rand() * 55);
  return {
    id: `clip-${String(i + 1).padStart(2, "0")}`,
    siteId: site.id,
    nightId: `night-${date}`,
    capturedAt: localDateAt(date, min),
    mediaUrl: "",
    thumbUrl: "", // thumbnails are drawn locally from the clip id (demo)
    caption,
    keepCount,
    isFeatured,
  };
});

/* ---------------- field guide (no counts, no detections) ---------------- */

export const speciesList: Species[] = [
  {
    id: "big-brown",
    commonName: "Big Brown Bat",
    scientificName: "Eptesicus fuscus",
    blurb:
      "Sturdy, loyal to a good roost, and fond of barns exactly like this one. If anyone is upstairs, the smart money starts here.",
    illustrationKey: "big-brown",
    iucn: "LC",
    iucnName: "Least Concern",
    tags: [],
  },
  {
    id: "little-brown",
    commonName: "Little Brown Bat",
    scientificName: "Myotis lucifugus",
    blurb:
      "Once the most common bat on the continent. White-nose syndrome has erased over 90% of some populations — every possible roost matters now.",
    illustrationKey: "little-brown",
    iucn: "EN",
    iucnName: "Endangered",
    tags: ["WNS-affected"],
  },
  {
    id: "eastern-red",
    commonName: "Eastern Red Bat",
    scientificName: "Lasiurus borealis",
    blurb:
      "A fiery-furred loner that roosts in tree leaves, not rafters — but hunts the meadows around the barn at dusk.",
    illustrationKey: "eastern-red",
    iucn: "LC",
    iucnName: "Least Concern",
    tags: [],
  },
  {
    id: "hoary",
    commonName: "Hoary Bat",
    scientificName: "Lasiurus cinereus",
    blurb:
      "Ohio's largest bat, wearing frosted silver fur. A long-distance migrant that passes through in spring and fall.",
    illustrationKey: "hoary",
    iucn: "LC",
    iucnName: "Least Concern",
    tags: ["Migratory"],
  },
  {
    id: "tricolored",
    commonName: "Tricolored Bat",
    scientificName: "Perimyotis subflavus",
    blurb:
      "Small enough to mistake for a moth. Hit hard by white-nose syndrome and proposed for US endangered listing.",
    illustrationKey: "tricolored",
    iucn: "VU",
    iucnName: "Vulnerable",
    tags: ["Proposed US endangered", "WNS-affected"],
  },
  {
    id: "indiana",
    commonName: "Indiana Bat",
    scientificName: "Myotis sodalis",
    blurb:
      "Federally endangered since 1967. Summers in wooded corridors just like this one — which is part of why this barn exists.",
    illustrationKey: "indiana",
    iucn: "NT",
    iucnName: "Near Threatened",
    tags: ["US ESA: Endangered"],
  },
];

/* ---------------- viewer geography ---------------- */

export const viewerGeo: ViewerGeo[] = [
  ["US", "United States", 61],
  ["CA", "Canada", 8],
  ["GB", "United Kingdom", 6],
  ["DE", "Germany", 5],
  ["NL", "Netherlands", 4],
  ["BR", "Brazil", 3],
  ["IN", "India", 2],
  ["XX", "36 more countries", 11],
].map(([code, name, count]) => ({
  id: `geo-${code}`,
  siteId: site.id,
  countryCode: code as string,
  countryName: name as string,
  count: count as number,
}));

/* ---------------- season assembly ---------------- */

let seasonCache: Night[] | null = null;

/** Every night of the season up to (and including) `today`. */
export function pastNights(todayIso: string): Night[] {
  if (!seasonCache) seasonCache = seasonDates().map(makeNight);
  return seasonCache.filter((n) => n.date <= todayIso);
}

export function nightFor(dateIso: string): Night | null {
  const dates = seasonDates();
  if (!dates.includes(dateIso)) return null;
  return makeNight(dateIso);
}
