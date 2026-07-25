import { NextResponse } from 'next/server';
import { z } from 'zod';

const notifySchema = z.object({
  emotion: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  actionsTaken: z.array(z.string()),
  location: z.string().url().optional(),
  recipients: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = notifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid notification details', details: result.error.format() },
        { status: 400 }
      );
    }

    const { emotion, riskLevel, actionsTaken, location, recipients } = result.data;

    // Simulate sending SMS via Twilio or standard gateway
    console.log(`[SMS ALERTS SENT to: ${recipients.join(', ')}]`);
    console.log(`Alert details: User is feeling "${emotion}" at a "${riskLevel}" risk level.`);
    console.log(`Actions proposed:`, actionsTaken);
    if (location) {
      console.log(`Shared Location Link: ${location}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency alerts successfully sent to caregivers.',
      notifiedContactsCount: recipients.length
    });
  } catch (error: any) {
    console.error('Error in /api/caregiver/notify route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
