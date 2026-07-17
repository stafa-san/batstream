# Firebase security rules

Deploy with the Firebase CLI (`firebase deploy --only firestore:rules,database`)
or paste into the console (Firestore → Rules, Realtime Database → Rules).

## Firestore (`firestore.rules`)
Reads are open on the public collections; **all client writes are denied**.
Every write goes through the Admin SDK in Vercel route handlers, which bypasses
rules and enforces rate limits. `stamps` and `keeps` (raw provenance containing
`clientHash`) are neither readable nor writable from clients — the `tallies`
collection is their public view.

## Realtime Database (`database.rules.json`)
Only `presence/{siteSlug}/{connId}` is usable: anyone may read a site's
presence list (the watcher count), and a client may only **create** a new
presence record or **remove** one (the `onDisconnect` cleanup writes `null`).
Existing records can't be overwritten, and values are limited to a
number/boolean, so the surface is a timestamp-sized flag per connection.
Without auth this can't be per-user scoped — this create-or-delete-only rule
is the Phase 1 compromise; revisit if presence abuse ever shows up.
