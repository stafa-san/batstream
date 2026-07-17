"use client";

import { useEffect, useState } from "react";
import { subscribeToWatchers } from "@/lib/data";

export default function WatcherCount({ slug }: { slug: string }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => subscribeToWatchers(slug, setN), [slug]);

  if (n === null) return null;
  return (
    <span
      aria-live="polite"
      className="inline-block rotate-1 border border-edge bg-paper px-2.5 py-1 text-[0.8rem] font-bold text-ink shadow-paper"
    >
      <span className="tnum">{n.toLocaleString()}</span>{" "}
      <span className="font-normal text-ink-2">watching</span>
    </span>
  );
}
