// Custom service worker for push notifications
self.addEventListener("push", (event: any) => {
  const data = event.data ? event.data.json() : { title: "New Notification", message: "You have a new update!" };

  const options = {
    body: data.message,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "1",
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icon-192x192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192x192.png",
      },
    ],
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event: any) => {
  console.log("[Service Worker] Notification click Received.");

  event.notification.close();

  event.waitUntil(
    (self as any).clients.openWindow("/")
  );
});
