# BatBeacon — UI Design System (v1 "Dusk")

> Companion to `DESIGN.md` §9. This is the source of truth for visual implementation.
> Interactive concept mockup: https://claude.ai/code/artifact/56990e2d-31ba-444a-80fb-99c3cf2c4d48
> Grounded in primary research of visdeurbel.nl (full theme CSS analyzed), rattlecam.org,
> explore.org / Cornell Bird Cams / Monterey Bay Aquarium cams, iNaturalist/eBird/Zooniverse,
> the official IUCN Red List color chart, and Twitch/YouTube live-player conventions.

## 1. Concept

**The page is the sky at emergence time.** Dark-first deep-indigo dusk canvas — the thermal
feed is the brightest object on screen (the reason every stream platform defaults dark; doubly
true for IR night footage, which looks *broken* on a white page). One warm amber is reserved
for the single most important act — pressing the Spot button — and for live numbers. Teal
carries the science layer. Red appears exactly once: the LIVE pill.

Register: the Fish Doorbell's "beloved civic toy" warmth (chunky type, physical button,
playful copy, "Screee!") + RattleCam's research credibility (schedule as first-class UI,
protected-location transparency, institutional attribution).

## 2. Color tokens

### Dusk (dark — default)

| Token | Value | Use |
|---|---|---|
| `bg` | `#131020` | page canvas (never pure black) |
| `bg-raise` | `#181430` | sticky nav / raised bands |
| `surface` | `#1d1930` | cards |
| `surface-2` | `#272141` | nested fills, ticker rows, tracks |
| `line` | `rgba(244,242,255,.09)` | hairline borders |
| `text` | `#f4f2ff` | primary ink (never pure white) |
| `muted` | `#a7a2bd` | secondary ink |
| `faint` | `#7d7896` | tertiary / timestamps |
| `amber` | `#f5a524` | THE accent: Spot button, live numbers, active nav |
| `amber-hi` | `#ffc45e` | amber hover / big numbers on dark |
| `amber-ink` | `#2a1a00` | text on amber fills |
| `teal` | `#2dd4bf` | science accents, links-ish, presence |
| `live` | `#e5484d` | LIVE pill ONLY — red is never error/decor |

### Daylight (light)

| Token | Value |
|---|---|
| `bg` | `#faf7f0` (warm "before dusk", not white) |
| `surface` | `#ffffff` · `surface-2` `#f2eddf` |
| `text` | `#241d3d` (indigo ink) · `muted` `#655e80` |
| `amber` | `#f5a524` (fills, with `amber-ink` text) · `amber-hi` `#c97e00` (amber-as-text) |
| `teal` | `#0d9488` · `live` `#d03b3b` |

### Chart mark colors — validated, do not eyeball-substitute

Ran through the dataviz palette validator (lightness band, chroma floor, CVD ΔE ≥ 12,
3:1 contrast) against each mode's card surface:

| Mode | Amber series | Teal series | Surface |
|---|---|---|---|
| Dark | `#f5a524` (single-series) / `#c98500` (multi) | `#0d9488` | `#1d1930` |
| Light | `#a16207` | `#009683` | `#faf7f0` |

Rules: one series per plot where possible (species mix & geo are single-hue bars with
direct labels — identity lives in the label, not the hue). Never dual-axis. Text/labels
always wear ink tokens, never series color. Grid `rgba(244,242,255,.07)` dark /
`rgba(36,29,61,.08)` light.

### IUCN conservation chips (official Red List colors)

LC `#60C659` · NT `#CCE226` · VU `#F9E814` · EN `#FC7F3F` · CR `#D81E05` (dark mode lighten
to `#E0442B`). Chip = colored dot + 14% tinted fill + colored border + **code and word in
normal ink** ("EN · Endangered") — never color alone (WCAG 1.4.1). ESA/WNS context rides as
quiet secondary tags ("US ESA: Endangered", "WNS-affected", "Proposed US endangered").

## 3. Typography

| Role | Face | Notes |
|---|---|---|
| Display / headings / big numbers | **Bricolage Grotesque** 700–800 | chunky-friendly; the "civic toy" register (the Fish Doorbell's own display face — proven for this genre). `next/font/google`, variable. |
| Body / UI / data labels | **Atkinson Hyperlegible** 400/700 | designed by the Braille Institute for low-vision readers — the accessibility story is part of the public-good brand. |

Scale: h1 `clamp(2.2rem, 4vw, 3.4rem)`; section h2 ~2rem; eyebrow labels `.75rem`, 700,
uppercase, `.13em` tracking, amber. Body 16px/1.6. `font-variant-numeric: tabular-nums` on
tallies, tickers, timestamps, axis ticks. `text-wrap: balance` on headings.

## 4. Signature components

### SpotButton (the whole product in one control)
- Physical circular button (~128px) on a card "plate": amber `linear-gradient(145deg, amber-hi, amber 45%, #c07c0a)`, inset top-highlight + bottom-shadow, ambient amber glow shadow.
- `:active` → `translateY(3px) scale(.985)` (it visibly depresses — visdeurbel's `--button-depth` trick).
- On press: 1–2 expanding **echo rings** (border circles, scale .7→1.9, fade out ~1.1s) — echolocation, and the broadcast metaphor (your tap rings out to everyone).
- Caption sits *beside* the button, never on it: "See a bat? Press the button!" and the loop-closer: "Every press timestamps the emergence for researchers." Tally below (`aria-live="polite"`).
- Focus: 2px dashed amber outline, 3px offset (site-wide `:focus-visible` style).

### Player frame
- 16:9, `border-radius: 18px`, 1px hairline, deep shadow — a friendly object, not a TV embed.
- Overlays: **LIVE pill** top-left (red, white text "LIVE", pulsing dot); **watch chip** top-right ("312 watching", blurred dark glass); bottom gradient scrim with site name + "Location protected for conservation" + camera/time ("Thermal · FLIR FH669").
- Loading: branded loader inside the frame (echo rings), never a black rectangle.
- Offline/seasonal (`site.status`): never a dead player — warm banner with concrete return time + last night's highlights in the frame. Nightly-off state = countdown to next emergence window.
- Adjacent copy pre-empts glitches: "Stream hiccup? It restarts on its own — refresh if it doesn't."

### Status bar (above player)
Live dot + "**Live now** — the colony is emerging. Sunset was 9:04 PM." + always-visible
schedule: "Streams nightly, 30 min before sunset → midnight · May–Aug". Schedule is
first-class UI (MBA/RattleCam pattern).

### LiveTicker
Compact rows on `surface-2`: tabular timestamp · species (bold ink) · modality + confidence
(faint, right). New rows slide in (motion-gated). Cap ~5 visible.

### Stat tiles / season numbers
Narrative big numbers, not dashboard widgets: Bricolage 800 number in `amber-hi` + plain-language
qualifier ("bats counted this season", "peak night — July 9"). Count-up on scroll-into-view
(motion-gated). This is the Fish Doorbell "dataVISuals" storytelling register.

### Species card
Art area (dusk gradient + bat silhouette) → common name (h3) → *scientific name* (italic,
muted) → 2-line character description → IUCN chip + secondary tags → wingspan/meta line.
Collection hook on the grid: "Which have you spotted?"

### Gallery card ("Bat of the Night")
Thermal still, caption with personality ("'Triple exit' — three at once"), tabular timestamp,
and an amber chip crediting the crowd: "214 viewer spots". Featured card spans 2 columns.

## 5. Motion

- Global rules: every animation gated by BOTH `prefers-reduced-motion` and a visible
  **Motion on/off** toggle in the nav (`[data-motion="off"] * { animation: none; transition: none }`).
- Inventory: LIVE-dot pulse · Spot echo rings · tally/stat count-ups · ticker slide-in ·
  bar-fill grow · (POC mock only: thermal canvas sim). Nothing else moves.
- Easing: ease-out cubic, 120ms (press) → 900ms (count-up) range. No parallax, no scroll-jacking.

## 6. Theming mechanics

Token-level CSS custom properties. Dark values on `:root` (default); light under
`@media (prefers-color-scheme: light)` guarded with `:root:where(:not([data-theme="dark"]))`;
explicit `:root[data-theme="light"]` / `:root[data-theme="dark"]` so the user toggle beats
the OS both ways. Components style against tokens only. In Next.js: same attribute on `<html>`,
persisted to localStorage (`next-themes` fits this exactly).

## 7. Accessibility checklist

- WCAG AA contrast both modes (muted ink ≥ 4.5:1 on its surface; amber-as-text uses `amber-hi`
  variants per mode).
- LIVE state, IUCN status, and modality never color-alone — always text.
- Tally + tonight-count are `aria-live="polite"`; ticker list has an `aria-label`.
- Full keyboard: real `<button>`s, dashed amber `:focus-visible` everywhere.
- Canvas/thermal media get descriptive `aria-label`s; gallery stills get alt text.
- Atkinson Hyperlegible body + 16px minimum + ~65ch measure.

## 8. Voice & copy

Second person, plain, warm. "You're watching the bat barn at Winton Woods." One verb per
control ("Lock it in"). Close every loop (what a tap/guess does downstream). Mascot beat:
**"Screee!"** — used sparingly (Spot caption, footer statement). Footer repeats the core
instruction as a large typographic statement: "See a bat leave the barn? **Press the button.**
Screee!" Trust block: Great Parks + lab attribution, NABat line, contact email, and
"◈ Roost location protected for conservation" stated openly (RattleCam pattern).

## 9. Tailwind mapping (milestone 4 in DESIGN.md §11)

```js
// tailwind.config.ts — colors via CSS vars so themes stay token-level
colors: {
  bg: 'var(--bg)', 'bg-raise': 'var(--bg-raise)',
  surface: 'var(--surface)', 'surface-2': 'var(--surface-2)',
  ink: 'var(--text)', muted: 'var(--muted)', faint: 'var(--faint)',
  amber: 'var(--amber)', 'amber-hi': 'var(--amber-hi)', 'amber-ink': 'var(--amber-ink)',
  teal: 'var(--teal)', live: 'var(--live)',
},
fontFamily: {
  display: ['var(--font-bricolage)'],
  body: ['var(--font-atkinson)'],
}
```

Component → file map (matches `DESIGN.md` repo structure): player frame + states →
`LiveStream.tsx`; plate/button/rings/tally → `SpotButton.tsx`; rows → `LiveTicker.tsx`;
season chart (Recharts, tokens above) → `EmergenceChart.tsx`; tiles → `SeasonSummary.tsx`;
IUCN chip + card → `SpeciesGrid.tsx`; timestamped cards → `GalleryCarousel.tsx`;
input + reveal → `GuessGame.tsx`; toggles → `ThemeToggle.tsx` / `MotionToggle.tsx`.
