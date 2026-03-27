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

    // Safety check for delay to avoid infinite loops or astronomical values
    if (delay < 0 || delay > 600000) return; // Cap at 10 minutes

    // Start a background task using event.waitUntil
    // This tells the OS that the worker is busy and should not be killed.
    event.waitUntil(
      (async () => {
        // Show an initial "Resting..." notification to let the OS know we are doing background work.
        // Some mobile OSs are less likely to kill a service worker with an active notification.
        await (self as any).registration.showNotification("Timer Active ⏳", {
          body: "Rest period started...",
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'rest-timer',
          silent: true, // Don't buzz yet
        });

        // Use a promise-based delay that waits for the rest period.
        await new Promise<void>((resolve) => {
          restTimerTimeout = setTimeout(async () => {
            // Re-fire a fresh, loud notification when the rest period ends.
            await (self as any).registration.showNotification(title, {
              body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              tag: 'rest-timer', // Same tag replaces the "Resting..." one
              renotify: true,
              vibrate: [300, 100, 300, 100, 500],
              data: { url: '/workout' },
            });
            restTimerTimeout = null;
            resolve();
          }, delay);
        });
      })()
    );
  }

  if (event.data?.type === 'CANCEL_REST_NOTIFICATION') {
    if (restTimerTimeout) {
      clearTimeout(restTimerTimeout);
      restTimerTimeout = null;
    }
    // Remove the notification if canceled
    event.waitUntil(
      (self as any).registration.getNotifications({ tag: 'rest-timer' }).then((notifications: any[]) => {
        notifications.forEach(n => n.close());
      })
    );
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
