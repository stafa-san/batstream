"use client";

import { useRef, useState } from "react";
import { recordStamp } from "@/lib/data";

// THE STAMP (UI-DESIGN.md §4) — a rubber stamp, not a button. It sits on
// the page like an object on a desk and THUNKS down on press: translateY(5px)
// + a brief squash over ~120ms. The mark it leaves is real data.
export default function StampButton({ slug }: { slug: string }) {
  const [total, setTotal] = useState<number | null>(null);
  const [down, setDown] = useState(false);
  const lastRef = useRef(0);

  async function stamp() {
    const now = Date.now();
    if (now - lastRef.current < 650) return; // gentle client-side throttle
    lastRef.current = now;
    try {
      const state = await recordStamp(slug);
      setTotal(state.total);
    } catch {
      // The server rate-limiter said no — the thunk already happened, fine.
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={stamp}
        onPointerDown={() => setDown(true)}
        onPointerUp={() => setDown(false)}
        onPointerLeave={() => setDown(false)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") setDown(true);
        }}
        onKeyUp={() => setDown(false)}
        aria-label="Stamp — press when you see something move in the window"
        className="group relative touch-manipulation"
      >
        {/* The stamp: wooden handle in ink, ember pad. Flat, 2-tone. */}
        <svg
          viewBox="0 0 120 132"
          className={
            "h-36 w-auto transition-transform duration-[120ms] ease-thunk " +
            (down ? "translate-y-[5px] scale-y-[.93]" : "")
          }
          aria-hidden="true"
        >
          {/* knob */}
          <path
            d="M60 4 C 74 4, 82 12, 82 24 C 82 33, 76 39, 68 42 L 52 42 C 44 39, 38 33, 38 24 C 38 12, 46 4, 60 4 Z"
            fill="var(--ink)"
          />
          {/* stem */}
          <rect x="52" y="41" width="16" height="30" fill="var(--ink)" />
          {/* base block */}
          <path
            d="M28 70 L 92 70 C 98 70, 102 74, 102 80 L 102 102 L 18 102 L 18 80 C 18 74, 22 70, 28 70 Z"
            fill="var(--ink)"
          />
          {/* ember pad */}
          <rect x="14" y="102" width="92" height="14" rx="2" fill="var(--ember)" />
          {/* pad shadow on the paper */}
          <ellipse
            cx="60"
            cy="126"
            rx={down ? 50 : 44}
            ry="4.5"
            fill="var(--edge)"
            opacity={down ? 0.9 : 0.6}
          />
        </svg>
      </button>
      <div className="max-w-[26ch] text-center">
        <p className="font-display text-2xl font-black leading-tight">
          See something move? Stamp it.
        </p>
        <p className="mt-2 text-[0.92rem] text-ink-2">
          Every stamp is a measurement.{" "}
          <span className="font-bold text-ink">
            Nobody has ever counted this colony.
          </span>
        </p>
        <p aria-live="polite" className="mt-3 text-[0.95rem] text-ink-2">
          {total !== null ? (
            <>
              <span className="tnum font-bold text-ember-deep">
                {total.toLocaleString()}
              </span>{" "}
              stamps on tonight&apos;s sheet
            </>
          ) : (
            <span className="text-ink-3">Your stamp lands on the sheet below.</span>
          )}
        </p>
      </div>
    </div>
  );
}
