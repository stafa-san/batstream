// Sitewide paper grain — one feTurbulence filter, fixed to the viewport,
// multiply-blended at ~4% (UI-DESIGN.md §2: "not optional").
export default function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] h-full w-full opacity-[0.04] mix-blend-multiply"
    >
      <filter id="paper-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  );
}
