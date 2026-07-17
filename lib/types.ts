// Domain types — these shapes mirror docs/DESIGN.md §5 exactly and must stay
// stable: they become the .NET entities verbatim if/when the backend moves.

export type SiteStatus = "Live" | "Offline" | "Seasonal";

export interface Site {
  id: string;
  name: string;
  slug: string;
  locationLabel: string;
  isLocationProtected: boolean;
  timeZone: string;
  status: SiteStatus;
  streamUrl: string;
  seasonStart: string; // ISO date
  seasonEnd: string; // ISO date
}

export interface Night {
  id: string;
  siteId: string;
  date: string; // ISO date, e.g. "2026-07-17"
  sunset: string; // ISO datetime
  streamOpen: string; // ISO datetime
  streamClose: string; // ISO datetime
  stampTotal: number;
  watcherPeak: number;
  clipCount: number;
  note?: string;
}

export interface TallyBucket {
  id: string; // `${nightId}_${bucketStart}`
  siteId: string;
  nightId: string;
  bucketStart: string; // ISO datetime, 5-minute buckets
  stampCount: number;
  watcherCount: number;
}

export interface Stamp {
  id: string;
  siteId: string;
  nightId: string;
  timestamp: string;
  clientHash: string;
}

export interface Clip {
  id: string;
  siteId: string;
  nightId: string;
  capturedAt: string; // ISO datetime
  mediaUrl: string;
  thumbUrl: string;
  caption?: string;
  keepCount: number;
  isFeatured: boolean;
}

export interface Keep {
  id: string;
  siteId: string;
  clipId: string;
  timestamp: string;
  clientHash: string;
}

export type IucnCode = "LC" | "NT" | "VU" | "EN" | "CR";

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  blurb: string;
  illustrationKey: string;
  iucn: IucnCode;
  iucnName: string;
  tags: string[];
}

export interface ViewerGeo {
  id: string;
  siteId: string;
  countryCode: string;
  countryName: string;
  count: number;
}

/** What the tally strip renders and what recordStamp returns. */
export interface TallyState {
  nightId: string;
  total: number;
  buckets: TallyBucket[];
}

export interface NightDetail {
  night: Night;
  buckets: TallyBucket[];
  clips: Clip[];
}

/** A single stamp landing, for the live ink (subscribeToStampPulse). */
export interface StampPulse {
  bucketStart: string;
  timestamp: string;
  own: boolean;
}

export type Unsubscribe = () => void;
