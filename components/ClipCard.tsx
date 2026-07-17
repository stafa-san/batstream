import type { Clip } from "@/lib/types";
import { prng } from "@/lib/data/fixtures";

// A kept moment, pinned to the board (UI-DESIGN.md §4): slight rotation,
// a pin at the top, paper shadow. The still is drawn deterministically from
// the clip id until real thumbnails exist.
function hashCode(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ThermalStill({ clip }: { clip: Clip }) {
  const rand = prng(hashCode(clip.id));
  const blobs = Array.from({ length: 2 + Math.floor(rand() * 3) }, () => ({
    x: 12 + rand() * 76,
    y: 15 + rand() * 55,
    r: 3 + rand() * 5,
  }));
  return (
    <svg viewBox="0 0 100 62" className="block w-full" aria-hidden="true">
      <defs>
        <radialGradient id={`heat-${clip.id}`}>
          <stop offset="0%" stopColor="#fffcf4" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffd082" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#b44614" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="62" fill="var(--night)" />
      <line x1="18" y1="0" x2="34" y2="22" stroke="#f4f0ff" strokeOpacity="0.05" strokeWidth="5" />
      <line x1="70" y1="0" x2="86" y2="20" stroke="#f4f0ff" strokeOpacity="0.05" strokeWidth="5" />
      {blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r * 2.2} fill={`url(#heat-${clip.id})`} />
      ))}
    </svg>
  );
}

export default function ClipCard({
  clip,
  index = 0,
}: {
  clip: Clip;
  index?: number;
}) {
  const tilt = ((hashCode(clip.id) % 7) - 3) * 0.5; // ±1.5°
  const captured = new Date(clip.capturedAt);
  return (
    <figure
      className="relative m-0 border border-edge bg-paper p-2 pb-3 shadow-paper"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* pin */}
      <span
        aria-hidden="true"
        className="absolute -top-2 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rounded-full border border-edge bg-ember shadow-[0_2px_2px_rgba(34,30,24,.25)]"
      />
      <ThermalStill clip={clip} />
      <figcaption className="mt-2 flex flex-col gap-1 px-1">
        {clip.caption ? (
          <span className="text-[0.95rem] font-bold leading-snug">
            {clip.caption}
          </span>
        ) : null}
        <span className="tnum text-[0.78rem] text-ink-3">
          {captured.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}{" "}
          ·{" "}
          {captured.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
        <span className="self-start border border-edge bg-paper-2 px-2 py-0.5 text-[0.72rem] font-bold text-ember-deep">
          kept by <span className="tnum">{clip.keepCount}</span>{" "}
          {clip.keepCount === 1 ? "person" : "people"}
        </span>
      </figcaption>
    </figure>
  );
}
