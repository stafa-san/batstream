# The Bat Barn — UI Design System (v2 "Paper Barn")

> Companion to `DESIGN.md`. Source of truth for visual implementation.
> Supersedes v1 "Dusk" entirely. **v1 was dark-first. That was wrong** — see §1.

---

## 1. The concept

**The site is a paper barn. The livestream is a real window cut into it.**

Everything on the page is drawn, warm, cream, hand-made — an illustrated paper-craft barn you're standing inside. In the middle: one dark rectangle. A hole through the paper into the actual night, where real animals are really flying, right now.

**Everything on this page is drawn. Only the bats are real.**

That contrast is the entire emotional payload. Do not soften it.

### Why not dark
Every nature cam is dark. The reasoning is sound for video legibility and wrong for this mission. Missy's insight is the project: **bats are the animal people are scared of.** A dark, glowing, surveillance-shaped page says *these creatures are creepy and you are watching them*. It reinforces exactly the feeling we exist to dissolve. A warm paper page says *these are your neighbours, come look*.

It also solves a real problem: thermal footage is abstract glowing blobs on black. On a dark page it reads as bad video. Framed as a window in a paper world, it reads as **precious** — the one true thing in a made thing.

### Register
Fish Doorbell's beloved-civic-toy warmth + a field naturalist's notebook. Handmade, not corporate. Tactile, not glossy. Confident enough to leave space.

---

## 2. Tokens

### Paper (the only mode — no dark theme; see §8)

| Token | Value | Use |
|---|---|---|
| `paper` | `#F8F3E9` | page — warm cream, never white |
| `paper-2` | `#F1E9D8` | raised paper, cards |
| `kraft` | `#E4D7BC` | deeper layer, tally sheet ground |
| `edge` | `#D6C6A6` | cut edges, hairlines |
| `ink` | `#221E18` | primary text — warm black, never `#000` |
| `ink-2` | `#6A6154` | secondary |
| `ink-3` | `#9A9082` | tertiary, timestamps |
| `night` | `#131020` | **the window only.** Nothing else on the site is this dark. |
| `ember` | `#D9741F` | THE accent — the stamp, the keep, live numbers |
| `ember-deep` | `#A8500C` | ember-as-text (contrast), pressed states |
| `dusk` | `#3D5A80` | secondary — schedule, links, science |
| `sage` | `#71856A` | tertiary — field-guide meta |
| `live` | `#C0392B` | the LIVE mark ONLY. Never error, never decoration. |

Rules: `ember` is a fill; when ember must be *text*, use `ember-deep`. One accent per screen region. Red appears once.

### Texture — not optional, it's the whole aesthetic
- **Grain:** SVG `feTurbulence` overlay at 3–5% opacity, `mix-blend-mode: multiply`, fixed to viewport. One filter, sitewide.
- **Paper layers:** cards are *paper on paper* — `1px solid edge` + a soft, tight, warm shadow (`0 2px 0 edge, 0 6px 14px rgba(34,30,24,.06)`). Never a glow. Never a glassmorphic blur.
- **Deckle:** section dividers and the window use a hand-cut irregular edge (SVG path, subtle — 2–4px of wobble, not a torn-paper cliché).

Design tooling forecasts for 2026 converge on exactly this: grain overlays, paper texture, and hand-drawn imperfection as a reaction against slick AI-generated visuals. We're on-trend and on-mission simultaneously — take the texture seriously, it's what makes it read as made rather than generated.

### Illustration
Flat, 2-tone, cut-paper. Barn beams, rafters, straw, dusk sky, bat silhouettes. Every illustration is `ink` + one accent on `paper`. **No gradients, no 3D, no drop-shadowed vector "flat 2.0."** Think a good children's natural-history book, not a SaaS hero.

---

## 3. Typography

| Role | Face | Why |
|---|---|---|
| Display | **Fraunces** 700–900, `SOFT` up, `WONK` on | A soft, wonky, optically-sized serif. Warm and handmade without being twee. Carries the whole paper register. |
| Body / UI | **Atkinson Hyperlegible** 400/700 | Braille Institute, built for low-vision readers. The accessibility story *is* the public-good brand. |

**Loading (get this right or the whole register collapses):** Fraunces is variable, but `next/font/google` will not load its character axes unless you name them — you must pass `axes: ['SOFT', 'WONK', 'opsz']`. Without that you get a stiff, generic serif and the paper feel dies. Atkinson Hyperlegible is **static**, not variable — load `weight: ['400','700']`.

```ts
const fraunces = Fraunces({ subsets:['latin'], axes:['SOFT','WONK','opsz'], variable:'--font-fraunces' })
const atkinson = Atkinson_Hyperlegible({ subsets:['latin'], weight:['400','700'], variable:'--font-atkinson' })
```

Scale: h1 `clamp(2.6rem, 5.5vw, 4.5rem)` — go big, the page can hold it. Body 17px/1.65, measure ~62ch. Eyebrows: Atkinson 700, `.72rem`, uppercase, `.14em`, `ink-3`. `font-variant-numeric: tabular-nums` on every number. `text-wrap: balance` on headings.

The hero blank ("—") is Fraunces 900 at display size. It should feel like a held breath.

---

## 4. Signature components

### The Window (`LiveStream.tsx`) — the most important object on the site
- A hand-cut hole in the paper. SVG mask with a subtly irregular edge; **inner shadow along the cut** so it reads as depth *through* the page, not a video pasted on it.
- Around it: the paper barn interior — rafters above, beams at the sides. The window is *in* the barn, not floating.
- Overlays kept minimal — the footage is the point. **LIVE mark** top-left (a small hand-drawn ember/red mark + "LIVE", not a Twitch pill). **Watcher count** bottom-right, ink on a scrap of paper. That's it.
- **Loading:** a drawn bat circling inside the window frame. Never a black rectangle, never a spinner.
- **Offline/seasonal:** the window is *shuttered* — a drawn paper shutter closes over it, with the return time inked on it ("Back at 8:41 PM" / "Back in May"). Below: last night's kept clips. **Never a dead player.**

### The Stamp (`StampButton.tsx`) — the whole product in one control
- A **rubber stamp**, not a button. Wooden handle, ember pad. Sits on the page like an object on a desk.
- `:active` → it *thunks down*: `translateY(5px)`, brief squash, and it presses an ember ink mark onto the tally strip below. Physical, ~120ms, then release.
- The mark it leaves is **real data** — it lands at the current bucket on tonight's tally.
- Other people's stamps appear as ink marks too, in real time. You can see the crowd working.
- Caption beside it, never on it: *"See something move? Stamp it."* Closer: *"Every stamp is a measurement. Nobody has ever counted this colony."*
- `aria-live="polite"` on the tally total. Real `<button>`. Focus: 2px dashed `ember-deep`, 3px offset.

### The Tally Strip (`TallySheet.tsx`) — the chart that isn't a chart
- **This is not a line chart. It is a tally sheet.** Ruled paper, sunset marked, time along the bottom. Each stamp is a small ember ink mark stacked in its 5-minute column. Density *is* the curve.
- It builds live as people stamp. Your own marks are slightly darker — you can find yourself in it.
- Honest by construction: it shows the raw measurements, not a smoothed inference. That's the Phase 1 epistemics made visible.
- Season view (`/log`): the same strip, one row per night, stacked — a season of tally sheets on a shelf.

### The Keep (`KeepButton.tsx`)
- A **paper clip** / pin action, not a heart. Copy: *"Keep this"* → *"Kept. It won't be overwritten."*
- The stakes stated plainly nearby: *"The barn's recorder holds about two weeks. What nobody keeps is gone."* This is literally true and it's the strongest sentence on the site.

### Clip card (`ClipCard.tsx`)
- A thermal still **pinned to the board** — slight rotation (±1.5°), pin or tape at the top, paper shadow.
- Tabular timestamp inked below. Ember chip: *"kept by 214 people."*
- The board has no curator. Say so: *"Nobody chose these. You did."*

### Species card (`SpeciesCard.tsx`)
- Field-guide plate: cut-paper bat illustration on kraft → common name (Fraunces) → *scientific name* (italic, `ink-2`) → two lines of character → IUCN chip.
- IUCN chips use the **official Red List colors** — LC `#60C659`, NT `#CCE226`, VU `#F9E814`, EN `#FC7F3F`, CR `#D81E05` — as a dot + tinted fill + **code and word in ink** ("EN · Endangered"). Never color alone (WCAG 1.4.1).
- Copy must say **"may live here."** We have no detection data. Do not imply otherwise.

### Status line (above the window)
Inked, conversational: *"The barn is awake — sunset was 9:04 PM."* / *"Quiet. They usually stir around 8:40."* Schedule always visible: *"Nightly, 30 min before sunset → midnight · May–Aug."*

---

## 5. Motion

- Gated by **both** `prefers-reduced-motion` and a visible **Motion** toggle: `[data-motion="off"] *{animation:none;transition:none}`.
- Inventory — nothing else moves: stamp thunk (120ms) · ink mark landing (280ms, slight bloom) · tally column growing · LIVE mark breathing (slow, 3s) · drawn bat circling in the loading window · shutter closing on offline.
- Easing: `cubic-bezier(.2,.8,.2,1)`. No parallax. No scroll-jacking. No counting-up numbers — ink doesn't animate, it lands.

---

## 6. Voice

Second person, plain, warm, a little wry. Close every loop.

- Hero: **"How many bats live in this barn?"** → **"—"** → *"Nobody knows. Not Great Parks, not us. That's why you're here."*
- Stamp: *"See something move? Stamp it."*
- Keep: *"Keep this — the recorder wipes itself every two weeks."*
- Field guide: *"Six species might be up there. We can't tell them apart yet — that's next year's problem."*
- Mascot beat: **"Screee!"** — sparingly. Footer statement, large, Fraunces: *"See something move up there? **Stamp it.** Screee!"*
- Trust block: Great Parks + Johnson lab attribution · NABat intent · contact · **"◈ Roost location protected for conservation"** stated openly.

Never write: "spot a bat leaving," "emergence," "detected," "AI," or any count we don't have.

---

## 7. Accessibility

- WCAG AA both ink levels on their surfaces. `ember` as text → `ember-deep` only.
- LIVE, IUCN status, kept-state: never color-alone.
- Tally total + watcher count `aria-live="polite"`; tally strip has an `aria-label` summarising the shape ("busiest around 9:10 PM").
- Real `<button>`s, dashed `ember-deep` `:focus-visible` sitewide.
- The window gets a descriptive `aria-label`; clips get alt text.
- Grain overlay is `pointer-events: none` and `aria-hidden`.

---

## 8. Theming

**There is no dark mode.** Two reasons, both deliberate: the paper concept dies without paper, and a dark mode would put a dark window on a dark page — collapsing the one contrast the whole design is built on. Ship the Motion toggle; drop the theme toggle. If someone insists later, the answer is a *deeper dusk paper*, never a dark UI.

Tokens still live as CSS custom properties on `:root` so components style against tokens only — that keeps the option open without building it.

---

## 9. Tailwind mapping

```js
colors: {
  paper: 'var(--paper)', 'paper-2': 'var(--paper-2)',
  kraft: 'var(--kraft)', edge: 'var(--edge)',
  ink: 'var(--ink)', 'ink-2': 'var(--ink-2)', 'ink-3': 'var(--ink-3)',
  night: 'var(--night)',
  ember: 'var(--ember)', 'ember-deep': 'var(--ember-deep)',
  dusk: 'var(--dusk)', sage: 'var(--sage)', live: 'var(--live)',
},
fontFamily: { display: ['var(--font-fraunces)'], body: ['var(--font-atkinson)'] },
boxShadow: { paper: '0 2px 0 var(--edge), 0 6px 14px rgba(34,30,24,.06)' },
```

Component → file: window + states → `LiveStream.tsx` · stamp + thunk + ink → `StampButton.tsx` · tally sheet → `TallySheet.tsx` · keep → `KeepButton.tsx` · pinned stills → `ClipCard.tsx` · field-guide plate → `SpeciesCard.tsx` · watchers → `WatcherCount.tsx` · `MotionToggle.tsx`.

---

## 10. The test

If a screenshot of this could be mistaken for Twitch, Netflix, a SaaS dashboard, or any other nature cam — it's wrong. It should look like **someone made it by hand, and cut a hole in it so you could see the bats.**

---

## Changelog

**v2.1 (2026-07-17) — the barn scene hero.** The Barn page's text hero
("How many bats…" + blank) is replaced by a full-width cut-paper
**barn scene**: a 1200×640 SVG diorama (backdrop disc + wind swirls, ground
mound, curly bare trees, one unified barn silhouette with kraft trim, cupola
with a bat weathervane) with the live window cut into the hayloft — same
hand-cut clip + inner shadow as ever, so the footage stays the only real
thing in a made thing. Bats fly on SMIL motion paths with CSS wing-flaps;
the Motion toggle swaps the flock for a still one (`.bats-fly` /
`.bats-static`). The stamp desk (stamp + keep + tally sheet) moves to its
own section directly below. On <md viewports the scene yields to the plain
window. The colony question lives on in the About page copy.

**v2.2 (2026-07-17) — full-bleed perspective hero.** The diorama zooms in:
an 80vh hero where the barn's gable wall bleeds past every edge (fixed-aspect
1600×850 stage, cover-cropped). The hayloft is a one-point-perspective
beveled portal — thick kraft frame faces receding toward a window that now
takes ~60% of the stage. Roof fascia crosses the top with sky, swirls and
the flock in the corners; hay pulley over the loft; ground strip, grass and
curly trees crop in at the bottom. The wall is kraft so the footage stays
the darkest thing on the page.

**v2.3 (2026-07-17) — edge-anchored hero.** v2.2's cover-crop sacrificed the
roofline at wide viewports. The scene is now layered and edge-anchored:
wall = infinite CSS-planked backdrop; roofline pinned full-width to the top
(non-scaling fascia stroke); portal sized in container units from the hero's
real height (window ≈ 60–70% of the hero at any aspect); ground/trees/grass
pinned to the bottom; flock on an undistorted top-anchored slice overlay.
Status line + stamp desk merged into one continuous paper-2 band directly
under the ground strip, so hero → status → desk reads as one construction.

**v2.4 (2026-07-17) — the Porch, media chrome, classical wall.**
(1) **The Porch** (`ChatPanel.tsx`): a Twitch-layout live-chat rail beside
the window, in paper materials — inked names colored by hash through
dusk/sage/ember-deep, timestamps, no avatars, kindness line under the
input. New contract functions `subscribeToChat` / `sendChatMessage`
(demo simulation inside the seam; `/api/chat` + read-open `chat`
collection in real mode). (2) The window gets a **media bar** — the one
real thing gets real chrome: play/pause, volume (real stream only),
LIVE dot + uptime, watchers, fullscreen, on a hover/touch scrim.
(3) The wall goes **classical-calm** per research: one stage-light radial
gradient (corners ~8% darker), near-subliminal irregular plank seams
(5% ink), a ghosted engraved moon as the single motif, natural-history
**plate rules** around the portal with an engraved sill caption
("FIG. 1 — THE HAYLOFT, LIVE TONIGHT"), fewer tufts, thinner swirls.

**v2.5 (2026-07-17) — the essential hero.** The barn drawing is retired at
the user's direction: the hero is now the paper page itself under one soft
spotlight, the hand-cut window dead center at ~86% of the hero height, and
the flock circling it. No caption, no frame, no illustration furniture.
The Porch is hidden by default — a paper button (top-right) slides it in
over the scene; the window never moves.
