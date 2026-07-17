// THE SEAM (docs/DESIGN.md §4, §6). Components import ONLY from lib/data.
// These signatures are the stable contract — when the backend moves to
// .NET/Postgres, the bodies change and nothing else does.
//
// Transport today: Firestore/RTDB reads on the client, writes via app/api/*
// (Admin SDK). When Firebase isn't configured (fresh checkout, no env), the
// deterministic demo fixtures + simulation take over so the product is
// always demoable. Components cannot tell the difference.
import type {
  Clip,
  Night,
  NightDetail,
  Species,
  StampPulse,
  TallyBucket,
  TallyState,
  Unsubscribe,
  ViewerGeo,
} from "@/lib/types";
import { Site } from "@/lib/types";
import * as fixtures from "./fixtures";
import { demoStore } from "./demo-store";

function firebaseReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_DATA_READY === "true",
  );
}

function todayIso(): string {
  // Site-local date (EDT during the season).
  return new Date(Date.now() - 4 * 3600_000).toISOString().slice(0, 10);
}

/* ================= reads ================= */

export async function getSite(slug: string): Promise<Site> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, limit, query, where } = await import(
      "firebase/firestore"
    );
    const snap = await getDocs(
      query(collection(db(), "sites"), where("slug", "==", slug), limit(1)),
    );
    if (!snap.empty) return snap.docs[0].data() as Site;
  }
  return fixtures.site;
}

export async function getTonight(slug: string): Promise<Night> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, limit, query, where } = await import(
      "firebase/firestore"
    );
    const snap = await getDocs(
      query(
        collection(db(), "nights"),
        where("date", "==", todayIso()),
        limit(1),
      ),
    );
    if (!snap.empty) return snap.docs[0].data() as Night;
  }
  return demoTonight();
}

function demoTonight(): Night {
  const today = todayIso();
  return (
    fixtures.nightFor(today) ?? fixtures.makeNight(fixtures.site.seasonEnd)
  );
}

export async function getNight(
  slug: string,
  date: string,
): Promise<NightDetail | null> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, limit, orderBy, query, where } = await import(
      "firebase/firestore"
    );
    const nightSnap = await getDocs(
      query(collection(db(), "nights"), where("date", "==", date), limit(1)),
    );
    if (!nightSnap.empty) {
      const night = nightSnap.docs[0].data() as Night;
      const [bSnap, cSnap] = await Promise.all([
        getDocs(
          query(
            collection(db(), "tallies"),
            where("nightId", "==", night.id),
            orderBy("bucketStart"),
          ),
        ),
        getDocs(
          query(collection(db(), "clips"), where("nightId", "==", night.id)),
        ),
      ]);
      return {
        night,
        buckets: bSnap.docs.map((d) => d.data() as TallyBucket),
        clips: cSnap.docs.map((d) => d.data() as Clip),
      };
    }
    return null;
  }
  const night = fixtures.nightFor(date);
  if (!night || night.date > todayIso()) return null;
  return {
    night,
    buckets: fixtures.makeBuckets(night),
    clips: fixtures.clips.filter((c) => c.nightId === night.id),
  };
}

export async function getSeason(slug: string): Promise<Night[]> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, orderBy, query, where } = await import(
      "firebase/firestore"
    );
    const snap = await getDocs(
      query(
        collection(db(), "nights"),
        where("date", "<=", todayIso()),
        orderBy("date", "desc"),
      ),
    );
    if (!snap.empty) return snap.docs.map((d) => d.data() as Night);
  }
  return fixtures.pastNights(todayIso()).reverse();
}

export async function getClips(
  slug: string,
  opts?: { featuredOnly?: boolean },
): Promise<Clip[]> {
  let clips: Clip[];
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, orderBy, query } = await import(
      "firebase/firestore"
    );
    const snap = await getDocs(
      query(collection(db(), "clips"), orderBy("keepCount", "desc")),
    );
    clips = snap.docs.map((d) => d.data() as Clip);
  } else {
    clips = [...fixtures.clips, ...(typeof window !== "undefined" ? demoStore().keptClips : [])];
    clips.sort((a, b) => b.keepCount - a.keepCount);
  }
  return opts?.featuredOnly ? clips.filter((c) => c.isFeatured) : clips;
}

export async function getSpecies(): Promise<Species[]> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs } = await import("firebase/firestore");
    const snap = await getDocs(collection(db(), "species"));
    if (!snap.empty) return snap.docs.map((d) => d.data() as Species);
  }
  return fixtures.speciesList;
}

export async function getViewerGeo(slug: string): Promise<ViewerGeo[]> {
  if (firebaseReady()) {
    const { db } = await import("@/lib/firebase/client");
    const { collection, getDocs, orderBy, query } = await import(
      "firebase/firestore"
    );
    const snap = await getDocs(
      query(collection(db(), "viewerGeo"), orderBy("count", "desc")),
    );
    if (!snap.empty) return snap.docs.map((d) => d.data() as ViewerGeo);
  }
  return fixtures.viewerGeo;
}

/* ================= realtime subscriptions ================= */

export function subscribeToTally(
  slug: string,
  nightId: string,
  cb: (state: TallyState) => void,
): Unsubscribe {
  if (!firebaseReady()) return demoStore().subscribeTally(cb);
  let unsub: Unsubscribe = () => {};
  (async () => {
    const { db } = await import("@/lib/firebase/client");
    const { collection, onSnapshot, orderBy, query, where } = await import(
      "firebase/firestore"
    );
    unsub = onSnapshot(
      query(
        collection(db(), "tallies"),
        where("nightId", "==", nightId),
        orderBy("bucketStart"),
      ),
      (snap) => {
        const buckets = snap.docs.map((d) => d.data() as TallyBucket);
        cb({
          nightId,
          total: buckets.reduce((s, b) => s + b.stampCount, 0),
          buckets,
        });
      },
    );
  })();
  return () => unsub();
}

export function subscribeToWatchers(
  slug: string,
  cb: (n: number) => void,
): Unsubscribe {
  const rtdbReady =
    firebaseReady() && Boolean(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
  if (!rtdbReady) return demoStore().subscribeWatchers(cb);
  let cleanup: Unsubscribe = () => {};
  (async () => {
    const { rtdb } = await import("@/lib/firebase/client");
    const { onDisconnect, onValue, push, ref, remove, set } = await import(
      "firebase/database"
    );
    const listRef = ref(rtdb(), `presence/${slug}`);
    // Join: register this connection, cleaned up on disconnect.
    const me = push(listRef);
    await set(me, Date.now());
    onDisconnect(me).remove();
    const off = onValue(listRef, (snap) => cb(snap.size ?? 0));
    cleanup = () => {
      off();
      remove(me).catch(() => {});
    };
  })();
  return () => cleanup();
}

export function subscribeToStampPulse(
  slug: string,
  cb: (pulse: StampPulse) => void,
): Unsubscribe {
  if (!firebaseReady()) return demoStore().subscribePulse(cb);
  let unsub: Unsubscribe = () => {};
  (async () => {
    const { db } = await import("@/lib/firebase/client");
    const { collection, onSnapshot, query, where } = await import(
      "firebase/firestore"
    );
    unsub = onSnapshot(
      query(collection(db(), "tallies"), where("nightId", "!=", "")),
      (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const b = change.doc.data() as TallyBucket;
            cb({
              bucketStart: b.bucketStart,
              timestamp: new Date().toISOString(),
              own: false,
            });
          }
        });
      },
    );
  })();
  return () => unsub();
}

/* ============ writes — via app/api/* (Admin SDK), never client-side ============ */

export async function recordStamp(slug: string): Promise<TallyState> {
  if (!firebaseReady()) return demoStore().addStamp(true);
  const res = await fetch("/api/stamp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ siteSlug: slug }),
  });
  if (!res.ok) throw new Error(`stamp failed: ${res.status}`);
  return (await res.json()) as TallyState;
}

export async function keepMoment(
  slug: string,
  atTimestamp: string,
): Promise<Clip> {
  if (!firebaseReady()) return demoStore().keepMoment();
  const res = await fetch("/api/keep", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ siteSlug: slug, atTimestamp }),
  });
  if (!res.ok) throw new Error(`keep failed: ${res.status}`);
  return (await res.json()) as Clip;
}
