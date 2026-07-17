// Client-side demo simulation (docs/DESIGN.md §9) — used ONLY when Firebase
// isn't configured. Lives inside lib/data so components can't tell demo mode
// from the real transport. The demo clock starts mid-emergence so the page
// is alive whenever it's opened, not just at actual dusk.
import type {
  ChatMessage,
  Clip,
  Night,
  StampPulse,
  TallyBucket,
  TallyState,
} from "@/lib/types";
import { activityAt, makeBuckets, makeNight, prng, site } from "./fixtures";

type TallyCb = (state: TallyState) => void;
type WatchCb = (n: number) => void;
type PulseCb = (p: StampPulse) => void;
type ChatCb = (msgs: ChatMessage[]) => void;

const CHAT_NAMES = [
  "meadowlark", "junebug_ohio", "dusk_walker", "pipistrelle_fan",
  "cincy_moth", "hay_fever", "first_time_watcher", "winton_regular",
  "screech", "tricolor_hope", "porchlight", "barn_owl_no_really",
];
const CHAT_LINES = [
  "three just dropped from the ridge beam",
  "did anyone stamp that? I stamped it",
  "the little one keeps doing figure eights",
  "hello from Germany, it is 3am and worth it",
  "this is better than television",
  "STAMP",
  "the sheet is filling up fast tonight",
  "my kid named the fast one Zoomer",
  "quiet spell — they do this before a burst",
  "I kept that last clip, go look at it",
  "how many do you think are up there?",
  "nobody knows!! that is literally the point",
  "the moth by the lens is having a rough night",
  "goosebumps every time the swarm turns",
  "second summer watching. it never gets old",
];

class DemoStore {
  night: Night;
  buckets: TallyBucket[];
  /** Demo clock: "now" = 20 min after tonight's sunset, advancing in real time. */
  private demoStartReal = Date.now();
  private demoStartClock: number;
  private watchers = 0;
  private tallyCbs = new Set<TallyCb>();
  private watchCbs = new Set<WatchCb>();
  private pulseCbs = new Set<PulseCb>();
  private chatCbs = new Set<ChatCb>();
  private chat: ChatMessage[] = [];
  private chatN = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private rand = prng(20260717);
  keptClips: Clip[] = [];

  constructor() {
    const today = new Date().toISOString().slice(0, 10);
    this.night =
      makeNight(today).date >= site.seasonStart && today <= site.seasonEnd
        ? makeNight(today)
        : makeNight(site.seasonEnd);
    this.demoStartClock = new Date(this.night.sunset).getTime() + 20 * 60000;
    // Tonight-so-far: the seeded buckets up to the demo clock, then live.
    const all = makeBuckets(this.night);
    this.buckets = all.map((b) =>
      new Date(b.bucketStart).getTime() + 5 * 60000 <= this.demoStartClock
        ? b
        : { ...b, stampCount: 0, watcherCount: 0 },
    );
    this.watchers = 180 + Math.floor(this.rand() * 90);
    // Seed the porch with recent talk.
    for (let i = 0; i < 14; i++) this.pushChat(false, undefined, undefined, (14 - i) * 26000);
  }

  private pushChat(emit: boolean, name?: string, text?: string, agoMs = 0) {
    const msg: ChatMessage = {
      id: `chat-${++this.chatN}`,
      siteId: site.id,
      name: name ?? CHAT_NAMES[Math.floor(this.rand() * CHAT_NAMES.length)],
      text: text ?? CHAT_LINES[Math.floor(this.rand() * CHAT_LINES.length)],
      at: new Date(this.now() - agoMs).toISOString(),
      own: Boolean(name),
    };
    this.chat.push(msg);
    if (this.chat.length > 60) this.chat.splice(0, this.chat.length - 60);
    if (emit) this.chatCbs.forEach((cb) => cb([...this.chat]));
  }

  now(): number {
    return this.demoStartClock + (Date.now() - this.demoStartReal);
  }

  private ensureTicking() {
    if (this.timer || typeof window === "undefined") return;
    this.timer = setInterval(() => this.tick(), 1800);
  }

  private tick() {
    // Synthetic stamps from "other watchers", weighted by the night curve.
    const rel = (this.now() - new Date(this.night.sunset).getTime()) / 60000;
    const a = activityAt(rel);
    const n = this.rand() < a ? Math.ceil(this.rand() * 3) : 0;
    for (let i = 0; i < n; i++) this.addStamp(false);
    // Porch talk, roughly every 5–14 seconds.
    if (this.rand() < 0.22) this.pushChat(true);
    // Watcher drift.
    if (this.rand() < 0.5) {
      this.watchers = Math.max(
        140,
        this.watchers + Math.round((this.rand() - 0.47) * 9),
      );
      this.watchCbs.forEach((cb) => cb(this.watchers));
    }
  }

  private currentBucket(): TallyBucket | null {
    const t = this.now();
    for (const b of this.buckets) {
      const start = new Date(b.bucketStart).getTime();
      if (t >= start && t < start + 5 * 60000) return b;
    }
    return null;
  }

  state(): TallyState {
    return {
      nightId: this.night.id,
      total: this.buckets.reduce((s, b) => s + b.stampCount, 0),
      buckets: this.buckets,
    };
  }

  addStamp(own: boolean): TallyState {
    const b = this.currentBucket();
    if (b) {
      b.stampCount += 1;
      b.watcherCount = Math.max(b.watcherCount, this.watchers);
      const pulse: StampPulse = {
        bucketStart: b.bucketStart,
        timestamp: new Date(this.now()).toISOString(),
        own,
      };
      this.pulseCbs.forEach((cb) => cb(pulse));
    }
    const s = this.state();
    this.tallyCbs.forEach((cb) => cb(s));
    return s;
  }

  keepMoment(): Clip {
    const at = new Date(this.now());
    const clip: Clip = {
      id: `clip-live-${this.keptClips.length + 1}`,
      siteId: site.id,
      nightId: this.night.id,
      capturedAt: at.toISOString(),
      mediaUrl: "",
      thumbUrl: "",
      caption: "Kept live from tonight's stream",
      keepCount: 1,
      isFeatured: false,
    };
    this.keptClips.push(clip);
    return clip;
  }

  sendChat(name: string, text: string) {
    this.pushChat(true, name, text);
  }

  subscribeChat(cb: ChatCb) {
    this.ensureTicking();
    this.chatCbs.add(cb);
    cb([...this.chat]);
    return () => this.chatCbs.delete(cb);
  }

  subscribeTally(cb: TallyCb) {
    this.ensureTicking();
    this.tallyCbs.add(cb);
    cb(this.state());
    return () => this.tallyCbs.delete(cb);
  }

  subscribeWatchers(cb: WatchCb) {
    this.ensureTicking();
    this.watchCbs.add(cb);
    cb(this.watchers);
    return () => this.watchCbs.delete(cb);
  }

  subscribePulse(cb: PulseCb) {
    this.ensureTicking();
    this.pulseCbs.add(cb);
    return () => this.pulseCbs.delete(cb);
  }
}

let store: DemoStore | null = null;

export function demoStore(): DemoStore {
  if (!store) store = new DemoStore();
  return store;
}
