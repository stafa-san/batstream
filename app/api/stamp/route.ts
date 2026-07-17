// POST /api/stamp (docs/DESIGN.md §7) — the only way a stamp is written.
// Rate-limits by clientHash, writes the stamps doc (Phase 2 ground truth),
// increments the current 5-minute tally bucket in the same request (no
// aggregation job), and returns the tally state.
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import type { TallyBucket } from "@/lib/types";

// Best-effort in-memory limiter (per serverless instance). The clientHash
// cap in Firestore below is the durable backstop.
const lastSeen = new Map<string, number>();

function clientHashFrom(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ua = req.headers.get("user-agent") ?? "";
  const daySalt = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${ua}|${daySalt}`).digest("hex");
}

function nightIdNow(): string {
  const edt = new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);
  return `night-${edt}`;
}

function bucketStartNow(): string {
  const t = Date.now();
  return new Date(t - (t % (5 * 60000))).toISOString();
}

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Writes are not configured on this deployment." },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => null)) as {
    siteSlug?: string;
  } | null;
  if (!body?.siteSlug) {
    return NextResponse.json({ error: "siteSlug required." }, { status: 400 });
  }

  const hash = clientHashFrom(req);
  const now = Date.now();
  const last = lastSeen.get(hash) ?? 0;
  if (now - last < 900) {
    return NextResponse.json(
      { error: "One stamp per second — the sheet can wait." },
      { status: 429 },
    );
  }
  lastSeen.set(hash, now);

  const db = adminDb();
  const nightId = nightIdNow();

  // Durable per-night cap (~120 stamps/night per client).
  const nightStamps = await db
    .collection("stamps")
    .where("nightId", "==", nightId)
    .where("clientHash", "==", hash)
    .count()
    .get();
  if (nightStamps.data().count >= 120) {
    return NextResponse.json(
      { error: "That's a full night of stamping — thank you. Rest your thumb." },
      { status: 429 },
    );
  }

  const siteId = "site-winton-woods";
  const bucketStart = bucketStartNow();
  const bucketId = `${nightId}_${bucketStart}`;
  const batch = db.batch();
  batch.set(db.collection("stamps").doc(), {
    siteId,
    nightId,
    timestamp: new Date().toISOString(),
    clientHash: hash,
  });
  batch.set(
    db.collection("tallies").doc(bucketId),
    {
      id: bucketId,
      siteId,
      nightId,
      bucketStart,
      stampCount: FieldValue.increment(1),
      watcherCount: 0,
    },
    { merge: true },
  );
  batch.set(
    db.collection("nights").doc(nightId),
    { stampTotal: FieldValue.increment(1) },
    { merge: true },
  );
  await batch.commit();

  const snap = await db
    .collection("tallies")
    .where("nightId", "==", nightId)
    .orderBy("bucketStart")
    .get();
  const buckets = snap.docs.map((d) => d.data() as TallyBucket);
  return NextResponse.json({
    nightId,
    total: buckets.reduce((s, b) => s + b.stampCount, 0),
    buckets,
  });
}
