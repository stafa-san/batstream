# The Bat Barn — Phase 1 Platform Spec

> **Phase:** Proof of Concept. Livestream + crowd engagement. **No AI.**
> **Stack:** Firebase + Vercel. Full commit. .NET is a deferred path (§11).
> **Companion:** `UI-DESIGN.md` — the visual system. Read both before building.
> **Audience:** Claude Code.

---

## 1. The one sentence

**Nobody knows how many bats live in this barn — and until the AI exists, the people watching are the only instrument we have.**

Great Parks built the barn and cannot answer the most basic question about it. Phase 1 has no detector. So the crowd *is* the detector: every viewer tap is a timestamped measurement, and together they draw the night's activity. Phase 2's AI will later be validated against what the crowd drew.

This is not a metaphor and not a like button. It's the honest state of the system, turned into the product.

---

## 2. Ground truth (the constraints that shape everything)

| Fact | Consequence for the build |
|---|---|
| **One barn, one camera.** FLIR FH-669, fixed in a corner, wide view of the whole interior. | No camera switcher. No PTZ. One canonical view. Multi-site stays in the data model but not the UI. |
| **Bats fly *inside*.** They circle the roost as light falls (pre-emergence swarming), then some exit through an opening. | The hook is **activity**, not emergence. Never write copy about "leaving the barn." |
| **The recorder overwrites.** ~1 TB, wraps in roughly two weeks. | **This is a feature.** A viewer tap that saves a clip genuinely rescues it from deletion. Real consequence, zero AI. |
| **No AI, no species ID, no counts.** | No detection feed. No emergence chart. No guess-the-count game. The species page is a *field guide*, not a results page. |
| **Nightly + seasonal rhythm.** Roughly May–Aug; action is around sunset. | Schedule is first-class UI. Offline is a designed state, not an error. |

---

## 3. The three mechanics

Only two ship in Phase 1. The third is named so we build toward it.

| | What the viewer does | What actually happens | Phase |
|---|---|---|---|
| **Stamp** | Taps when they see something move | Timestamped measurement → lands on tonight's tally → becomes Phase 2 ground truth | **1** |
| **Keep** | Saves a moment | That clip is flagged for retention and survives the overwrite | **1** |
| **Follow** | Follows a named individual | PIT tag + RFID at the opening → identity → relationships across seasons | 2+ |

**Rule that governs all of them: the public never actuates anything that touches a bat.** No lights, no sounds, no doors, no motors. Stamps and Keeps act on *data*, never on animals. This is a hard line — it is why the project survives permitting and why Great Parks trusts us.

---

## 4. Architecture

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · hls.js · Vercel.
- **Backend:** Firebase — Firestore (persistent), Realtime Database (live presence), Admin SDK inside Vercel route handlers for trusted writes. No standalone server.
- **Media:** demo HLS loop now; MediaMTX ← RTSP later. Firebase/Vercel do not stream video.

### The rule that makes the .NET move cheap later
**No component imports Firebase.** Everything goes through `lib/data/` — plain functions (`getTonight()`, `subscribeToTally()`, `recordStamp()`). Components know nothing about transport. Later, reimplement those bodies against REST/SignalR; the component tree never changes. Follow this from the first commit.

### Trust split
- **Client (Web SDK):** realtime reads only — `onSnapshot` for the tally, RTDB for watcher presence.
- **Server (Admin SDK in `app/api/*`):** every write — stamps, keeps, seeding. Rate-limited, validated.

### Security (do not defer)
Firestore rules: **reads open on public collections, client writes denied everywhere.** All writes route through serverless. RTDB presence writes scoped to the connection's own path. Write these rules in milestone 1, not at the end.

### Env — two buckets
```
# PUBLIC (ships to browser, secured by rules)
NEXT_PUBLIC_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / DATABASE_URL / STORAGE_BUCKET / APP_ID
NEXT_PUBLIC_STREAM_URL          # demo HLS .m3u8

# SERVER ONLY — never prefix NEXT_PUBLIC_
FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY
DEMO_ENABLED=true
SEED_TOKEN=...
```

---

## 5. Data model (Firestore)

Shapes stay stable — they become the .NET entities verbatim later.

- **`sites`** — `{ id, name, slug, locationLabel, isLocationProtected, timeZone, status: Live|Offline|Seasonal, streamUrl, seasonStart, seasonEnd }`
- **`nights`** — `{ id, siteId, date, sunset, streamOpen, streamClose, stampTotal, watcherPeak, clipCount, note? }` — one doc per night; the season is a collection of these.
- **`tallies`** — `{ id, siteId, nightId, bucketStart, stampCount, watcherCount }` — 5-minute buckets. **This is what the tally strip reads.** Written by incrementing, never recomputed.
- **`stamps`** — `{ id, siteId, nightId, timestamp, clientHash }` — raw provenance. Phase 2 validates the AI against these.
- **`clips`** — `{ id, siteId, nightId, capturedAt, mediaUrl, thumbUrl, caption?, keepCount, isFeatured }` — a clip exists *because* someone kept it.
- **`keeps`** — `{ id, siteId, clipId, timestamp, clientHash }`
- **`species`** — `{ id, commonName, scientificName, blurb, illustrationKey, iucn, tags[] }` — **field guide only. No counts, no detections.**
- **`viewerGeo`** — `{ id, siteId, countryCode, count }`

**RTDB (ephemeral):** `presence/{siteSlug}/{connId}` with `onDisconnect` cleanup. Watcher count = child count. RTDB not Firestore, because it has native presence.

**Explicitly absent in Phase 1:** `detections`, `emergenceCounts`, `guesses`. Do not add them. Their absence is the point.

**Species to seed (field guide):** Big Brown (*Eptesicus fuscus*), Little Brown (*Myotis lucifugus*, WNS-affected), Eastern Red (*Lasiurus borealis*), Hoary (*Lasiurus cinereus*), Tricolored (*Perimyotis subflavus*, proposed endangered), Indiana (*Myotis sodalis*, endangered). Copy says "*may* live here" — we have no detection data and must not imply we do.

---

## 6. `lib/data/` contract

```ts
// reads
getSite(slug): Promise<Site>
getTonight(slug): Promise<Night>                 // tonight's doc + sunset + status
getNight(slug, date): Promise<NightDetail>       // one log page
getSeason(slug): Promise<Night[]>                // the log index
getClips(slug, opts?): Promise<Clip[]>           // the board
getSpecies(): Promise<Species[]>
getViewerGeo(slug): Promise<ViewerGeo[]>

// realtime (return unsubscribe)
subscribeToTally(slug, nightId, cb): Unsubscribe       // Firestore onSnapshot
subscribeToWatchers(slug, cb): Unsubscribe             // RTDB presence
subscribeToStampPulse(slug, cb): Unsubscribe           // others' stamps, for the live ink

// writes — call app/api/*, never write client-side
recordStamp(slug): Promise<TallyState>
keepMoment(slug, atTimestamp): Promise<Clip>
```

---

## 7. Serverless endpoints

| Method | Route | Does |
|---|---|---|
| POST | `/api/stamp` | rate-limit by `clientHash` (~1/sec, ~120/night) → write `stamps` doc → `FieldValue.increment` the current `tallies` bucket → increment `nights.stampTotal`. Returns tally state. |
| POST | `/api/keep` | mark the ±15s window around `atTimestamp` for retention → create-or-increment `clips` → write `keeps`. Returns the clip. |
| POST | `/api/seed` | dev-only, guarded by `DEMO_ENABLED` + `SEED_TOKEN`. |

Increment the bucket in the same request as the stamp — no aggregation job, no cron. That keeps the whole thing serverless.

---

## 8. Pages

1. **The Barn** (`/`) — the window (live feed), the stamp, tonight's tally strip, watcher count, schedule/status. Everything else is secondary.
2. **The Log** (`/log`, `/log/[date]`) — one page per night: that night's tally sheet, sunset, watchers, clips kept. The season is a shelf of these.
3. **The Board** (`/board`) — clips the crowd kept. Each shows "kept by 214 people." **This gallery has no curator — the crowd made it.**
4. **The Bats** (`/bats`) — illustrated field guide. Who *might* be up there.
5. **About / FAQ** (`/about`) — the colony question, Great Parks + lab attribution, protected location, NABat intent, how the stamp works.

**The hero number is a blank.** "How many bats live in this barn?" → **"—"** → "Nobody knows yet. That's the whole point." The real numbers underneath are the crowd's: stamps, nights, watchers, countries. Those are honest.

---

## 9. Demo data

`scripts/seed.ts` (Admin SDK, local — the service key never ships):
- **nights:** a full season (May 15 – Aug 31), each with sunset, stampTotal shaped like a real night — near-zero by day, a steep ramp ~20 min before sunset, a peak, a taper. A few weather-suppressed nights.
- **tallies:** 5-min buckets across each night matching that curve. This is what makes the tally strip look alive.
- **clips:** ~14 kept moments with placeholder thermal-style stills, varied `keepCount`, a couple featured.
- **species:** the six above.
- **viewerGeo:** US-heavy with a global tail (CA, GB, BR, DE, NL, IN…).
- **site:** `winton-woods-bat-barn`, `isLocationProtected: true`.

**Live simulation (demo only, `DEMO_ENABLED`):** a gentle client interval that nudges watcher count and fires occasional synthetic stamps during the dusk window, so the page breathes in a demo. Never in production.

---

## 10. Build order

1. **Scaffold** — Next + TS + Tailwind on Vercel; Firebase project; `.env.example` (two buckets); **`firestore.rules` with client-writes-denied written now.**
2. **`lib/firebase` + `lib/data` + `lib/types`** — full contract (§6) against Firebase. Nothing else imports Firebase.
3. **Seeder** — `scripts/seed.ts` + guarded `/api/seed`; verify reads through `lib/data`.
4. **Design foundation** — tokens, fonts, paper texture, grain. Follow `UI-DESIGN.md` §2–3 exactly.
5. **The Barn** — window + stamp + tally strip + watchers + status/schedule. This is the product; spend the time here.
6. **The Log** — season index + night pages.
7. **The Board** — kept clips.
8. **The Bats + About/FAQ** — field guide, static content.
9. **Polish** — responsive, a11y pass, rules review, Vercel env split, `docs/migration-to-dotnet.md`.

---

## 11. Deferred: .NET/Postgres

Not now. Captured so today's choices don't trap us.
- **Trigger:** Phase 2's edge pipeline wanting a real time-series store, cost at scale, or wanting the trusted layer back in C#.
- **Why it's cheap:** the frontend only talks to `lib/data` (§6). Port those bodies to ASP.NET Core + SignalR + EF Core. Components untouched.
- **Mapping:** Firestore collections (§5) → EF entities. `app/api/*` → controllers. RTDB presence → SignalR hub.
- **Never changes:** the media layer, `components/`, pages, and the design system.

---

## 12. Open
- Public brand name (working: BatBeacon; "Bat Signal" was the meeting front-runner).
- Great Parks dependencies (RTSP access, network, retention sign-off) — tracked in the requirements doc, not here.
