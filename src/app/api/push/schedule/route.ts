import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Module-level map to store active push jobs
const pushJobs = new Map<string, NodeJS.Timeout>();

// Configure VAPID
if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, delay, title, body } = await req.json();

    if (!subscription || typeof delay !== 'number' || delay > 600000) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const jobId = crypto.randomUUID();

    // Fire non-blocking timeout
    const timeout = setTimeout(async () => {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, url: '/workout' })
        );
      } catch (error) {
        console.error("Scale push notification error:", error);
      } finally {
        pushJobs.delete(jobId);
      }
    }, delay);

    // Store timeout for potential cancellation
    pushJobs.set(jobId, timeout);

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("Push schedule error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const timeout = pushJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      pushJobs.delete(jobId);
      return NextResponse.json({ cancelled: true });
    }

    return NextResponse.json({ cancelled: false, message: "Job not found" });
  } catch (error) {
    console.error("Push cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
