import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-phone-number": "Please enter a valid 10-digit phone number.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/invalid-verification-code": "The OTP you entered is incorrect. Please try again.",
  "auth/code-expired": "The OTP has expired. Please request a new one.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters long.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/requires-recent-login": "Please sign in again to complete this action.",
  "auth/missing-phone-number": "Please enter your phone number.",
  "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
  "auth/captcha-check-failed": "reCAPTCHA verification failed. Please refresh and try again.",
  "auth/invalid-app-credential": "App verification failed. Please contact support.",
};

export function getFirebaseError(code: string): string {
  return AUTH_ERRORS[code] ?? "Something went wrong. Please try again.";
}
