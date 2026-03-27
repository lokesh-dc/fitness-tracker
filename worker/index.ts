// Custom Service Worker for Rest Timer & Push Notifications
// Built for @ducanh2912/next-pwa

let restTimerTimeout: any = null;

// Message listener for Rest Timer (Local SW Timeout)
self.addEventListener('message', (event: any) => {
  if (event.data?.type === 'SCHEDULE_REST_NOTIFICATION') {
    // Clear any existing timeout
    if (restTimerTimeout) {
      clearTimeout(restTimerTimeout);
    }

    const { delay, title, body } = event.data;

    if (delay < 0 || delay > 600000) return;

    event.waitUntil(
      (async () => {
        // Show an initial "Resting..." notification to encourage background keep-alive
        await (self as any).registration.showNotification("Timer Active ⏳", {
          body: "Rest period started...",
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: 'rest-timer',
          silent: true,
        });

        await new Promise<void>((resolve) => {
          restTimerTimeout = setTimeout(async () => {
            await (self as any).registration.showNotification(title, {
              body,
              icon: '/icons/icon-192x192.png',
              badge: '/icons/badge-72x72.png',
              tag: 'rest-timer',
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
    event.waitUntil(
      (self as any).registration.getNotifications({ tag: 'rest-timer' }).then((notifications: any[]) => {
        notifications.forEach(n => n.close());
      })
    );
  }
});

// Push notification listener (VAPID Remote Push)
self.addEventListener("push", (event: any) => {
  let data = { title: "Rest Complete 🔥", body: "Time to hit the next set!", url: "/workout" };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.warn("Push event data parse failed:", e);
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: 'rest-timer', // Same tag ensures it replaces the local 'Timer Active' notification
    renotify: true,
    vibrate: [300, 100, 300, 100, 500],
    data: {
      url: data.url || '/workout',
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
