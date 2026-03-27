// Custom Service Worker for Rest Timer & Push Notifications
// Built for @ducanh2912/next-pwa

let restTimerTimeout: any = null;

// Message listener for Rest Timer
self.addEventListener('message', (event: any) => {
  if (event.data?.type === 'SCHEDULE_REST_NOTIFICATION') {
    // Clear any existing timeout
    if (restTimerTimeout) {
      clearTimeout(restTimerTimeout);
    }

    const { delay, title, body } = event.data;

    // Use event.waitUntil to keep the service worker alive during the rest period.
    // This is more reliable for background execution on mobile browsers.
    event.waitUntil(
      new Promise<void>((resolve) => {
        restTimerTimeout = setTimeout(() => {
          (self as any).registration.showNotification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'rest-timer',
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: '/workout' },
          });
          restTimerTimeout = null;
          resolve();
        }, delay);
      })
    );
  }

  if (event.data?.type === 'CANCEL_REST_NOTIFICATION') {
    if (restTimerTimeout) {
      clearTimeout(restTimerTimeout);
      restTimerTimeout = null;
    }
  }
});

// Push notification listener (merged from existing)
self.addEventListener("push", (event: any) => {
  const data = event.data ? event.data.json() : { title: "New Notification", message: "You have a new update!" };

  const options = {
    body: data.message,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1",
    },
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

// Notification click listener
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/workout';

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window' }).then((clientList: any[]) => {
      for (const client of clientList) {
        if (client.url.includes('/workout') && 'focus' in client) {
          return client.focus();
        }
      }
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(urlToOpen);
      }
    })
  );
});
