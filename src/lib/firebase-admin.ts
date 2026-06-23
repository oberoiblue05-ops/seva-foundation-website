import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

// ─── Lazy singletons ──────────────────────────────────────────────────────────
// DO NOT initialise at module level — any throw here becomes an HTML 500 page
// instead of a JSON error response (Next.js never reaches the route handler).
// Call getAdminDb() / getAdminAuth() INSIDE request handlers so errors are
// caught by the handler's own try/catch.

let _app: App | undefined;
let _db:  Firestore | undefined;
let _auth: Auth | undefined;

function initAdminApp(): App {
  if (_app) return _app;

  const existing = getApps();
  if (existing.length > 0) return (_app = existing[0]);

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add the full service-account JSON as a single-line string."
    );
  }

  return (_app = initializeApp({
    credential: cert(JSON.parse(key) as object),
    projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }));
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(initAdminApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (!_auth) _auth = getAuth(initAdminApp());
  return _auth;
}
