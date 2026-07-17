"use client";

import { useEffect, useRef, useState } from "react";
import type { Night, Site } from "@/lib/types";
import { handCutRectPath } from "@/lib/paper";
import BatGlyph from "./BatGlyph";
import DemoFootage from "./DemoFootage";
import WatcherCount from "./WatcherCount";

// THE WINDOW (UI-DESIGN.md §4) — a hand-cut hole in the paper.
// Not border-radius, not a rounded rect: an SVG clip with 2–4px of
// irregular wobble, and an inner shadow along the cut so it reads as
// depth *through* the page. This detail is the design.
//
// `frameless` embeds the same window inside the BarnScene illustration:
// it fills its positioned parent and drops the standalone caption.
const CUT = handCutRectPath(20260717);

type StreamState = "loading" | "playing" | "shuttered";

export default function LiveStream({
  site,
  night,
  frameless = false,
}: {
  site: Site;
  night: Night;
  frameless?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasStream = Boolean(site.streamUrl);
  const [state, setState] = useState<StreamState>(
    site.status === "Live" ? "loading" : "shuttered",
  );
  const clipId = frameless ? "window-cut-scene" : "window-cut";

  useEffect(() => {
    if (!hasStream || site.status !== "Live") {
      if (site.status === "Live") setState("playing"); // demo footage path
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    let hls: { destroy: () => void } | null = null;
    (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = site.streamUrl;
      } else {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const h = new Hls({ lowLatencyMode: true });
          h.loadSource(site.streamUrl);
          h.attachMedia(video);
          hls = h;
        }
      }
      video.addEventListener("playing", () => setState("playing"), {
        once: true,
      });
      video.play().catch(() => {});
    })();
    return () => hls?.destroy();
  }, [hasStream, site.streamUrl, site.status]);

  const sunsetLabel = new Date(night.sunset).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: site.timeZone,
  });

  return (
    <figure className={frameless ? "relative m-0 h-full w-full" : "relative m-0"}>
      {/* The cut — shared by the footage layer and the inner shadow. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={CUT} />
          </clipPath>
        </defs>
      </svg>

      <div
        className={
          (frameless ? "relative h-full w-full" : "relative aspect-video w-full") +
          " bg-night"
        }
        style={{ clipPath: `url(#${clipId})` }}
        role="group"
        aria-label={`Live window into ${site.name}. ${
          site.isLocationProtected ? "Location protected for conservation." : ""
        }`}
      >
        {state === "shuttered" ? (
          <Shutter night={night} sunsetLabel={sunsetLabel} />
        ) : hasStream ? (
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <DemoFootage />
        )}

        {/* Loading: a drawn bat circling — never a black rectangle. */}
        {state === "loading" && hasStream ? (
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="h-40 w-40"
              style={{ animation: "orbit 5s linear infinite" }}
            >
              <div
                className="ml-auto h-10 w-14"
                style={{ animation: "orbit-counter 5s linear infinite" }}
              >
                <BatGlyph className="h-full w-full text-paper/80" />
              </div>
            </div>
          </div>
        ) : null}

        {/* LIVE — a hand-drawn ember mark, not a Twitch pill. */}
        {state !== "shuttered" ? (
          <div
            className={
              "absolute flex -rotate-2 items-center gap-2 " +
              "left-4 top-4"
            }
          >
            <svg
              viewBox="0 0 20 20"
              className={"live-breathe text-live h-3.5 w-3.5"}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M10 1.6 C 14 .8, 18.6 4.2, 18.3 9.4 C 18 15 14.4 18.6 9.6 18.2 C 4.8 17.8, 1.4 14.6, 1.8 9.2 C 2.1 4.6, 6 2.4, 10 1.6 Z"
              />
            </svg>
            <span
              className={
                "font-bold uppercase tracking-[0.2em] text-paper " +
                "text-[0.74rem]"
              }
            >
              Live
            </span>
          </div>
        ) : null}

        {/* Watchers — ink on a scrap of paper, bottom-right. */}
        {state !== "shuttered" ? (
          <div className="absolute bottom-4 right-4">
            <WatcherCount slug={site.slug} />
          </div>
        ) : null}

        {/* Inner shadow along the cut: depth through the page. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(19,16,32,.9), inset 0 0 6px 2px rgba(19,16,32,.8), inset 0 0 30px 12px rgba(19,16,32,.55)",
          }}
        />
      </div>

      {!frameless ? (
        <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.85rem] text-ink-3">
          <span>
            {site.name} · {site.isLocationProtected ? "location protected" : site.locationLabel}
          </span>
          {!hasStream ? (
            <span>Demo footage until the barn camera is connected.</span>
          ) : null}
          <span className="ml-auto">
            If the picture stops, it restarts on its own — refresh if it doesn&apos;t.
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

function Shutter({
  night,
  sunsetLabel,
}: {
  night: Night;
  sunsetLabel: string;
}) {
  const openLabel = new Date(night.streamOpen).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-kraft">
      {/* Drawn paper shutter: planks. */}
      <div aria-hidden="true" className="absolute inset-0 flex flex-col">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 border-b border-edge bg-kraft" />
        ))}
        <div className="absolute inset-x-8 top-1/2 h-2 -translate-y-1/2 rotate-1 bg-edge" />
      </div>
      <p className="relative font-display text-3xl font-black text-ink">
        The window is shuttered.
      </p>
      <p className="relative text-ink-2">
        Back at <span className="tnum font-bold">{openLabel}</span> — sunset is{" "}
        <span className="tnum font-bold">{sunsetLabel}</span>.
      </p>
    </div>
  );
}
