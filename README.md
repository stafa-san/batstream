# The Bat Barn (`batstream`)

Nobody knows how many bats live in this barn — and until the AI exists, the
people watching are the only instrument we have.

A live view into the Winton Woods bat barn (Great Parks of Hamilton County)
with two crowd mechanics: **Stamp** (tap when you see something move — a
timestamped measurement on tonight's tally) and **Keep** (save a moment before
the barn's recorder overwrites it, ~every two weeks).

## Specs — read before building
- [`docs/DESIGN.md`](docs/DESIGN.md) — Phase 1 platform spec (architecture, data model, build order §10)
- [`docs/UI-DESIGN.md`](docs/UI-DESIGN.md) — the "Paper Barn" visual system (§10 is the acceptance test)

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · hls.js · Firebase
(Firestore + RTDB, Admin SDK in Vercel route handlers) · Vercel.

**The one architectural rule:** no component imports Firebase. All data access
goes through `lib/data/` — that seam is what keeps the deferred .NET/Postgres
move cheap (`docs/DESIGN.md` §11).

## Workflow
Branches: `dev` → merges into `main`; `main` auto-deploys to Vercel.

## Setup
```bash
npm install
cp .env.example .env.local   # fill both buckets — see comments in the file
npm run dev
```

Security rules live in [`firebase/`](firebase/) — client writes are denied
everywhere; deploy them before seeding (`firebase/README.md`).

## Build status
All 9 milestones built (see `docs/DESIGN.md` §10). Runs fully on built-in
demo fixtures until Firebase is seeded:

1. Create the RTDB instance + a service-account key, fill `.env.local`
2. Deploy rules: `firebase/` (client writes are denied everywhere)
3. `npm run seed`, then set `NEXT_PUBLIC_FIREBASE_DATA_READY=true`
