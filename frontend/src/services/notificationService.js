import { getToken, onMessage, isSupported } from "firebase/messaging";
import { messaging } from "../firebase";
import api from "./api";
import toast from "react-hot-toast";

function isPlausibleVapidKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  return trimmed.length >= 80 && /^[A-Za-z0-9_-]+$/.test(trimmed);
}

export const requestNotificationPermission = async () => {
  try {
    // Guard: browser support
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    if (!(await isSupported())) {
      console.warn("Firebase messaging is not supported in this browser");
      return null;
    }

    const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
    if (!isPlausibleVapidKey(vapidKey)) {
      console.warn(
        "VITE_FIREBASE_VAPID_KEY is missing or not a valid Web Push key — skipping FCM (get the full key from Firebase Console → Cloud Messaging)."
      );
      return null;
    }

    const token = await getToken(messaging, { vapidKey: vapidKey.trim() });
    if (!token) {
      console.warn("No FCM token received");
      return null;
    }

    console.log("FCM Token:", token);

    // Send token to backend (fire and forget — don't crash if this fails)
    await api.post("/api/notifications/register", { token }).catch((err) =>
      console.warn("Could not register FCM token on backend:", err.message)
    );

    return token;
  } catch (err) {
    // Never throw — a push setup failure must never block login or any other flow
    console.warn("Push notification setup failed (non-fatal):", err.message);
    return null;
  }
};

export const listenToNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);

    const title = payload.notification?.title ?? "New Notification";
    const body  = payload.notification?.body  ?? "";

    toast.success(`${title}${body ? ` — ${body}` : ""}`);

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png",
      });
    }
  });
};