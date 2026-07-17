"use client";

import type { Night, Site } from "@/lib/types";
import LiveStream from "./LiveStream";

// THE BARN SCENE v3 — full-bleed, edge-anchored. v2 cover-cropped one big
// picture, which sacrificed the roofline at wide viewports. Now every
// layer is pinned to the edge it belongs to, so the composition survives
// any aspect ratio:
//   · wall      — infinite kraft backdrop (CSS planks)
//   · roofline  — pinned top, full width, always under the nav
//   · portal    — sized from the hero's real height (container units),
//                 centered; the window fills most of the hero
//   · ground    — pinned bottom; trees + grass crop in at the corners
//   · flock     — undistorted overlay, crops gracefully at the edges
const HERO_H = "min(80vh, 900px)";

// Portal geometry (viewBox 1140×687): window inner rect 110,85 → 1030,602.5
const P = { w: 1140, h: 687 };
const PWIN = { x: 110, y: 85, w: 920, h: 517.5 };

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

const FLIGHT_A =
  "M120,200 C 220,60 520,40 640,110 C 700,150 560,205 420,192 C 300,182 60,320 120,200 Z";
const FLIGHT_B =
  "M980,90 C 1150,28 1420,75 1480,190 C 1512,262 1330,225 1220,170 C 1120,128 900,152 980,90 Z";
const FLIGHT_C =
  "M200,720 C 400,540 700,320 1050,240 C 1300,188 1452,320 1380,440 C 1300,580 1000,660 700,720 C 480,762 96,822 200,720 Z";

function Tree({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="20 430 200 420"
      className="h-full w-auto"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--ink)" strokeLinecap="round">
        <path d="M96,850 C 90,740 76,660 84,570" strokeWidth="16" />
        <path d="M84,570 C 78,520 100,484 136,476 C 162,471 170,494 152,502 C 142,507 136,498 142,492" strokeWidth="9" />
        <path d="M86,600 C 54,564 36,520 44,474 C 49,448 72,446 70,464 C 69,476 56,474 58,464" strokeWidth="7" />
      </g>
    </svg>
  );
}

function GrassTuft() {
  return (
    <svg viewBox="-14 -24 34 26" className="h-full w-auto" aria-hidden="true">
      <g fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round">
        <path d="M0,0 C -3,-9 -7,-14 -11,-16" />
        <path d="M3,0 C 3,-10 2,-16 1,-21" />
        <path d="M6,0 C 9,-8 12,-13 16,-15" />
      </g>
    </svg>
  );
}

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
        // the wall: one calm sheet, lit from the window out (corners ~8% darker)
        backgroundColor: "var(--kraft)",
        backgroundImage:
          "radial-gradient(120% 105% at 50% 45%, #EBE1C9 0%, #E4D7BC 45%, #D5C5A0 100%)",
      }}
    >
      {/* plank seams — near-subliminal, irregular widths */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {[9, 17.5, 29, 41, 48.5, 59, 70.5, 79, 91].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="100"
            stroke="var(--ink)"
            strokeOpacity="0.05"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* one ghosted engraved moon — the single classical motif */}
      <div
        className="absolute"
        style={{ right: "4%", top: "15cqh", height: "clamp(80px, 16cqh, 150px)" }}
        aria-hidden="true"
      >
        <svg viewBox="-60 -60 120 120" className="h-full w-auto" style={{ opacity: 0.2 }}>
          <g fill="none" stroke="var(--ink)" strokeWidth="1.6">
            <circle r="34" />
            <circle r="41" strokeDasharray="2.5 5" strokeWidth="1" />
            <path d="M-10,-30 a 32,32 0 1 0 0,60 a 25,25 0 1 1 0,-60" strokeWidth="1.3" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * Math.PI) / 6;
              const c = Math.cos(a);
              const sn = Math.sin(a);
              return (
                <line
                  key={i}
                  x1={c * 47}
                  y1={sn * 47}
                  x2={c * 55}
                  y2={sn * 55}
                  strokeWidth="1.2"
                />
              );
            })}
          </g>
        </svg>
      </div>
      {/* ============ roofline — pinned top, always visible ============ */}
      <svg
        viewBox="0 0 1600 160"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 w-full"
        style={{ height: "clamp(72px, 15cqh, 150px)" }}
        aria-hidden="true"
      >
        {/* sky above the roof */}
        <path d="M0,0 L1600,0 L1600,150 L800,14 L0,150 Z" fill="var(--paper)" />
        <path
          d="M0,150 L800,14 L1600,150"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="14"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0,165 L800,29 L1600,165"
          fill="none"
          stroke="#cdbb93"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ============ the portal — sized from the hero itself ============ */}
      <div
        className="absolute left-1/2"
        style={{
          top: "54%",
          transform: "translate(-50%, -50%)",
          width: `min(94cqw, ${((0.8 * P.w) / P.h) * 100}cqh)`,
          aspectRatio: `${P.w} / ${P.h}`,
        }}
      >
        <svg
          viewBox={`0 0 ${P.w} ${P.h}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          {/* natural-history plate rules around the whole portal */}
          {[
            [1.052, 2.2, 0.5],
            [1.032, 1.2, 0.45],
          ].map(([k, w, o]) => (
            <path
              key={k}
              d="M95,0 L1045,0 L1140,95 L1140,592 L1045,687 L95,687 L0,592 L0,95 Z"
              fill="none"
              stroke="var(--ink)"
              strokeWidth={w}
              opacity={o}
              transform={`translate(${570 * (1 - k)} ${343.5 * (1 - k)}) scale(${k})`}
            />
          ))}
          <g stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round">
            <polygon points="95,0 1045,0 1030,85 110,85" fill="#c4b189" />
            <polygon points="95,687 1045,687 1030,602.5 110,602.5" fill="#ece0c2" />
            <polygon points="0,95 110,85 110,602.5 0,592" fill="#d2bf97" />
            <polygon points="1140,95 1030,85 1030,602.5 1140,592" fill="#cbb78d" />
            <polygon points="95,0 110,85 0,95" fill="#cab692" />
            <polygon points="1045,0 1140,95 1030,85" fill="#c6b28c" />
            <polygon points="0,592 110,602.5 95,687" fill="#e2d5b5" />
            <polygon points="1140,592 1045,687 1030,602.5" fill="#ddd0ae" />
          </g>
          <rect
            x={PWIN.x}
            y={PWIN.y}
            width={PWIN.w}
            height={PWIN.h}
            fill="var(--night)"
            stroke="var(--ink)"
            strokeWidth="7"
          />
          <path
            d="M95,0 L1045,0 L1140,95 L1140,592 L1045,687 L95,687 L0,592 L0,95 Z"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="11"
            strokeLinejoin="round"
          />
          {/* plate caption, engraved into the sill */}
          <text
            x="570"
            y="678"
            textAnchor="middle"
            fontFamily="var(--font-atkinson), sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="2.5"
            fill="var(--ink)"
            opacity="0.55"
          >
            FIG. 1 — THE HAYLOFT, LIVE TONIGHT
          </text>
          {/* hay pulley on the lintel */}
          <path d="M550,2 L590,2 L570,34 Z" fill="var(--ink)" />
          <line x1="570" y1="30" x2="570" y2="62" stroke="var(--ink)" strokeWidth="4.5" />
          <path
            d="M570,62 q 11,11 2,22 q -9,9 -15,-2"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>

        {/* The window — the one real thing. */}
        <div
          className="absolute"
          style={{
            left: `${(PWIN.x / P.w) * 100}%`,
            top: `${(PWIN.y / P.h) * 100}%`,
            width: `${(PWIN.w / P.w) * 100}%`,
            height: `${(PWIN.h / P.h) * 100}%`,
          }}
        >
          <LiveStream site={site} night={night} frameless />
        </div>
      </div>

      {/* ============ ground — pinned bottom ============ */}
      <div
        className="absolute inset-x-0 bottom-0 border-t-2 border-edge"
        style={{ height: "clamp(22px, 4.5cqh, 40px)", backgroundColor: "#d8c8a4" }}
        aria-hidden="true"
      />
      {[10, 52, 88].map((left) => (
        <div
          key={left}
          className="absolute"
          style={{
            left: `${left}%`,
            bottom: "clamp(18px, 4cqh, 36px)",
            height: "clamp(16px, 3cqh, 26px)",
          }}
          aria-hidden="true"
        >
          <GrassTuft />
        </div>
      ))}
      {/* trees cropping in at the corners */}
      <div
        className="absolute"
        style={{ left: "-1.5%", bottom: "clamp(10px, 2.5cqh, 24px)", height: "42cqh" }}
        aria-hidden="true"
      >
        <Tree />
      </div>
      <div
        className="absolute"
        style={{ right: "-1.5%", bottom: "clamp(10px, 2.5cqh, 24px)", height: "42cqh" }}
        aria-hidden="true"
      >
        <Tree flip />
      </div>

      {/* ============ swirls + the flock (undistorted overlay) ============ */}
      <svg
        viewBox="0 0 1600 850"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g fill="none" stroke="var(--edge)" strokeWidth="3" strokeLinecap="round" opacity="0.6">
          <path d="M120,74 q 84,-42 172,-14 q -24,16 -46,10 q 14,-2 20,-12" />
          <path d="M1180,50 q 92,-30 158,26 q -26,4 -46,-8 q 14,10 26,10" />
        </g>
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
          <StaticBat x={520} y={70} size={28} rot={8} />
          <StaticBat x={1140} y={100} size={38} rot={12} />
          <StaticBat x={1420} y={206} size={24} rot={-6} />
          <StaticBat x={172} y={450} size={26} rot={6} />
        </g>
      </svg>
    </div>
  );
}
