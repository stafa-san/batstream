"use client";

import { useState } from "react";
import { keepMoment } from "@/lib/data";

// THE KEEP (UI-DESIGN.md §4) — a paper-clip action, not a heart.
// The stakes are literal: the recorder overwrites itself.
export default function KeepButton({ slug }: { slug: string }) {
  const [kept, setKept] = useState(false);
  const [busy, setBusy] = useState(false);

  async function keep() {
    if (busy || kept) return;
    setBusy(true);
    try {
      await keepMoment(slug, new Date().toISOString());
      setKept(true);
      setTimeout(() => setKept(false), 6000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <button
        type="button"
        onClick={keep}
        className="inline-flex items-center gap-2 border border-edge bg-paper px-4 py-2 font-bold text-ink shadow-paper transition-transform duration-[120ms] ease-thunk active:translate-y-[3px] active:shadow-none"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-dusk" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M8 12.5 L 15.5 5 a 3.2 3.2 0 0 1 4.5 4.5 L 10.5 19 a 5 5 0 0 1 -7 -7 L 12.8 2.7"
          />
        </svg>
        {kept ? "Kept. It won't be overwritten." : "Keep this"}
      </button>
      <p className="max-w-[30ch] text-[0.85rem] text-ink-3">
        The barn&apos;s recorder holds about two weeks.{" "}
        <span className="font-bold text-ink-2">What nobody keeps is gone.</span>
      </p>
    </div>
  );
}
