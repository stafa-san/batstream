// Hand-cut edge geometry — the paper-craft signature (UI-DESIGN.md §2, §4).
// Deterministic so server and client render the same cut.
import { prng } from "@/lib/data/fixtures";

/**
 * A rectangle whose perimeter wobbles like it was cut with scissors.
 * Coordinates in objectBoundingBox space (0..1) for use in an SVG
 * <clipPath clipPathUnits="objectBoundingBox">. `wobble` ≈ 2–4px at
 * typical window widths — subtle, not torn-paper.
 */
export function handCutRectPath(
  seed: number,
  wobble = 0.0045,
  stepsX = 26,
  stepsY = 15,
): string {
  const rand = prng(seed);
  const j = () => (rand() - 0.5) * 2 * wobble;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= stepsX; i++) pts.push([i / stepsX, 0 + j()]); // top
  for (let i = 1; i <= stepsY; i++) pts.push([1 + j(), i / stepsY]); // right
  for (let i = stepsX - 1; i >= 0; i--) pts.push([i / stepsX, 1 + j()]); // bottom
  for (let i = stepsY - 1; i >= 1; i--) pts.push([0 + j(), i / stepsY]); // left
  const d =
    pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(4)},${y.toFixed(4)}`)
      .join("") + "Z";
  return d;
}

/**
 * A hand-cut horizontal edge for section dividers (deckle), in a
 * `0 0 1200 10` viewBox. Baseline at y=5 with the same subtle wobble.
 */
export function handCutLinePath(seed: number, wobble = 2.4, steps = 60): string {
  const rand = prng(seed);
  let d = `M0,${(5 + (rand() - 0.5) * wobble).toFixed(2)}`;
  for (let i = 1; i <= steps; i++) {
    d += `L${((i / steps) * 1200).toFixed(1)},${(5 + (rand() - 0.5) * 2 * wobble).toFixed(2)}`;
  }
  return d;
}
