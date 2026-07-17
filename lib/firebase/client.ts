// Firebase Web SDK init — CLIENT reads only. Imported exclusively by
// lib/data/*. Components never touch this module (docs/DESIGN.md §4).
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True when the web config is complete enough to talk to Firestore. */
export function isFirebaseConfigured(): boolean {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

/** RTDB (presence) additionally needs the database URL. */
export function isRtdbConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(config.databaseURL);
}

let app: FirebaseApp | null = null;

function firebaseApp(): FirebaseApp {
  if (!app) app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}

export function rtdb(): Database {
  return getDatabase(firebaseApp());
}
