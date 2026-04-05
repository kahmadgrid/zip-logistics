// src/firebase.js — Firebase app + messaging singleton.
// FCM Web Push requires a valid Web Push certificate (VAPID) public key from Firebase Console.
// Set VITE_FIREBASE_VAPID_KEY in frontend/.env (full key from Project settings → Cloud Messaging).

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA4PcfwGGs0AolRiGCwYXMOuawrlmmpG6o",
  authDomain: "logistics-app-60b52.firebaseapp.com",
  projectId: "logistics-app-60b52",
  messagingSenderId: "542773205151",
  appId: "1:542773205151:web:f52d8aed407fe9ff4ceaaa"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/** Minimal sanity check: real VAPID keys from Firebase are long URL-safe base64 strings (~87 chars). */
function isPlausibleVapidKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return trimmed.length >= 80 && /^[A-Za-z0-9_-]+$/.test(trimmed);
}

/**
 * Prefer `notificationService.requestNotificationPermission()` (registers token with backend).
 * This exists for legacy imports: uses env VAPID only — never a hardcoded/truncated key.
 */
export const requestForToken = async () => {
  try {
    if (!(await isSupported())) {
      console.warn("Firebase messaging is not supported in this browser");
      return null;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!isPlausibleVapidKey(vapidKey)) {
      console.warn(
        "VITE_FIREBASE_VAPID_KEY is missing or invalid. Add the full Web Push key from Firebase Console (Cloud Messaging)."
      );
      return null;
    }
    const token = await getToken(messaging, { vapidKey: vapidKey.trim() });
    return token || null;
  } catch (err) {
    console.warn("FCM token error (non-fatal):", err?.message || err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { messaging };