import type { Night, TallyBucket } from "@/lib/types";

// A night at shelf scale: bucket densities as tiny ember columns.
export default function MiniTally({
  night,
  buckets,
}: {
  night: Night;
  buckets: TallyBucket[];
}) {
  const max = Math.max(1, ...buckets.map((b) => b.stampCount));
  const w = buckets.length * 3.4 + 4;
  const sunsetT = new Date(night.sunset).getTime();
  const sunsetI = buckets.findIndex(
    (b) =>
      sunsetT >= new Date(b.bucketStart).getTime() &&
      sunsetT < new Date(b.bucketStart).getTime() + 5 * 60000,
  );
  return (
    <svg
      viewBox={`0 0 ${w} 34`}
      className="h-8 w-full max-w-[190px]"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
    >
      <line x1="0" x2={w} y1="31" y2="31" stroke="var(--edge)" strokeWidth="1" />
      {sunsetI >= 0 ? (
        <line
          x1={2 + sunsetI * 3.4}
          x2={2 + sunsetI * 3.4}
          y1="2"
          y2="31"
          stroke="var(--dusk)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.7"
        />
      ) : null}
      {buckets.map((b, i) =>
        b.stampCount > 0 ? (
          <rect
            key={b.id}
            x={2 + i * 3.4}
            y={30 - (b.stampCount / max) * 26}
            width="2.3"
            height={(b.stampCount / max) * 26 + 1}
            fill="var(--ember)"
            opacity="0.85"
          />
        ) : null,
      )}
    </svg>
  );
}
