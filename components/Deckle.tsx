import { handCutLinePath } from "@/lib/paper";

/** Hand-cut section divider — a scissor line, not a <hr>. */
export default function Deckle({ seed = 7 }: { seed?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 10"
      preserveAspectRatio="none"
      className="h-[10px] w-full text-edge"
    >
      <path
        d={handCutLinePath(seed)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
