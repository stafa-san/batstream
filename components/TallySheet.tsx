"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Night, TallyBucket, TallyState } from "@/lib/types";
import { subscribeToStampPulse, subscribeToTally } from "@/lib/data";
import { prng } from "@/lib/data/fixtures";

// THE TALLY STRIP (UI-DESIGN.md §4) — not a line chart. Ruled paper,
// sunset marked, time along the bottom; every stamp is a small ember ink
// mark stacked in its 5-minute column. Density IS the curve. Your own
// marks are darker — you can find yourself in it.

const COL_W = 17;
const MARKS_H = 132;
const TOP = 24;
const AXIS_H = 30;
const MAX_DRAW = 110; // per-column draw cap (visual density saturates anyway)

function hourLabel(iso: string, tz?: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    ...(tz ? { timeZone: tz } : {}),
  });
}

export default function TallySheet({
  night,
  slug,
  live = true,
  buckets: staticBuckets,
}: {
  night: Night;
  slug: string;
  /** false → render a finished night (The Log) with no subscriptions. */
  live?: boolean;
  buckets?: TallyBucket[];
}) {
  const [state, setState] = useState<TallyState | null>(
    staticBuckets
      ? {
          nightId: night.id,
          total: staticBuckets.reduce((s, b) => s + b.stampCount, 0),
          buckets: staticBuckets,
        }
      : null,
  );
  const [ownByBucket, setOwnByBucket] = useState<Record<string, number>>({});
  const [pulseBucket, setPulseBucket] = useState<string | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!live) return;
    const un1 = subscribeToTally(slug, night.id, setState);
    const un2 = subscribeToStampPulse(slug, (p) => {
      if (p.own) {
        setOwnByBucket((m) => ({
          ...m,
          [p.bucketStart]: (m[p.bucketStart] ?? 0) + 1,
        }));
      }
      setPulseBucket(p.bucketStart);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      pulseTimer.current = setTimeout(() => setPulseBucket(null), 320);
    });
    return () => {
      un1();
      un2();
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [live, slug, night.id]);

  const buckets = state?.buckets ?? [];
  const total = state?.total ?? 0;

  const busiest = useMemo(() => {
    if (!buckets.length) return null;
    const b = buckets.reduce((a, c) => (c.stampCount > a.stampCount ? c : a));
    return b.stampCount > 0 ? b : null;
  }, [buckets]);

  const width = buckets.length * COL_W + 24;
  const height = TOP + MARKS_H + AXIS_H;
  const sunsetT = new Date(night.sunset).getTime();

  // Hour tick positions.
  const hourTicks = useMemo(() => {
    const ticks: Array<{ x: number; label: string }> = [];
    buckets.forEach((b, i) => {
      const d = new Date(b.bucketStart);
      if (d.getMinutes() === 0) {
        ticks.push({ x: 12 + i * COL_W, label: hourLabel(b.bucketStart) });
      }
    });
    return ticks;
  }, [buckets]);

  const sunsetX = useMemo(() => {
    const i = buckets.findIndex(
      (b) =>
        sunsetT >= new Date(b.bucketStart).getTime() &&
        sunsetT < new Date(b.bucketStart).getTime() + 5 * 60000,
    );
    return i >= 0 ? 12 + i * COL_W + COL_W / 2 : null;
  }, [buckets, sunsetT]);

  const label = busiest
    ? `Tonight's tally: ${total.toLocaleString()} stamps so far, busiest around ${new Date(
        busiest.bucketStart,
      ).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}.`
    : `Tonight's tally: ${total.toLocaleString()} stamps so far.`;

  return (
    <div className="paper-card bg-kraft p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-display text-xl font-black">
          {live ? "Tonight's tally sheet" : "The night's tally sheet"}
        </h2>
        <p aria-live={live ? "polite" : undefined} className="text-[0.95rem] text-ink-2">
          <span className="tnum font-bold text-ember-deep">
            {total.toLocaleString()}
          </span>{" "}
          stamps{live ? " so far" : ""} · raw marks, no smoothing
        </p>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${Math.max(width, 320)} ${height}`}
          width={Math.max(width, 320)}
          height={height}
          role="img"
          aria-label={label}
          className="block"
        >
          {/* ruled paper */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              x2={width}
              y1={TOP + (MARKS_H / 4) * i}
              y2={TOP + (MARKS_H / 4) * i}
              stroke="var(--edge)"
              strokeWidth="1"
              opacity="0.55"
            />
          ))}
          {/* sunset mark */}
          {sunsetX !== null ? (
            <g>
              <line
                x1={sunsetX}
                x2={sunsetX}
                y1={TOP - 6}
                y2={TOP + MARKS_H}
                stroke="var(--dusk)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={sunsetX + 6}
                y={12}
                fontSize="10.5"
                fontWeight="700"
                fill="var(--dusk)"
                fontFamily="var(--font-atkinson)"
              >
                sunset{" "}
                {new Date(night.sunset)
                  .toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                  .toLowerCase()}
              </text>
            </g>
          ) : null}
          {/* marks */}
          {buckets.map((b, bi) => {
            const n = b.stampCount;
            if (n <= 0) return null;
            const draw = Math.min(n, MAX_DRAW);
            const gap = Math.min(4.4, MARKS_H / draw);
            const rand = prng(
              bi * 7919 + night.id.length * 131 + Math.min(n, 500),
            );
            const own = ownByBucket[b.bucketStart] ?? 0;
            const x0 = 12 + bi * COL_W;
            const marks = [];
            for (let i = 0; i < draw; i++) {
              const isOwn = i >= draw - Math.min(own, draw);
              const y = TOP + MARKS_H - 3 - i * gap;
              const jx = (rand() - 0.5) * 5;
              const rot = (rand() - 0.5) * 16;
              const isPulse =
                pulseBucket === b.bucketStart && i === draw - 1;
              marks.push(
                <rect
                  key={i}
                  x={x0 + 3 + jx}
                  y={y}
                  width="9"
                  height="2.4"
                  rx="1.2"
                  transform={`rotate(${rot.toFixed(1)} ${x0 + 7 + jx} ${y + 1})`}
                  fill={isOwn ? "var(--ember-deep)" : "var(--ember)"}
                  opacity={isOwn ? 1 : 0.82}
                  className={isPulse ? "ink-land" : undefined}
                  style={isPulse ? { transformOrigin: `${x0 + 7}px ${y}px` } : undefined}
                />,
              );
            }
            return <g key={b.id}>{marks}</g>;
          })}
          {/* baseline + hours */}
          <line
            x1="0"
            x2={width}
            y1={TOP + MARKS_H + 4}
            y2={TOP + MARKS_H + 4}
            stroke="var(--ink-3)"
            strokeWidth="1.2"
          />
          {hourTicks.map((t) => (
            <g key={t.x}>
              <line
                x1={t.x}
                x2={t.x}
                y1={TOP + MARKS_H + 4}
                y2={TOP + MARKS_H + 9}
                stroke="var(--ink-3)"
                strokeWidth="1.2"
              />
              <text
                x={t.x}
                y={TOP + MARKS_H + 22}
                fontSize="10.5"
                fill="var(--ink-2)"
                fontFamily="var(--font-atkinson)"
                textAnchor="middle"
              >
                {t.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {live ? (
        <p className="mt-2 text-[0.85rem] text-ink-3">
          Every mark is one person&apos;s stamp, five-minute columns, nothing
          smoothed. Your marks are the darker ones.
        </p>
      ) : null}
    </div>
  );
}
