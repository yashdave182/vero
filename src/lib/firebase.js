/**
 * Firebase initialization and exports for Auth and Analytics
 *
 * Usage:
 *  import { app, auth, analytics, googleProvider } from '../lib/firebase';
 *  // Sign in with Google:
 *  signInWithPopup(auth, googleProvider)
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Firebase configuration (provided)
const firebaseConfig = {
  apiKey: "AIzaSyDVMvRaS7BRKS9HKFY2Bsu4nDZ5r5cZHLE",
  authDomain: "verolabz.firebaseapp.com",
  projectId: "verolabz",
  storageBucket: "verolabz.firebasestorage.app",
  messagingSenderId: "397129358809",
  appId: "1:397129358809:web:ebe2505c69eb1e0bf60dc8",
  measurementId: "G-LPXE0CNLTG",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Optional: you can set custom parameters if needed (e.g., prompt select account)
// googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Analytics (guarded to avoid SSR or unsupported environments)
let analyticsInstance = null;
try {
  // getAnalytics requires a browser environment; guard to prevent errors in non-browser contexts
  if (typeof window !== "undefined") {
    analyticsInstance = getAnalytics(app);
  }
} catch {
  // Analytics not supported or not available; keep as null
}
export const analytics = analyticsInstance;

// Initialize Firestore Database
export const db = getFirestore(app);
