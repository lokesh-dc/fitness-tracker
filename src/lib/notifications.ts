/**
 * Browser Notification Utilities
 * Handles permission requests and scheduling of background notifications via Service Worker
 */

export function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canNotify()) return false;

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function scheduleRestNotification(seconds: number) {
  if (!canNotify() || Notification.permission !== 'granted' || !navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'SCHEDULE_REST_NOTIFICATION',
    delay: seconds * 1000,
    title: 'Rest Complete 🔥',
    body: 'Time to hit the next set!',
  });
}

export function cancelRestNotification() {
  if (!canNotify() || !navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'CANCEL_REST_NOTIFICATION',
  });
}
