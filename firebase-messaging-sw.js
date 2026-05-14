// 876Match - Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCrCp25I9LPpfmz579K2i0OYLEs04mGkEQ",
  authDomain: "yaadconnect-884fa.firebaseapp.com",
  projectId: "yaadconnect-884fa",
  storageBucket: "yaadconnect-884fa.firebasestorage.app",
  messagingSenderId: "977603274161",
  appId: "1:977603274161:web:2b61752d4735ca5a1fc990",
  databaseURL: "https://yaadconnect-884fa-default-rtdb.firebaseio.com"
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon, data } = payload.notification || {};
  const notifTitle = title || '876Match';
  const notifBody = body || 'You have a new notification';
  const notifIcon = icon || '/icon-192.png';

  const options = {
    body: notifBody,
    icon: notifIcon,
    badge: '/icon-192.png',
    data: data || {},
    vibrate: [200, 100, 200],
    tag: data?.tag || 'general',
    renotify: true,
    actions: [
      { action: 'open', title: 'Open 876Match' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  return self.registration.showNotification(notifTitle, options);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = 'https://876match.com';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes('876match') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
