import * as admin from "firebase-admin";

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
  const serviceAccount = JSON.parse(serviceAccountKey);
  // Ensure escaped newlines in the private key are real newlines
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export function getAdminDb(): admin.firestore.Firestore {
  getAdminApp();
  return admin.firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  getAdminApp();
  return admin.auth();
}
