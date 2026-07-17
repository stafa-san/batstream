// Firebase Admin SDK init — SERVER only (Vercel route handlers, seeder).
// Bypasses security rules; every write in the system flows through here.
// Never import from client components.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export function isAdminConfigured(): boolean {
  return Boolean(projectId && clientEmail && privateKey);
}

let app: App | null = null;

function adminApp(): App {
  if (!isAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured (FIREBASE_ADMIN_* env vars missing).",
    );
  }
  if (!app) {
    app =
      getApps()[0] ??
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
  }
  return app;
}

export function adminDb(): Firestore {
  return getFirestore(adminApp());
}
