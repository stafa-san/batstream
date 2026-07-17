"use client";

import { useEffect, useState } from "react";
import type { Night, Site } from "@/lib/types";
import { subscribeToTally } from "@/lib/data";

// Inked, conversational status (UI-DESIGN.md §4). "Awake" is derived from
// the tally itself — if marks are landing, the barn is awake. Honest and
// transport-agnostic.
export default function StatusLine({
  site,
  night,
}: {
  site: Site;
  night: Night;
}) {
  const [awake, setAwake] = useState<boolean | null>(null);

  useEffect(
    () =>
      subscribeToTally(site.slug, night.id, (s) => {
        const withMarks = s.buckets.filter((b) => b.stampCount > 0);
        setAwake(withMarks.length > 0);
      }),
    [site.slug, night.id],
  );

  const sunset = new Date(night.sunset).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: site.timeZone,
  });
  const stir = new Date(
    new Date(night.sunset).getTime() - 20 * 60000,
  ).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: site.timeZone,
  });

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
      <p className="text-lg">
        {awake === null ? (
          <span className="text-ink-3">Checking the barn…</span>
        ) : awake ? (
          <>
            <span className="font-bold">The barn is awake</span>
            <span className="text-ink-2"> — sunset was {sunset}.</span>
          </>
        ) : (
          <>
            <span className="font-bold">Quiet.</span>
            <span className="text-ink-2"> They usually stir around {stir}.</span>
          </>
        )}
      </p>
      <p className="text-[0.85rem] text-ink-3">
        Nightly, 30 min before sunset → midnight · May–Aug
      </p>
    </div>
  );
}
