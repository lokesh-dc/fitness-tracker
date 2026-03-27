/**
 * Browser Notification Utilities
 * Handles permission requests and scheduling of background notifications via Service Worker
 * and VAPID Web Push
 */

import { subscribeToPush } from "./push-subscription";

let currentPushJobId: string | null = null;

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

export async function scheduleRestNotification(seconds: number) {
  if (!canNotify() || Notification.permission !== 'granted') {
    return;
  }

  const delayMs = seconds * 1000;
  const title = 'Rest Complete 🔥';
  const body = 'Time to hit the next set!';

  // A) Existing SW message
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_REST_NOTIFICATION',
      delay: delayMs,
      title,
      body,
    });
  }

  // B) New VAPID push schedule
  try {
    const subscription = await subscribeToPush();
    if (subscription) {
      const response = await fetch('/api/push/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          delay: delayMs,
          title,
          body,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        currentPushJobId = data.jobId;
      }
    }
  } catch (error) {
    // Fail silently, do not disrupt the timer
    console.warn('VAPID push scheduling failed:', error);
  }
}

export async function cancelRestNotification() {
  if (!canNotify()) {
    return;
  }

  // Cancel SW local notification
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_REST_NOTIFICATION',
    });
  }

  // Cancel VAPID server-side push
  if (currentPushJobId) {
    try {
      await fetch('/api/push/schedule', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: currentPushJobId,
        }),
      });
      currentPushJobId = null;
    } catch (error) {
      // Fail silently
      console.warn('VAPID push cancellation failed:', error);
    }
  }
}
