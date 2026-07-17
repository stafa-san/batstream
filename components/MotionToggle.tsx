"use client";

import { useEffect, useState } from "react";

// The visible half of the double motion gate (UI-DESIGN.md §5).
// The pre-hydration script in layout.tsx sets the initial attribute so
// nothing flashes; this control just flips and persists it.
export default function MotionToggle() {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(document.documentElement.dataset.motion !== "off");
  }, []);

  function toggle() {
    const next = !(on ?? true);
    document.documentElement.dataset.motion = next ? "on" : "off";
    try {
      localStorage.setItem("motion", next ? "on" : "off");
    } catch {}
    setOn(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on === false}
      className="rounded-sm border border-edge bg-paper-2 px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-2 hover:text-ink"
    >
      Motion {on === false ? "off" : "on"}
    </button>
  );
}
