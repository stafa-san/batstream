# BatBeacon — Design & Development Spec (Firebase + Vercel POC)

> **Working name:** `BatBeacon` (public brand TBD — "Bat Signal" is the front-runner from the Great Parks meeting).
> **Phase:** Proof of concept. The job of this build is to put a real, clickable, good-looking thing in front of Dr. Johnson, Odun, and Missy so we can validate the *look, the interaction, and the data story* before committing to a production backend.
> **Stack decision:** **Full commit to Firebase + Vercel.** No .NET, no Postgres in this phase. .NET/Postgres is a **deferred future path**, not a parallel track (see §12).
> **Audience for this doc:** Claude Code (and any human collaborators) starting development.

---

## 1. What we're building

A public-facing **live bat-emergence streaming platform** for a bat barn at Winton Woods (Great Parks of Hamilton County, Cincinnati), with an interactive citizen-science layer and a season-long data story. It is the platform half of a larger research collaboration (advisor: Dr. Joseph S. Johnson; co-lead: Odun). This repo is **only the web platform** — edge inference (thermal + acoustic detection on a Raspberry Pi at the barn) is a separate system that will later feed data into this platform.

### Goals (POC)
1. **Livestream** the bat barn (demo stream for now) with a robust, low-friction player.
2. **Engage** visitors with one irresistible interactive hook — a **"Spot a bat!"** action, a guess-the-count game, and live presence. This is the thing Dr. Johnson loved about the Fish Doorbell.
3. **Tell the data story** — nightly emergence counts, species mix, peak times, cumulative season totals, viewer geography. The tangible value we hand Great Parks and the tie-in to national bat monitoring (NABat).
4. **Showcase** best captured moments — "Bat of the Night" clips/stills.
5. **Educate** — why bats matter, which species live here, FAQ.

### Non-goals (this repo, this phase)
- On-device thermal/acoustic inference (lives on the Pi).
- Raw radiometric processing from the FH669.
- AR/mixed reality (Dr. Johnson flagged this "step 2").
- User accounts / auth (public, anonymous engagement only).
- A production relational backend (deferred — see §12).

---

## 2. Reference platforms & what we borrow

| Source | What it does well | What we take |
|---|---|---|
| **Fish Doorbell** (visdeurbel.nl) | One irresistible interactive hook (spot fish → ring → lock keeper acts); season "DataVISuals"; fish-of-the-week photos; weekly YouTube "Journaal"; dark/light + motion toggles; playful mascot voice ("Blub!") | Hero stream + single engagement hook; season data dashboard; "Bat of the Night" gallery; weekly recap embed; theme + reduce-motion toggles; friendly copy |
| **RattleCam** (rattlecam.org) | Multi-site project cards (CO/CA/PA); Learn/Projects education; Video Highlights grid w/ view counts; Donate + newsletter; **undisclosed location** for conservation; scheduled stream-hours copy | Multi-site data model (future barns/parks); education section; highlights grid; donate/newsletter; protected-location handling; dusk/seasonal scheduling copy |

**Interactive hook translation (the core ask):** the Fish Doorbell's "ring the doorbell" becomes **"Spot a bat!"** — when a viewer sees a bat emerge on the live feed they tap the button; the tap broadcasts to all viewers in realtime (live community tally + an echo/pulse animation), and taps are logged as weak human labels we can later cross-check against the AI emergence count. A **guess-the-emergence-count** game runs alongside (predict tonight's total, reveal vs. the AI count).

---

## 3. Architecture

### Stack
- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · hls.js (video) · Recharts (charts). Deploys to **Vercel**.
- **Backend:** **Firebase** — Firestore (persistent data), Realtime Database (live viewer presence), Firebase Admin SDK inside **Vercel serverless route handlers** (`app/api/*`) for trusted writes. No standalone server.
- **Media:** unchanged by Firebase — a looping **demo HLS** asset now (served statically or from any HLS host), MediaMTX + FH669 RTSP later. Firebase/Vercel do not stream video.

### The one rule that makes this whole plan work
**React components never import Firebase.** All data access goes through a single module, **`lib/data/`**, exposing plain functions like `getNightlyEmergence()`, `subscribeToSpots()`, `recordSpot()`. Components call those functions and know nothing about the transport. Today those functions wrap the Firebase SDK; when we later move to .NET/Postgres, we reimplement the *same function signatures* against REST/SignalR and **the entire component tree is untouched**. Keep Firestore document shapes identical to the entity model in §4 and the eventual port is mechanical. This seam is the only migration insurance we need — follow it from the first commit.

### Client SDK vs. Admin SDK (the trust split)
- **Client (browser) — Firebase Web SDK:** realtime reads and listeners. The live page, spot tally, viewer count, and detection ticker use `onSnapshot` (Firestore) and RTDB presence directly in client components. This is what makes it feel live, and it runs on the client, not on Vercel.
- **Server (Vercel serverless) — Firebase Admin SDK:** trusted writes and logic that must not live in the browser — seeding, rate-limiting spots, the guess-reveal, any aggregation. Implemented as Next.js route handlers under `app/api/`.

### Security model (do not skip)
Because the browser reads Firestore directly, **Firestore Security Rules are the backend security** for this POC:
- **Reads:** open on public collections (emergence, species, gallery, detections, geo).
- **Writes:** **denied from the client** on every collection. All writes (spots, guesses, seed) go through Vercel serverless functions using the Admin SDK, which bypasses rules and applies its own rate-limiting/validation.
- RTDB presence: connect/`onDisconnect` writes scoped to a per-connection presence path only.

### Environment variables — two buckets (critical)
```
# PUBLIC — safe to expose, ships to the browser, secured by Firestore rules
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...            # RTDB
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_STREAM_URL=...                        # demo HLS .m3u8

# SERVER-ONLY — Vercel secret, NEVER prefixed NEXT_PUBLIC_
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...                    # service account key
DEMO_ENABLED=true
```
> The Admin service-account key must never get the `NEXT_PUBLIC_` prefix. That single mistake would leak full DB access to the browser.

### Data flow
```
DEMO (now):
[demo HLS] ─────────────────────────────────► <LiveStream/>  (hls.js, client)
[Firestore] ──onSnapshot──► lib/data/ ────────► client components (charts, ticker)
[RTDB]      ──presence────► lib/data/ ────────► ViewerCount
client action ─► app/api/* (Admin SDK) ─► Firestore ─onSnapshot─► all viewers

PRODUCTION (later, documented only):
[FLIR FH669] ─RTSP─► [MediaMTX] ─HLS/WebRTC─► <LiveStream/>
[Pi edge]    ─► ingestion endpoint ─► data store ─► platform
```

### Repo structure
```
batbeacon/
├── README.md
├── .env.example
├── firebase/
│   ├── firestore.rules
│   ├── database.rules.json          # RTDB presence rules
│   └── firestore.indexes.json
├── docs/
│   ├── DESIGN.md                    # this file
│   └── migration-to-dotnet.md       # deferred-path notes (see §12)
├── scripts/
│   └── seed.ts                      # Node + Admin SDK demo seeder
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     # Live (home)
│   ├── data/page.tsx                # Bat-a-lytics dashboard
│   ├── gallery/page.tsx             # Bat of the Night
│   ├── bats/page.tsx                # Species
│   ├── about/page.tsx
│   ├── why/page.tsx
│   ├── faq/page.tsx
│   └── api/
│       ├── spots/route.ts           # POST — Admin SDK, rate-limited
│       ├── guess/route.ts           # POST + reveal — Admin SDK
│       └── seed/route.ts            # POST — dev-only, guarded
├── components/
│   ├── LiveStream.tsx
│   ├── SpotButton.tsx
│   ├── ViewerCount.tsx
│   ├── LiveTicker.tsx
│   ├── EmergenceChart.tsx
│   ├── SeasonSummary.tsx
│   ├── SpeciesGrid.tsx
│   ├── GalleryCarousel.tsx
│   ├── GuessGame.tsx
│   ├── ViewerGeoMap.tsx
│   ├── ThemeToggle.tsx
│   ├── MotionToggle.tsx
│   └── Nav.tsx / Footer.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts                # Web SDK init (client only)
│   │   └── admin.ts                 # Admin SDK init (server only)
│   ├── data/                        # THE SEAM — only place Firebase is touched
│   │   ├── index.ts                 # public API surface (stable signatures)
│   │   ├── emergence.ts
│   │   ├── detections.ts
│   │   ├── species.ts
│   │   ├── gallery.ts
│   │   ├── spots.ts
│   │   ├── guess.ts
│   │   ├── presence.ts              # RTDB
│   │   └── geo.ts
│   ├── types.ts                     # shared domain types / DTOs
│   └── hooks/                       # useEmergence, useLivePresence, useSpots, ...
├── styles/globals.css
├── package.json
└── next.config.js
```

---

## 4. Data model (Firestore collections / RTDB)

Multi-site from day one (RattleCam pattern) even though the POC has one site. Keep these shapes stable — they become the .NET entity model verbatim later.

**Firestore collections**
- **`sites`** — `{ id, name, slug, locationLabel, isLocationProtected, description, timeZone, status (Live|Offline|Seasonal), streamUrl }`
- **`emergenceCounts`** — `{ id, siteId, date, count, peakTime?, method (Thermal|Fused|Manual), isEstimate }`
- **`detections`** — `{ id, siteId, timestamp, modality (Thermal|Acoustic|Fused), speciesId?, confidence, clipUrl?, thumbnailUrl? }`
- **`species`** — `{ id, commonName, scientificName, description, imageUrl, conservationStatus, isLocal }`
- **`galleryItems`** — `{ id, siteId, capturedAt, type (Clip|Still), mediaUrl, thumbnailUrl, caption, isFeatured }`
- **`spots`** — `{ id, siteId, sessionId?, createdAt, clientHash }` (anonymous "I saw a bat" tap; `clientHash` = hashed IP+UA for rate-limiting, not identity)
- **`guesses`** — `{ id, siteId, date, predictedCount, actualCount?, clientHash, createdAt }`
- **`viewerGeo`** — `{ id, siteId, countryCode, count }` (aggregate, demo-generated)

**Realtime Database (ephemeral only)**
- **`presence/{siteSlug}/{connectionId}`** — presence records with `onDisconnect` cleanup; the live viewer count is a count of children. RTDB is used here (not Firestore) because it has native presence/disconnect handling.

**Local Ohio species to seed** (realistic demo + Species page): Big Brown Bat (*Eptesicus fuscus*), Little Brown Bat (*Myotis lucifugus*, WNS-affected), Eastern Red Bat (*Lasiurus borealis*), Hoary Bat (*Lasiurus cinereus*), Tricolored Bat (*Perimyotis subflavus*, proposed endangered), Indiana Bat (*Myotis sodalis*, endangered). Surface conservation status prominently — it strengthens the public-good story.

---

## 5. `lib/data/` contract (the stable API surface)

Components import only from `lib/data`. Signatures below stay identical across the Firebase→.NET move; only the bodies change.

```ts
// reads (one-shot)
getSite(slug: string): Promise<Site>
getNightlyEmergence(slug: string, from?: string, to?: string): Promise<EmergenceCount[]>
getSeasonSummary(slug: string): Promise<SeasonSummary>
getSpecies(): Promise<Species[]>
getGallery(slug: string, featuredOnly?: boolean): Promise<GalleryItem[]>
getViewerGeo(slug: string): Promise<ViewerGeo[]>
getTodayGuess(slug: string): Promise<GuessState>

// realtime subscriptions (return an unsubscribe fn)
subscribeToSpots(slug: string, cb: (tally: SpotTally) => void): Unsubscribe
subscribeToDetections(slug: string, cb: (d: Detection) => void): Unsubscribe
subscribeToViewerCount(slug: string, cb: (n: number) => void): Unsubscribe   // RTDB

// writes (these call app/api/* → Admin SDK; never write client-side)
recordSpot(slug: string): Promise<SpotTally>
submitGuess(slug: string, predictedCount: number): Promise<void>
```

> Realtime reads may use `onSnapshot` directly inside these functions; writes must route through the serverless endpoints so rules stay locked and rate-limiting is enforced.

---

## 6. Serverless endpoints (Vercel route handlers, Admin SDK)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/spots` | body `{ siteSlug }` → rate-limit by `clientHash`, write spot, return updated tally |
| POST | `/api/guess` | body `{ siteSlug, predictedCount }` → write guess (one per client/night) |
| POST | `/api/seed` | dev-only, guarded by `DEMO_ENABLED` + a shared token → runs/refreshes demo data |

Everything else is a direct client read/subscription through `lib/data`. Keep guess-reveal logic (attaching `actualCount`) server-side.

---

## 7. Demo data & "feels live" simulation

**Seeder (`scripts/seed.ts`, Admin SDK):** seeds a full plausible season so every page has content:
- **emergenceCounts:** one row per night across a maternity season (e.g., 15 May – 31 Aug). Shape the curve like a real colony — low in spring, ramping to a mid-summer peak (pups volant ~July), tapering in August, with nightly noise + a few weather-suppressed low nights.
- **detections:** thousands of rows across nights, weighted to the local species, mostly Thermal + a subset Acoustic + some Fused; each with confidence + placeholder thumbnail.
- **species:** the 6 local species with real descriptions, conservation status, placeholder images.
- **galleryItems:** ~12 "Bat of the Night" stills/clips (placeholder thermal-style assets), a few featured.
- **viewerGeo:** spread across US states + a global tail (US, CA, GB, BR, DE, NL, IN…) echoing the Fish Doorbell's global-reach story.
- **sites:** one site "Winton Woods Bat Barn," `isLocationProtected: true` → UI shows "Location protected for conservation."

**Simulation (optional, makes the live page breathe without a camera):** a lightweight client interval (or a scheduled function) that, during a configured "dusk window," writes occasional synthetic detections and nudges a demo viewer-count value so the ticker and tally show live movement during a demo. Gate behind `DEMO_ENABLED`.

---

## 8. Livestream integration

- **POC:** `NEXT_PUBLIC_STREAM_URL` → a looping demo HLS playlist. `LiveStream.tsx` plays it via hls.js with a graceful "stream offline / seasonal" fallback driven by the site's `status`.
- **Production (documented, not built):** FH669 RTSP → MediaMTX → HLS (+ WebRTC for low latency) → frontend. The FH669 is an IP/RTSP camera so this path is native; the open questions to validate separately are raw-frame access vs. compressed stream and pixels-on-target at the barn. Emergence/detection data will arrive from the Pi via a future ingestion endpoint (out of scope here).

---

## 9. Design system

Dark-first (both references default dark), with a light toggle and a **reduce-motion** toggle (Fish Doorbell parity + accessibility).

- **Mood:** dusk / thermal. Deep indigo-charcoal base, warm **amber/gold** primary (bat-at-dusk + thermal warmth), teal secondary, high-contrast text.
- **Suggested Tailwind tokens:** `bg #14121f`, `surface #1e1b2e`, `primary #f5a524` (amber), `secondary #2dd4bf` (teal), `text #f4f2ff`, `muted #a29fb8`; provide light-mode equivalents.
- **Type:** bold rounded display for headings (friendly, à la Fish Doorbell), clean sans for body.
- **Motion:** subtle pulse/echo on the Spot button (evokes echolocation) + count-up animations; all gated by the motion toggle and `prefers-reduced-motion`.
- **Accessibility:** WCAG AA contrast, full keyboard nav, ARIA on interactive controls, alt/captions on media.
- **Mascot voice:** a bat catchphrase mirroring "Blub!" (candidate: "Screee!" / "Echo!"); keep copy warm and playful.

> When building actual components, consult the repo's `frontend-design` conventions first.

---

## 10. Pages (POC scope)

1. **Live (home)** — hero `LiveStream` (demo HLS) · `ViewerCount` (RTDB) · `SpotButton` + live community tally · `LiveTicker` of recent detections · tonight's running count · seasonal/offline fallback.
2. **Data / "Bat-a-lytics"** — `EmergenceChart` (season time series) · `SeasonSummary` (cumulative, peak night, avg/night) · species mix · `ViewerGeoMap` · `GuessGame`.
3. **Gallery** — "Bat of the Night" carousel from `galleryItems`.
4. **Bats** — `SpeciesGrid` with conservation status.
5. **About / Why / FAQ** — educational content (can be static MDX for the POC).

---

## 11. Build order (milestones for Claude Code)

Each milestone should run and be demoable on its own.

1. **Scaffold:** Next.js + TS + Tailwind on Vercel; Firebase project (Firestore + RTDB); `.env.example` (two buckets); `firebase/firestore.rules` + `database.rules.json` with **reads-open / client-writes-denied** from the start.
2. **`lib/firebase` + `lib/data` + `lib/types`:** init client & admin SDKs; implement the full `lib/data` contract (§5) against Firebase. Nothing else imports Firebase.
3. **Seeder:** `scripts/seed.ts` + guarded `/api/seed`; populate Firestore; verify data reads through `lib/data`.
4. **App shell:** layout, `Nav`/`Footer`, theme + motion toggles, Tailwind tokens.
5. **Live page:** `LiveStream` (demo HLS) + `ViewerCount` (RTDB presence) + `SpotButton` → `/api/spots` → live tally via `subscribeToSpots` + `LiveTicker`.
6. **Data dashboard:** `EmergenceChart`, `SeasonSummary`, species mix, `ViewerGeoMap`.
7. **Gallery + Species + content pages** (About / Why / Bats / FAQ).
8. **GuessGame:** `/api/guess` + reveal-vs-AI-count.
9. **Polish & deploy:** responsive pass, a11y pass, Firestore-rules review, Vercel env config (public vs. server secret), `docs/migration-to-dotnet.md`.

---

## 12. Deferred path: moving to .NET/Postgres later

We are **not** building this now. It's captured so today's choices don't paint us into a corner.

- **What triggers the move:** heavier analytics, the Pi ingestion pipeline wanting a real relational time-series store, cost at scale, or wanting the trusted layer back in C#. Let a concrete pressure decide the timing — not a schedule.
- **Why it stays cheap:** the entire frontend talks only to `lib/data` (§5). The port is reimplementing those function bodies against an **ASP.NET Core 8 + SignalR + EF Core/Postgres** backend — REST for reads/writes, SignalR replacing the `onSnapshot`/RTDB subscriptions. Component tree untouched.
- **Why the shapes line up:** the Firestore collections in §4 map 1:1 to EF Core entities; the serverless endpoints in §6 map to controllers; RTDB presence maps to a SignalR presence hub.
- **What never changes in either phase:** the media layer (demo HLS now, MediaMTX + FH669 later) and everything under `components/`, `app/` pages, and the design system.

---

## 13. Open items to confirm (not blockers for the POC)
- Public brand name + mascot catchphrase.
- Whether live **chat** is in scope for the first public version or a later add.
- Great Parks dependencies (camera stream access, barn connectivity) — tracked in the separate system-requirements doc, not this repo.
