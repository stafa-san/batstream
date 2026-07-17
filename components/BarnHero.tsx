"use client";

import { useState } from "react";
import type { Night, Site } from "@/lib/types";
import BarnScene, { HERO_H } from "./BarnScene";
import ChatPanel from "./ChatPanel";
import LiveStream from "./LiveStream";

// The hero + the Porch. The chat is hidden by default and slides in over
// the scene when summoned — the window stays centered either way.
export default function BarnHero({
  site,
  night,
}: {
  site: Site;
  night: Night;
}) {
  const [porchOpen, setPorchOpen] = useState(false);

  const porchButton = (
    <button
      type="button"
      onClick={() => setPorchOpen((o) => !o)}
      aria-expanded={porchOpen}
      aria-controls="porch-panel"
      className="flex items-center gap-2 border border-edge bg-paper px-3.5 py-2 text-[0.82rem] font-bold text-ink shadow-paper transition-transform duration-[120ms] ease-thunk hover:bg-paper-2 active:translate-y-[2px]"
    >
      <svg viewBox="0 0 20 18" className="h-4 w-4 text-ember-deep" aria-hidden="true">
        <path
          d="M2 2 h16 v10 h-9 l-4 4 v-4 h-3 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      The Porch
    </button>
  );

  return (
    <section>
      {/* ---------- md+: centered scene, porch slides over ---------- */}
      <div className="relative hidden overflow-hidden md:block">
        <BarnScene site={site} night={night} />
        <div className="absolute right-5 top-5">{porchButton}</div>
        <div
          id="porch-panel"
          className={
            "absolute inset-y-0 right-0 w-[clamp(300px,24vw,380px)] shadow-[-8px_0_24px_rgba(34,30,24,0.12)] transition-transform duration-300 ease-thunk " +
            (porchOpen ? "translate-x-0" : "translate-x-full")
          }
          aria-hidden={!porchOpen}
        >
          <ChatPanel
            slug={site.slug}
            className="h-full"
            onClose={() => setPorchOpen(false)}
          />
        </div>
      </div>

      {/* ---------- mobile: window, then porch on demand ---------- */}
      <div className="md:hidden">
        <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-8">
          <LiveStream site={site} night={night} />
          <div className="mt-3">{porchButton}</div>
        </div>
        {porchOpen ? (
          <ChatPanel
            slug={site.slug}
            className="mt-3 h-[380px] border-t"
            onClose={() => setPorchOpen(false)}
          />
        ) : null}
      </div>
    </section>
  );
}
