import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import webpush from 'web-push';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint called by QStash to fire the push notification after a delay.
 * Verifies request signature from QStash.
 */
async function handler(req: NextRequest) {
  try {
    const { subscription, title, body } = await req.json();

    if (!subscription || !title || !body) {
      console.error('Invalid push send request body:', { title, body });
      return NextResponse.json({ error: 'Invalid push data' }, { status: 400 });
    }

    // Configure details for VAPID push
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    // Fire the push notification to the user's browser/OS
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title,
        body,
        url: '/workout', // Link back to the workout page
      })
    );

    return NextResponse.json({ sent: true });
  } catch (error: any) {
    console.error('Error in sendNotification handler:', error);

    // If the error code is 404 or 410, it means the subscription is expired or invalid.
    // Return 200 so QStash doesn't retry and create duplicate notifications or spam logs.
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.warn('Subscription expired or invalid, cleaning up:', error.statusCode);
      return NextResponse.json({ sent: false, cleaned: true }, { status: 200 });
    }

    // Still return 200 to prevent QStash retries as per requirements
    return NextResponse.json({ sent: false, error: 'Internal failure' }, { status: 200 });
  }
}

// Wrap with signature verification for security
export const POST = verifySignatureAppRouter(handler);
