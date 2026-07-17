// Dev-only seeding endpoint (docs/DESIGN.md §7). Double-guarded:
// DEMO_ENABLED must be "true" AND the caller must present SEED_TOKEN.
import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import * as fixtures from "@/lib/data/fixtures";

export async function POST(req: Request) {
  if (process.env.DEMO_ENABLED !== "true") {
    return NextResponse.json({ error: "Seeding is disabled." }, { status: 403 });
  }
  const token = req.headers.get("x-seed-token");
  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "Bad seed token." }, { status: 401 });
  }
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin SDK not configured on this deployment." },
      { status: 503 },
    );
  }

  const db = adminDb();
  const today = new Date().toISOString().slice(0, 10);
  await db.collection("sites").doc(fixtures.site.id).set(fixtures.site);

  const nights = fixtures.pastNights(today);
  let batch = db.batch();
  let ops = 0;
  for (const night of nights) {
    batch.set(db.collection("nights").doc(night.id), night);
    ops++;
    for (const bucket of fixtures.makeBuckets(night)) {
      batch.set(db.collection("tallies").doc(bucket.id), bucket);
      if (++ops >= 450) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
  }
  for (const clip of fixtures.clips) {
    batch.set(db.collection("clips").doc(clip.id), clip);
    ops++;
  }
  for (const sp of fixtures.speciesList) {
    batch.set(db.collection("species").doc(sp.id), sp);
    ops++;
  }
  for (const geo of fixtures.viewerGeo) {
    batch.set(db.collection("viewerGeo").doc(geo.id), geo);
    ops++;
  }
  if (ops > 0) await batch.commit();

  return NextResponse.json({
    ok: true,
    nights: nights.length,
    clips: fixtures.clips.length,
    species: fixtures.speciesList.length,
  });
}
