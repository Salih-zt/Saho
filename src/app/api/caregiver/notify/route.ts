import { NextResponse } from 'next/server';
import { z } from 'zod';
import twilio from 'twilio';

const notifySchema = z.object({
  uid: z.string(),
  contacts: z.array(z.object({
    contactId: z.string().optional(),
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
    emergencyEnabled: z.boolean(),
  })).min(1),
  alert: z.object({
    type: z.string(),
    risk: z.string(),
    emotion: z.string(),
    details: z.string(),
    timestamp: z.number(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = notifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid notification payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { contacts, alert } = result.data;

    // Validate Twilio env keys are present
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken || !messagingServiceSid) {
      console.error('[SAHO SMS] Missing Twilio environment variables.');
      return NextResponse.json(
        { error: 'SMS service not configured on server.' },
        { status: 503 }
      );
    }

    const client = twilio(accountSid, authToken);

    const riskEmoji = alert.risk === 'high' ? '🚨' : alert.risk === 'medium' ? '⚠️' : 'ℹ️';

    const smsBody = 
`${riskEmoji} SAHO EMERGENCY ALERT

A person in your Circle of Safety needs support right now.

Feeling: ${alert.emotion}
Risk Level: ${alert.risk.toUpperCase()}

SAHO says: "${alert.details}"

Please reach out to them immediately. — SAHO Recovery App`;

    // Dispatch SMS to every enabled contact in parallel
    const results = await Promise.allSettled(
      contacts.map((contact) =>
        client.messages.create({
          body: smsBody,
          messagingServiceSid,
          to: contact.phone,
        })
      )
    );

    const sent: string[] = [];
    const failed: string[] = [];

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        console.log(`[SAHO SMS] ✅ Sent to ${contacts[i].name} (${contacts[i].phone}) — SID: ${result.value.sid}`);
        sent.push(contacts[i].name);
      } else {
        console.error(`[SAHO SMS] ❌ Failed to send to ${contacts[i].name}:`, result.reason);
        failed.push(contacts[i].name);
      }
    });

    return NextResponse.json({
      success: sent.length > 0,
      message: `SMS alerts sent to ${sent.length} caregiver(s).`,
      notifiedContactsCount: sent.length,
      sent,
      failed,
    });

  } catch (error: any) {
    console.error('[SAHO SMS] Unhandled error in /api/caregiver/notify:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
