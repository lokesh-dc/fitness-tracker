import { Client } from '@upstash/qstash';
import { NextRequest, NextResponse } from 'next/server';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * POST - Schedule a delayed push notification via QStash.
 * { subscription, delay, title, body }
 */
export async function POST(req: NextRequest) {
  try {
    const { subscription, delay, title, body } = await req.json();

    // Validation
    if (!subscription || !delay || typeof delay !== 'number' || delay < 60000 || delay > 600000) {
      return NextResponse.json({ error: 'Invalid push scheduling data' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL is not defined in environment variables.');
      return NextResponse.json({ error: 'App URL not configured' }, { status: 500 });
    }

    // Schedule the job on QStash
    const result = await qstashClient.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`,
      delay: Math.ceil(delay / 1000), // delay in seconds for QStash
      body: { subscription, title, body },
    });

    return NextResponse.json({ jobId: result.messageId });
  } catch (error) {
    console.error('Error in POST /api/push/schedule:', error);
    return NextResponse.json({ error: 'Failed to schedule push' }, { status: 500 });
  }
}

/**
 * DELETE - Cancel a scheduled push notification.
 * { jobId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    try {
      // Cancel the message in QStash
      await qstashClient.messages.delete(jobId);
    } catch (error) {
      // Fail silently if the job is already gone or invalid
      console.warn(`Attempted to delete jobId ${jobId} but it may have already been processed.`);
    }

    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error('Error in DELETE /api/push/schedule:', error);
    // Still return 200 or 204 etc. but according to the user request return cancelled: true
    return NextResponse.json({ cancelled: false, error: 'Internal error' });
  }
}
