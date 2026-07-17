"use client";

import type { Night, Site } from "@/lib/types";
import LiveStream from "./LiveStream";

// THE SCENE v4 — reduced to its essence: a paper page, one soft spotlight,
// the hand-cut window dead center, and the flock. No barn drawing at all —
// the page itself is the paper the hole is cut through.
export const HERO_H = "min(80vh, 900px)";

function BatShape() {
  return (
    <g fill="var(--ink)">
      <path
        className="fwing-l"
        d="M-4,0 C -16,-18 -40,-24 -58,-12 C -48,-6 -45,2 -48,10 C -36,4 -24,7 -12,16 Z"
      />
      <path
        className="fwing-r"
        d="M4,0 C 16,-18 40,-24 58,-12 C 48,-6 45,2 48,10 C 36,4 24,7 12,16 Z"
      />
      <path d="M-7,-2 C -5,-12 -2,-16 0,-16 C 2,-16 5,-12 7,-2 C 9,8 4,18 0,20 C -4,18 -9,8 -7,-2 Z" />
      <path d="M-5,-12 L -8,-20 L -2,-15 Z" />
      <path d="M5,-12 L 8,-20 L 2,-15 Z" />
    </g>
  );
}

function FlyingBat({
  size,
  dur,
  path,
  reverse = false,
  delay = 0,
}: {
  size: number;
  dur: number;
  path: string;
  reverse?: boolean;
  delay?: number;
}) {
  return (
    <g>
      <animateMotion
        dur={`${dur}s`}
        repeatCount="indefinite"
        rotate="0"
        begin={`${delay}s`}
        path={path}
        keyPoints={reverse ? "1;0" : "0;1"}
        keyTimes="0;1"
        calcMode="linear"
      />
      <g transform={`scale(${size / 100})`}>
        <BatShape />
      </g>
    </g>
  );
}

function StaticBat({
  x,
  y,
  size,
  rot = 0,
}: {
  x: number;
  y: number;
  size: number;
  rot?: number;
}) {
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${size / 100})`}>
      <BatShape />
    </g>
  );
}

// Loops that circle the window: wide passes above, below, and across.
const FLIGHT_A =
  "M140,190 C 240,50 540,30 680,100 C 750,140 590,200 440,190 C 310,182 60,310 140,190 Z";
const FLIGHT_B =
  "M960,90 C 1140,20 1430,70 1490,190 C 1522,262 1330,230 1210,170 C 1110,120 880,152 960,90 Z";
const FLIGHT_C =
  "M180,730 C 380,560 700,680 1060,700 C 1310,712 1470,600 1400,480 C 1340,390 1200,520 900,560 C 600,600 80,830 180,730 Z";

export default function BarnScene({
  site,
  night,
}: {
  site: Site;
  night: Night;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: HERO_H,
        minHeight: "500px",
        containerType: "size",
        // the page itself, under one soft spotlight
        backgroundColor: "var(--paper)",
        backgroundImage:
          "radial-gradient(120% 100% at 50% 48%, #FEFBF4 0%, #F8F3E9 48%, #EFE6D2 100%)",
      }}
    >
      {/* The window — centered, as big as the hero allows. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `min(92cqw, ${((0.86 * 16) / 9) * 100}cqh)`,
          aspectRatio: "16 / 9",
        }}
      >
        <LiveStream site={site} night={night} frameless />
      </div>

      {/* Top-left vignette: the barn itself, letting the flock out.
          Shown only when the margin beside the window has room for it. */}
      <div
        className="absolute hidden min-[1600px]:block"
        style={{ left: "1.5%", top: "7%", height: "clamp(100px, 18cqh, 160px)" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 240 200" className="h-full w-auto">
          {/* dashed flight trail rising toward the window */}
          <path
            d="M118,92 Q 160,56 208,28"
            fill="none"
            stroke="var(--edge)"
            strokeWidth="2.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          {/* little barn, ink silhouette */}
          <path
            d="M26,186 L26,120 L12,120 L64,68 L92,58 L112,58 L140,68 L192,120 L178,120 L178,186 Z"
            fill="var(--ink)"
          />
          {/* open loft mouth they pour out of */}
          <path d="M86,94 L120,94 L120,126 L86,126 Z" fill="var(--paper)" />
          {/* ground */}
          <line x1="6" y1="186" x2="204" y2="186" stroke="var(--edge)" strokeWidth="2.5" strokeLinecap="round" />
          {/* leaving, shrinking with distance */}
          <g transform="translate(112,108) rotate(24) scale(0.11)"><BatShape /></g>
          <g transform="translate(146,82) rotate(18) scale(0.2)"><BatShape /></g>
          <g transform="translate(184,50) rotate(6) scale(0.14)"><BatShape /></g>
          <g transform="translate(216,26) rotate(-4) scale(0.1)"><BatShape /></g>
        </svg>
      </div>

      {/* The flock. */}
      <svg
        viewBox="0 0 1600 850"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g className="bats-fly">
          <FlyingBat size={54} dur={27} path={FLIGHT_C} />
          <FlyingBat size={34} dur={33} path={FLIGHT_C} reverse delay={-11} />
          <FlyingBat size={42} dur={17} path={FLIGHT_A} delay={-5} />
          <FlyingBat size={26} dur={22} path={FLIGHT_A} reverse delay={-13} />
          <FlyingBat size={38} dur={19} path={FLIGHT_B} delay={-7} />
          <FlyingBat size={24} dur={25} path={FLIGHT_B} reverse />
        </g>
        <g className="bats-static">
          <StaticBat x={250} y={124} size={44} rot={-10} />
          <StaticBat x={520} y={66} size={28} rot={8} />
          <StaticBat x={1140} y={90} size={38} rot={12} />
          <StaticBat x={1430} y={196} size={24} rot={-6} />
          <StaticBat x={180} y={700} size={30} rot={6} />
          <StaticBat x={1380} y={720} size={26} rot={-8} />
        </g>
      </svg>
    </div>
  );
}
