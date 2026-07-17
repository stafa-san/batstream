// POST /api/keep (docs/DESIGN.md §7) — flag the ±15s window around
// atTimestamp for retention; create-or-increment the clip; record the keep.
// Acts on data only — never on anything that touches a bat.
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

function clientHashFrom(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ua = req.headers.get("user-agent") ?? "";
  const daySalt = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${ua}|${daySalt}`).digest("hex");
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
    atTimestamp?: string;
  } | null;
  if (!body?.siteSlug || !body.atTimestamp || isNaN(Date.parse(body.atTimestamp))) {
    return NextResponse.json(
      { error: "siteSlug and atTimestamp required." },
      { status: 400 },
    );
  }

  const at = new Date(body.atTimestamp);
  // Snap the keep to a 30s window so simultaneous keeps of the same moment
  // land on the same clip and increment it.
  const window = new Date(at.getTime() - (at.getTime() % 30000)).toISOString();
  const edt = new Date(at.getTime() - 4 * 3600_000).toISOString().slice(0, 10);
  const nightId = `night-${edt}`;
  const siteId = "site-winton-woods";
  const clipId = `clip-${nightId}-${window.replace(/[:.]/g, "")}`;

  const db = adminDb();
  const batch = db.batch();
  batch.set(
    db.collection("clips").doc(clipId),
    {
      id: clipId,
      siteId,
      nightId,
      capturedAt: window,
      mediaUrl: "", // the edge recorder fills these when retention lands
      thumbUrl: "",
      keepCount: FieldValue.increment(1),
      isFeatured: false,
    },
    { merge: true },
  );
  batch.set(db.collection("keeps").doc(), {
    siteId,
    clipId,
    timestamp: new Date().toISOString(),
    clientHash: clientHashFrom(req),
  });
  batch.set(
    db.collection("nights").doc(nightId),
    { clipCount: FieldValue.increment(1) },
    { merge: true },
  );
  await batch.commit();

  const clip = await db.collection("clips").doc(clipId).get();
  return NextResponse.json(clip.data());
}
