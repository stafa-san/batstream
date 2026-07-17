"use client";

import type { Night, Site } from "@/lib/types";
import LiveStream from "./LiveStream";

// THE BARN SCENE v2 — full-bleed, one-point perspective. We've walked up
// to the barn: the gable wall fills the hero and bleeds past every edge,
// the roofline crosses the top with sky in the corners, and the hayloft
// is a huge beveled portal — thick frame faces receding toward the
// window like a hole cut through the whole page. The wall is kraft so
// the night footage stays the darkest thing on screen.
//
// A fixed-aspect "stage" (1600×850) is centered in an 80vh hero and
// sized to COVER it, cropping equally at the edges — that's what makes
// the illustration bleed. The video overlay is positioned in stage
// percentages, so the cutout tracks the drawing at every viewport.

const VB_W = 1600;
const VB_H = 850;
const R = VB_W / VB_H;
// The hayloft window (16:9): x 340–1260, y 140–657.5
const WIN = { x: 340, y: 140, w: 920, h: 517.5 };
const HERO_H = "min(80vh, 880px)";

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

// Sky loops in the corners + one long pass across the portal face.
const FLIGHT_A =
  "M120,180 C 220,40 520,20 640,90 C 700,130 560,185 420,172 C 300,162 60,300 120,180 Z";
const FLIGHT_B =
  "M980,70 C 1150,8 1420,55 1480,170 C 1512,242 1330,205 1220,150 C 1120,108 900,132 980,70 Z";
const FLIGHT_C =
  "M200,700 C 400,520 700,300 1050,220 C 1300,168 1452,300 1380,420 C 1300,560 1000,640 700,700 C 480,742 96,802 200,700 Z";

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
      style={{ height: HERO_H, minHeight: "480px" }}
    >
      {/* the stage: fixed aspect, covers the hero, bleeds past the edges */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100%, calc(${HERO_H} * ${R}))`,
          aspectRatio: `${VB_W} / ${VB_H}`,
        }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Up close to the cut-paper bat barn: its gable wall fills the page, bats cross the sky above the roofline, and the huge hayloft opening is a live window into the real barn."
        >
          <defs>
            <clipPath id="wall-clip">
              <path d="M0,150 L800,10 L1600,150 L1600,850 L0,850 Z" />
            </clipPath>
          </defs>

          {/* ============ sky (top corners, above the roofline) ============ */}
          <rect x="0" y="0" width="1600" height="850" fill="var(--paper)" />
          <g fill="none" stroke="var(--edge)" strokeWidth="4" strokeLinecap="round" opacity="0.85">
            <path d="M120,64 q 84,-42 172,-14 q -24,16 -46,10 q 14,-2 20,-12" />
            <path d="M420,36 q 60,-24 120,-4 q -18,10 -36,6" opacity="0.6" />
            <path d="M1180,40 q 92,-30 158,26 q -26,4 -46,-8 q 14,10 26,10" />
            <path d="M1460,120 q 40,-24 84,-8" opacity="0.6" />
          </g>

          {/* ============ the wall (kraft, planked) ============ */}
          <path
            d="M0,150 L800,10 L1600,150 L1600,850 L0,850 Z"
            fill="var(--kraft)"
          />
          <g clipPath="url(#wall-clip)">
            <g stroke="rgba(34,30,24,0.10)" strokeWidth="4">
              {Array.from({ length: 18 }, (_, i) => 44 + i * 88).map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="850" />
              ))}
            </g>
            {/* a couple of weathered boards, slightly darker */}
            <rect x="308" y="0" width="88" height="850" fill="rgba(34,30,24,0.05)" />
            <rect x="1276" y="0" width="88" height="850" fill="rgba(34,30,24,0.05)" />
          </g>

          {/* ============ roof fascia crossing the top ============ */}
          <path
            d="M0,150 L800,10 L1600,150"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="18"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M0,166 L800,26 L1600,166"
            fill="none"
            stroke="#cdbb93"
            strokeWidth="5"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* ============ the portal — one-point bevel into the window ============ */}
          {/* faces: top (shadow), sides, bottom (light), corner chamfers */}
          <g stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round">
            <polygon points="325,55 1275,55 1260,140 340,140" fill="#c4b189" />
            <polygon points="325,742 1275,742 1260,657.5 340,657.5" fill="#ece0c2" />
            <polygon points="230,150 340,140 340,657.5 230,647" fill="#d2bf97" />
            <polygon points="1370,150 1260,140 1260,657.5 1370,647" fill="#cbb78d" />
            <polygon points="325,55 340,140 230,150" fill="#cab692" />
            <polygon points="1275,55 1370,150 1260,140" fill="#c6b28c" />
            <polygon points="230,647 340,657.5 325,742" fill="#e2d5b5" />
            <polygon points="1370,647 1275,742 1260,657.5" fill="#ddd0ae" />
          </g>
          {/* inner lip + outer rim of the frame */}
          <rect x="340" y="140" width="920" height="517.5" fill="none" stroke="var(--ink)" strokeWidth="7" />
          <path
            d="M325,55 L1275,55 L1370,150 L1370,647 L1275,742 L325,742 L230,647 L230,150 Z"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="11"
            strokeLinejoin="round"
          />

          {/* ============ hay pulley over the loft ============ */}
          <path d="M780,18 L820,18 L800,52 Z" fill="var(--ink)" />
          <line x1="800" y1="48" x2="800" y2="116" stroke="var(--ink)" strokeWidth="4.5" />
          <path
            d="M800,116 q 11,11 2,22 q -9,9 -15,-2"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* ============ ground strip ============ */}
          <rect x="0" y="784" width="1600" height="66" fill="#d8c8a4" />
          <line x1="0" y1="784" x2="1600" y2="784" stroke="var(--edge)" strokeWidth="3" />
          <g fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
            {[
              [150, 792],
              [430, 788],
              [758, 790],
              [1172, 788],
              [1452, 792],
            ].map(([x, y]) => (
              <g key={x} transform={`translate(${x},${y})`}>
                <path d="M0,0 C -3,-9 -7,-14 -11,-16" />
                <path d="M3,0 C 3,-10 2,-16 1,-21" />
                <path d="M6,0 C 9,-8 12,-13 16,-15" />
              </g>
            ))}
          </g>

          {/* ============ trees cropping in at the corners ============ */}
          <g fill="none" stroke="var(--ink)" strokeLinecap="round">
            <path d="M96,850 C 90,740 76,660 84,570" strokeWidth="16" />
            <path d="M84,570 C 78,520 100,484 136,476 C 162,471 170,494 152,502 C 142,507 136,498 142,492" strokeWidth="9" />
            <path d="M86,600 C 54,564 36,520 44,474 C 49,448 72,446 70,464 C 69,476 56,474 58,464" strokeWidth="7" />
            <path d="M1508,850 C 1514,744 1526,668 1518,576" strokeWidth="16" />
            <path d="M1518,576 C 1524,526 1500,490 1464,482 C 1438,478 1431,502 1449,509 C 1459,513 1465,504 1459,498" strokeWidth="9" />
            <path d="M1516,606 C 1548,570 1564,526 1554,480 C 1548,454 1526,453 1529,471 C 1531,483 1543,481 1541,471" strokeWidth="7" />
          </g>

          {/* ============ the flock ============ */}
          <g className="bats-fly">
            <FlyingBat size={54} dur={27} path={FLIGHT_C} />
            <FlyingBat size={34} dur={33} path={FLIGHT_C} reverse delay={-11} />
            <FlyingBat size={42} dur={17} path={FLIGHT_A} delay={-5} />
            <FlyingBat size={26} dur={22} path={FLIGHT_A} reverse delay={-13} />
            <FlyingBat size={38} dur={19} path={FLIGHT_B} delay={-7} />
            <FlyingBat size={24} dur={25} path={FLIGHT_B} reverse />
          </g>
          <g className="bats-static" aria-hidden="true">
            <StaticBat x={250} y={104} size={44} rot={-10} />
            <StaticBat x={520} y={56} size={28} rot={8} />
            <StaticBat x={1140} y={84} size={38} rot={12} />
            <StaticBat x={1420} y={186} size={24} rot={-6} />
            <StaticBat x={172} y={430} size={26} rot={6} />
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
    </div>
  );
}
