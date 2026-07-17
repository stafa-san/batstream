// The one bat silhouette — cut-paper flat, reused everywhere (logo-less
// brand: the animal is the mark). Ink by default; color via className.
export default function BatGlyph({
  className = "",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 52"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        fill="currentColor"
        d="M48 12
           C 45 5, 36 1, 26 3 C 29 7, 29 11, 27 14
           C 17 12, 7 16, 3 26 C 9 24, 14 25, 17 29
           C 13 33, 13 39, 16 45 C 20 39, 25 37, 30 39
           C 33 43, 37 46, 41 46 C 42 49, 45 52, 48 52
           C 51 52, 54 49, 55 46 C 59 46, 63 43, 66 39
           C 71 37, 76 39, 80 45 C 83 39, 83 33, 79 29
           C 82 25, 87 24, 93 26 C 89 16, 79 12, 69 14
           C 67 11, 67 7, 70 3 C 60 1, 51 5, 48 12 Z"
      />
    </svg>
  );
}
