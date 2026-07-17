"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Night, Site } from "@/lib/types";
import { handCutRectPath } from "@/lib/paper";
import BatGlyph from "./BatGlyph";
import DemoFootage from "./DemoFootage";
import WatcherCount from "./WatcherCount";

// THE WINDOW (UI-DESIGN.md §4) — a hand-cut hole in the paper, with an
// inner shadow along the cut. The footage is the one real thing on the
// site — so it gets real media chrome: a scrim control bar with
// play/pause, volume, LIVE + uptime, watchers, and fullscreen. The bar
// reveals on hover/touch and stays out of the way otherwise.
const CUT = handCutRectPath(20260717);

type StreamState = "loading" | "playing" | "shuttered";

function fmtUptime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

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
  const figRef = useRef<HTMLElement>(null);
  const hasStream = Boolean(site.streamUrl);
  const [state, setState] = useState<StreamState>(
    site.status === "Live" ? "loading" : "shuttered",
  );
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [vol, setVol] = useState(0.8);
  const [uptime, setUptime] = useState("0:00:00");
  const [isFs, setIsFs] = useState(false);
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

  // Uptime since the stream opened tonight. Before the real open time
  // (i.e. demo mode pretending it's dusk), run from a synthetic base so
  // the clock agrees with the "barn is awake" state.
  useEffect(() => {
    const open = new Date(night.streamOpen).getTime();
    const mounted = Date.now();
    const tick = () => {
      const real = Date.now() - open;
      const shown = real >= 0 ? real : 50 * 60000 + (Date.now() - mounted);
      setUptime(fmtUptime(shown));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [night.streamOpen]);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (hasStream && v) {
      if (v.paused) {
        v.play().catch(() => {});
        setPaused(false);
      } else {
        v.pause();
        setPaused(true);
      }
    } else {
      setPaused((p) => !p);
    }
  }, [hasStream]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    const next = !muted;
    if (v) v.muted = next;
    setMuted(next);
  }, [muted]);

  const changeVol = useCallback((x: number) => {
    const v = videoRef.current;
    setVol(x);
    if (v) {
      v.volume = x;
      v.muted = x === 0;
    }
    setMuted(x === 0);
  }, []);

  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) {
      figRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const sunsetLabel = new Date(night.sunset).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: site.timeZone,
  });

  return (
    <figure
      ref={figRef}
      className={
        "group " + (frameless ? "relative m-0 h-full w-full" : "relative m-0")
      }
    >
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
          <DemoFootage paused={paused} />
        )}

        {state === "loading" && hasStream ? (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-40 w-40" style={{ animation: "orbit 5s linear infinite" }}>
              <div
                className="ml-auto h-10 w-14"
                style={{ animation: "orbit-counter 5s linear infinite" }}
              >
                <BatGlyph className="h-full w-full text-paper/80" />
              </div>
            </div>
          </div>
        ) : null}

        {/* LIVE — hand-drawn ember mark, top-left. */}
        {state !== "shuttered" ? (
          <div className="absolute left-4 top-4 flex -rotate-2 items-center gap-2">
            <svg viewBox="0 0 20 20" className="live-breathe h-3.5 w-3.5 text-live" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 1.6 C 14 .8, 18.6 4.2, 18.3 9.4 C 18 15 14.4 18.6 9.6 18.2 C 4.8 17.8, 1.4 14.6, 1.8 9.2 C 2.1 4.6, 6 2.4, 10 1.6 Z"
              />
            </svg>
            <span className="text-[0.74rem] font-bold uppercase tracking-[0.2em] text-paper">
              Live
            </span>
          </div>
        ) : null}

        {/* ============ media bar — the real thing gets real chrome ============ */}
        {state !== "shuttered" ? (
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-t from-[rgba(6,5,14,0.88)] via-[rgba(6,5,14,0.55)] to-transparent px-3 pb-2.5 pt-10 text-paper opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "Play" : "Pause"}
              className="player-btn grid h-8 w-8 flex-none place-items-center rounded-sm hover:bg-paper/10"
            >
              {paused ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 2 L 13.5 8 L 4 14 Z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <rect x="3" y="2.5" width="3.6" height="11" fill="currentColor" />
                  <rect x="9.4" y="2.5" width="3.6" height="11" fill="currentColor" />
                </svg>
              )}
            </button>

            <div className="flex flex-none items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                disabled={!hasStream}
                aria-label={muted ? "Unmute" : "Mute"}
                title={!hasStream ? "Demo footage has no sound" : undefined}
                className="player-btn grid h-8 w-8 flex-none place-items-center rounded-sm hover:bg-paper/10 disabled:opacity-45"
              >
                <svg viewBox="0 0 18 16" className="h-4 w-4" aria-hidden="true">
                  <path d="M2 5.5 L 5.5 5.5 L 9.5 2 L 9.5 14 L 5.5 10.5 L 2 10.5 Z" fill="currentColor" />
                  {muted || !hasStream ? (
                    <path d="M12 5 L 16.5 11 M16.5 5 L 12 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  ) : (
                    <path d="M12 5 q 3 3 0 6 M13.5 3 q 5 5 0 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  )}
                </svg>
              </button>
              {hasStream ? (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : vol}
                  onChange={(e) => changeVol(Number(e.target.value))}
                  aria-label="Volume"
                  className="player-vol h-1 w-16 cursor-pointer"
                />
              ) : null}
            </div>

            <span className="flex flex-none items-baseline gap-2 text-[0.8rem]">
              <span
                className="live-breathe inline-block h-2 w-2 flex-none translate-y-[-1px] rounded-full bg-live"
                aria-hidden="true"
              />
              <span className="tnum" aria-label={`Live for ${uptime}`}>
                {uptime}
              </span>
            </span>

            <span className="min-w-0 flex-1" />

            <WatcherCount slug={site.slug} bare />

            <button
              type="button"
              onClick={toggleFs}
              aria-label={isFs ? "Exit fullscreen" : "Fullscreen"}
              className="player-btn grid h-8 w-8 flex-none place-items-center rounded-sm hover:bg-paper/10"
            >
              {isFs ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M6 2 L 6 6 L 2 6 M10 2 L 10 6 L 14 6 M6 14 L 6 10 L 2 10 M10 14 L 10 10 L 14 10" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <path d="M2 6 L 2 2 L 6 2 M10 2 L 14 2 L 14 6 M14 10 L 14 14 L 10 14 M6 14 L 2 14 L 2 10" />
                </svg>
              )}
            </button>
          </div>
        ) : null}

        {/* Inner shadow along the cut: depth through the page. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
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
