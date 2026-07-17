// POST /api/chat — porch talk. Same trust model as every write: client
// never touches Firestore; validate + rate-limit here, Admin SDK writes.
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";

const lastSeen = new Map<string, number>();

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
    name?: string;
    text?: string;
  } | null;
  const name = body?.name?.trim().slice(0, 24);
  const text = body?.text?.trim().slice(0, 240);
  if (!body?.siteSlug || !name || !text) {
    return NextResponse.json(
      { error: "siteSlug, name and text required." },
      { status: 400 },
    );
  }

  const hash = clientHashFrom(req);
  const now = Date.now();
  if (now - (lastSeen.get(hash) ?? 0) < 2000) {
    return NextResponse.json(
      { error: "Easy — one thought at a time." },
      { status: 429 },
    );
  }
  lastSeen.set(hash, now);

  await adminDb().collection("chat").add({
    siteId: "site-winton-woods",
    name,
    text,
    at: new Date().toISOString(),
    clientHash: hash,
  });
  return NextResponse.json({ ok: true });
}
