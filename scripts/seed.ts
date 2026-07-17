// Seed Firestore with the deterministic demo season (docs/DESIGN.md §9).
// Runs locally with Admin credentials in .env.local — the service key never
// ships anywhere:  npm run seed
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

async function main() {
  // Relative imports — tsx doesn't resolve the "@/" alias outside Next.
  const { isAdminConfigured, adminDb } = await import("../lib/firebase/admin");
  if (!isAdminConfigured()) {
    console.error(
      "FIREBASE_ADMIN_* env vars missing in .env.local — generate a service-account key\n" +
        "(Firebase console → Project settings → Service accounts) and fill them in.",
    );
    process.exit(1);
  }
  const fixtures = await import("../lib/data/fixtures");
  const db = adminDb();
  const today = new Date().toISOString().slice(0, 10);

  console.log("Seeding site…");
  await db.collection("sites").doc(fixtures.site.id).set(fixtures.site);

  const nights = fixtures.pastNights(today);
  console.log(`Seeding ${nights.length} nights + tally buckets…`);
  let writer = db.batch();
  let ops = 0;
  const flush = async () => {
    await writer.commit();
    writer = db.batch();
    ops = 0;
  };
  for (const night of nights) {
    writer.set(db.collection("nights").doc(night.id), night);
    ops++;
    for (const bucket of fixtures.makeBuckets(night)) {
      writer.set(db.collection("tallies").doc(bucket.id), bucket);
      if (++ops >= 450) await flush();
    }
    if (ops >= 450) await flush();
  }
  if (ops > 0) await flush();

  console.log(`Seeding ${fixtures.clips.length} clips…`);
  for (const clip of fixtures.clips) {
    await db.collection("clips").doc(clip.id).set(clip);
  }

  console.log(`Seeding ${fixtures.speciesList.length} species…`);
  for (const sp of fixtures.speciesList) {
    await db.collection("species").doc(sp.id).set(sp);
  }

  console.log("Seeding viewer geography…");
  for (const geo of fixtures.viewerGeo) {
    await db.collection("viewerGeo").doc(geo.id).set(geo);
  }

  console.log(
    "\nDone. Set NEXT_PUBLIC_FIREBASE_DATA_READY=true in .env.local (and Vercel)\n" +
      "so lib/data reads Firestore instead of the built-in fixtures.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
