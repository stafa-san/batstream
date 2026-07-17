# Deferred path: Firebase → ASP.NET Core / Postgres

Not scheduled. This documents *how*, so nothing built today blocks it
(docs/DESIGN.md §11). The move is cheap because of one rule enforced since
the first commit: **nothing outside `lib/data/` imports Firebase.**

## What moves and what doesn't

| Today | Later | Changes |
|---|---|---|
| `lib/data/index.ts` function bodies | REST + SignalR clients | bodies only — signatures in §6 are frozen |
| Firestore collections (§5) | EF Core entities, 1:1, same field names | none — shapes were designed for this |
| `app/api/stamp` / `keep` / `seed` | ASP.NET Core controllers | port rate-limit + increment logic |
| RTDB `presence/*` | SignalR presence hub | `subscribeToWatchers` body |
| Firestore `onSnapshot` (tally, pulse) | SignalR groups per night | `subscribeToTally` / `subscribeToStampPulse` bodies |
| `firebase/firestore.rules` | goes away — API becomes the trust boundary | keep the same posture: reads open, writes validated server-side |
| Components, pages, design system, media layer | untouched | — |

## Contract → endpoint sketch

```
getSite(slug)                      GET  /api/sites/{slug}
getTonight(slug)                   GET  /api/sites/{slug}/tonight
getNight(slug, date)               GET  /api/sites/{slug}/nights/{date}
getSeason(slug)                    GET  /api/sites/{slug}/nights
getClips(slug, opts)               GET  /api/sites/{slug}/clips
getSpecies()                       GET  /api/species
getViewerGeo(slug)                 GET  /api/sites/{slug}/geo
subscribeToTally(slug, nightId)    SignalR group: tally:{nightId}
subscribeToWatchers(slug)          SignalR group: presence:{slug}
subscribeToStampPulse(slug)        SignalR group: pulse:{slug}
recordStamp(slug)                  POST /api/stamp   (same body/limits)
keepMoment(slug, at)               POST /api/keep    (same body/window)
```

## Notes for the port
- `tallies` buckets are written by increment, never recomputed — keep that
  invariant in Postgres (`UPDATE … SET stamp_count = stamp_count + 1`) so the
  strip stays raw-measurement-honest.
- `stamps` rows are the Phase-2 ground truth; migrate them losslessly
  (id, siteId, nightId, timestamp, clientHash).
- The demo fixtures + simulation (`lib/data/fixtures.ts`, `demo-store.ts`)
  are transport-independent and stay as the no-backend dev mode.
- Time zone: all night math assumes `America/New_York`; make it a site field
  end-to-end when multi-site becomes real.
