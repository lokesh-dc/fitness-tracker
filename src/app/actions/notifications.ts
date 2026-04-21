"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";

webpush.setVapidDetails(
  "mailto:lokesh.cdewanand@gmail.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function savePushSubscription(subscription: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };

  try {
    const client = await clientPromise;
    const db = client.db();
    const userId = (session.user as any).id;

    // Use findOneAndUpdate with upsert to avoid duplicate subscriptions for same endpoint
    await db.collection("pushSubscriptions").findOneAndUpdate(
      { "subscription.endpoint": subscription.endpoint },
      {
        $set: {
          userId,
          subscription: {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return { error: "Failed to save subscription" };
  }
}

export async function sendPushNotification(userId: string, title: string, message: string) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const subscriptions = await db
      .collection("pushSubscriptions")
      .find({ userId })
      .toArray();

    const results = await Promise.all(
      subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({ title, message })
          );
          return { success: true };
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription expired or no longer valid
            await db.collection("pushSubscriptions").deleteOne({ _id: sub._id });
          }
          return { error: error.message };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { error: "Failed to send notifications" };
  }
}

export async function triggerTestNotification() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Not authenticated" };

  const userId = (session.user as any).id;
  const results = await sendPushNotification(
    userId,
    "Test Notification! 🏋️‍♀️",
    "Great work! Your push notification system is working perfectly."
  );

  return { success: true, count: Array.isArray(results) ? results.length : 0 };
}
