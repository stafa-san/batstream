import type { Species } from "@/lib/types";
import BatGlyph from "./BatGlyph";

// Field-guide plate (UI-DESIGN.md §4): cut-paper bat on kraft, common name,
// italic scientific name, two lines of character, IUCN chip. Official Red
// List colors; code AND word in ink — never color alone.
const IUCN_COLOR: Record<Species["iucn"], string> = {
  LC: "#60C659",
  NT: "#CCE226",
  VU: "#F9E814",
  EN: "#FC7F3F",
  CR: "#D81E05",
};

// Presentation-only: relative wingspan per species (cm), for plate scale.
const WINGSPAN: Record<string, number> = {
  "big-brown": 33,
  "little-brown": 25,
  "eastern-red": 30,
  hoary: 40,
  tricolored: 21,
  indiana: 24,
};

export default function SpeciesCard({ species }: { species: Species }) {
  const span = WINGSPAN[species.illustrationKey] ?? 30;
  const scale = span / 40; // hoary = full width
  const color = IUCN_COLOR[species.iucn];
  return (
    <article className="paper-card flex h-full flex-col overflow-hidden">
      <div className="relative flex aspect-[16/9] items-center justify-center border-b border-edge bg-kraft">
        {/* flight arc — the one accent on the plate */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 40"
          className="absolute inset-0 h-full w-full text-sage"
          preserveAspectRatio="none"
        >
          <path
            d="M-2 34 C 25 20, 70 30, 102 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="3 3"
            opacity="0.6"
          />
        </svg>
        <div
          className="relative"
          style={{ width: `${Math.round(scale * 52)}%` }}
        >
          <BatGlyph
            className="h-auto w-full text-ink"
            title={`${species.commonName} silhouette, wingspan about ${span} centimeters`}
          />
        </div>
        <span className="absolute bottom-2 right-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-3">
          ~{span} cm wingspan
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl font-black">{species.commonName}</h3>
        <p className="-mt-1 text-[0.9rem] italic text-ink-2">
          {species.scientificName}
        </p>
        <p className="flex-1 text-[0.95rem] text-ink-2">{species.blurb}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 border px-2 py-0.5 text-[0.74rem] font-bold text-ink"
            style={{
              borderColor: color,
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
            }}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {species.iucn} · {species.iucnName}
          </span>
          {species.tags.map((t) => (
            <span
              key={t}
              className="border border-edge px-2 py-0.5 text-[0.74rem] font-bold text-ink-2"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
