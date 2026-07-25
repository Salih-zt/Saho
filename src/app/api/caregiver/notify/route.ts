import { NextResponse } from 'next/server';
import { z } from 'zod';

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
        { error: 'Invalid notification details', details: result.error.format() },
        { status: 400 }
      );
    }

    const { uid, contacts, alert } = result.data;

    // Simulate sending SMS via Twilio or standard gateway
    console.log(`\n=============================================`);
    console.log(`[SMS GATEWAY DISPATCHER - SIMULATION]`);
    contacts.forEach((contact) => {
      console.log(`Sending SMS to: ${contact.name} at phone number ${contact.phone}...`);
      console.log(`Content: "SAHO EMERGENCY ALERT: User is feeling "${alert.emotion}" at a "${alert.risk}" risk level. Guidance: ${alert.details}"`);
    });
    console.log(`=============================================\n`);

    return NextResponse.json({
      success: true,
      message: 'Emergency alerts successfully sent to caregivers.',
      notifiedContactsCount: contacts.length
    });
  } catch (error: any) {
    console.error('Error in /api/caregiver/notify route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
