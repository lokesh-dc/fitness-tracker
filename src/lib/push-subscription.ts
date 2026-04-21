/**
 * Subscribes the user to push notifications and returns the subscription.
 * Handles existing subscriptions and feature detection for iOS background support.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    // Basic browser support check
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported in this browser.');
      return null;
    }

    // Wait for the Service Worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Create a new subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not found in environment variables.');
        return null;
      }

      // Convert VAPID key to binary format for push manager
      const applicationServerKey = vapidPublicKey;

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    return subscription;
  } catch (error) {
    console.error('Error in subscribeToPush:', error);
    return null; // Always return null on error, never throw
  }
}
