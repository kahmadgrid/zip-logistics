importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA4PcfwGGs0AolRiGCwYXMOuawrlmmpG6o",
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