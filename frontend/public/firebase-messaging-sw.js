importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    // Service worker runs as a static file, so import.meta/process.env are not available here.
    // Firebase Web API key is a public identifier (keep API restrictions enabled in GCP).
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
    authDomain: "logistics-app-60b52.firebaseapp.com",
    projectId: "logistics-app-60b52",
    messagingSenderId: "542773205151",
    appId: "1:542773205151:web:f52d8aed407fe9ff4ceaaa"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});