"use client";

import type { Night, Site } from "@/lib/types";
import LiveStream from "./LiveStream";

// THE BARN SCENE — a cut-paper illustration filling the top of the page,
// with the livestream cut into the hayloft. Same medium as everything
// else on the site (flat 2-tone SVG, ink + kraft on paper), so the one
// glowing rectangle of real night stays the only "real" thing.
//
// Geometry is authored in a 1200×640 viewBox; the video overlay is
// positioned with matching percentages so the cutout tracks the barn at
// every size. Bats fly on SMIL motion paths with CSS wing-flaps; the
// motion toggle swaps the flock for a still one.

const VB_W = 1200;
const VB_H = 640;
// The hayloft opening (16:9): x 385–815, y 268–509.9
const WIN = { x: 385, y: 268, w: 430, h: 241.875 };

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
      {/* body + ears */}
      <path d="M-7,-2 C -5,-12 -2,-16 0,-16 C 2,-16 5,-12 7,-2 C 9,8 4,18 0,20 C -4,18 -9,8 -7,-2 Z" />
      <path d="M-5,-12 L -8,-20 L -2,-15 Z" />
      <path d="M5,-12 L 8,-20 L 2,-15 Z" />
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

// Erratic closed loops — bats don't fly in circles, they stitch the sky.
const FLIGHT_1 =
  "M190,330 C 250,150 500,80 660,120 C 850,165 1010,250 985,355 C 962,430 810,300 600,245 C 420,198 225,440 190,330 Z";
const FLIGHT_2 =
  "M700,120 C 800,60 985,130 1010,235 C 1025,320 865,305 780,245 C 715,200 635,165 700,120 Z";
const FLIGHT_3 =
  "M130,430 C 95,300 205,215 325,238 C 425,258 390,355 305,398 C 245,428 158,505 130,430 Z";

export default function BarnScene({
  site,
  night,
}: {
  site: Site;
  night: Night;
}) {
  return (
    <div
      className="relative mx-auto w-full"
      style={{
        maxWidth: `min(1500px, calc(74vh * ${VB_W / VB_H}))`,
        aspectRatio: `${VB_W} / ${VB_H}`,
      }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="A cut-paper illustration of the Winton Woods bat barn at dusk, bats flying around it. The hayloft is a window into the real barn, live."
      >
        {/* ============ backdrop disc + swirls ============ */}
        <circle cx="600" cy="330" r="308" fill="#EDE4D0" />
        <circle cx="600" cy="330" r="308" fill="none" stroke="var(--edge)" strokeWidth="2" opacity="0.5" />
        <g fill="none" stroke="var(--edge)" strokeWidth="4" strokeLinecap="round" opacity="0.85">
          <path d="M336,146 q 80,-52 166,-22 q -22,16 -44,12 q 14,-2 20,-12" />
          <path d="M742,108 q 92,-28 154,24 q -26,4 -44,-6 q 14,10 26,10" />
          <path d="M902,412 q 38,56 -4,116 q -8,-24 0,-42" />
          <path d="M296,448 q -40,56 4,112 q 8,-24 0,-42" />
          <path d="M548,66 q 44,-20 92,-2 q -18,10 -34,6" opacity="0.6" />
        </g>

        {/* ============ ground: a mound inside the diorama ============ */}
        <path d="M40,640 Q 600,548 1160,640 Z" fill="var(--kraft)" />
        <path
          d="M40,640 Q 600,548 1160,640"
          fill="none"
          stroke="var(--edge)"
          strokeWidth="2.5"
        />

        {/* ============ trees (curly, bare, cut-paper) ============ */}
        <g fill="none" stroke="var(--ink)" strokeLinecap="round">
          {/* left */}
          <path d="M162,622 C 156,540 140,486 148,428" strokeWidth="14" />
          <path d="M148,428 C 142,384 162,350 196,342 C 220,337 228,358 212,366 C 202,371 196,362 202,356" strokeWidth="8" />
          <path d="M150,444 C 120,412 102,372 110,330 C 115,306 136,304 134,320 C 133,331 122,330 124,321" strokeWidth="6.5" />
          <path d="M156,492 C 184,474 202,448 204,420" strokeWidth="6.5" />
          {/* right */}
          <path d="M1042,624 C 1048,540 1062,488 1054,428" strokeWidth="14" />
          <path d="M1054,428 C 1060,384 1038,352 1004,344 C 980,340 973,362 990,369 C 1000,373 1005,364 999,358" strokeWidth="8" />
          <path d="M1052,446 C 1082,414 1100,374 1090,332 C 1084,308 1064,307 1067,323 C 1069,334 1079,332 1077,323" strokeWidth="6.5" />
          <path d="M1048,490 C 1020,472 1003,447 1001,420" strokeWidth="6.5" />
        </g>

        {/* ============ the barn — one cut silhouette ============ */}
        <path
          d="M274,614 L274,394 L228,394 L380,232 L545,188 L655,188 L820,232 L972,394 L926,394 L926,614 Z"
          fill="var(--ink)"
          stroke="var(--ink)"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* kraft roofline trim */}
        <path
          d="M228,394 L380,232 L545,188 L655,188 L820,232 L972,394"
          fill="none"
          stroke="var(--kraft)"
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* faint plank seams */}
        <g stroke="#F8F3E9" strokeOpacity="0.07" strokeWidth="3">
          {[340, 420, 500, 700, 780, 860].map((x) => (
            <line key={x} x1={x} y1="400" x2={x} y2="606" />
          ))}
        </g>

        {/* cupola + bat weathervane */}
        <rect x="572" y="140" width="56" height="50" fill="var(--ink)" />
        <path d="M556,140 L600,108 L644,140 Z" fill="var(--ink)" />
        <line x1="600" y1="108" x2="600" y2="86" stroke="var(--ink)" strokeWidth="4" />
        <g transform="translate(600,80) scale(0.34)">
          <BatShape />
        </g>

        {/* round vent above the loft */}
        <circle cx="600" cy="234" r="14" fill="var(--kraft)" />
        <g stroke="var(--ink)" strokeWidth="4">
          <line x1="591" y1="227" x2="609" y2="241" />
          <line x1="591" y1="241" x2="609" y2="227" />
        </g>

        {/* hayloft frame — the wood the window is cut into */}
        <rect
          x={WIN.x - 9}
          y={WIN.y - 9}
          width={WIN.w + 18}
          height={WIN.h + 18}
          fill="none"
          stroke="var(--kraft)"
          strokeWidth="10"
        />

        {/* barn doors below the loft */}
        <g>
          <rect x="550" y="532" width="100" height="72" fill="var(--ink)" stroke="var(--kraft)" strokeWidth="5" />
          <line x1="600" y1="532" x2="600" y2="604" stroke="var(--kraft)" strokeWidth="4" />
          <line x1="552" y1="534" x2="598" y2="602" stroke="var(--kraft)" strokeWidth="3.5" />
          <line x1="598" y1="534" x2="552" y2="602" stroke="var(--kraft)" strokeWidth="3.5" />
          <line x1="602" y1="534" x2="648" y2="602" stroke="var(--kraft)" strokeWidth="3.5" />
          <line x1="648" y1="534" x2="602" y2="602" stroke="var(--kraft)" strokeWidth="3.5" />
        </g>

        {/* grass tufts */}
        <g fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round">
          {[
            [196, 613],
            [258, 606],
            [382, 595],
            [706, 593],
            [902, 604],
            [1000, 612],
          ].map(([x, y]) => (
            <g key={x} transform={`translate(${x},${y})`}>
              <path d="M0,0 C -2,-8 -6,-12 -9,-14" />
              <path d="M2,0 C 2,-9 1,-14 0,-18" />
              <path d="M4,0 C 7,-7 10,-11 13,-13" />
            </g>
          ))}
        </g>

        {/* ============ the flock ============ */}
        <g className="bats-fly">
          <FlyingBat size={46} dur={26} path={FLIGHT_1} />
          <FlyingBat size={30} dur={31} path={FLIGHT_1} reverse delay={-9} />
          <FlyingBat size={36} dur={17} path={FLIGHT_2} delay={-4} />
          <FlyingBat size={24} dur={21} path={FLIGHT_2} reverse delay={-13} />
          <FlyingBat size={34} dur={19} path={FLIGHT_3} delay={-7} />
          <FlyingBat size={20} dur={24} path={FLIGHT_3} reverse />
        </g>
        <g className="bats-static" aria-hidden="true">
          <StaticBat x={330} y={170} size={34} rot={-12} />
          <StaticBat x={470} y={110} size={22} rot={8} />
          <StaticBat x={840} y={140} size={28} rot={14} />
          <StaticBat x={960} y={250} size={18} rot={-8} />
          <StaticBat x={230} y={320} size={22} rot={6} />
        </g>
      </svg>

      {/* The window — the one real thing, cut into the loft. */}
      <div
        className="absolute"
        style={{
          left: `${(WIN.x / VB_W) * 100}%`,
          top: `${(WIN.y / VB_H) * 100}%`,
          width: `${(WIN.w / VB_W) * 100}%`,
          height: `${(WIN.h / VB_H) * 100}%`,
        }}
      >
        <LiveStream site={site} night={night} frameless />
      </div>
    </div>
  );
}
