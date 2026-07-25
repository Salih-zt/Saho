import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiService } from '@/services/ai/gemini';

const requestSchema = z.object({
  emotion: z.string().min(1),
  transcript: z.string().optional().default(''),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: result.error.format() },
        { status: 400 }
      );
    }

    const { emotion, transcript } = result.data;
    
    // Server-side call to Gemini Flash
    const guidance = await GeminiService.getPulseGuidance(emotion, transcript);
    
    return NextResponse.json(guidance);
  } catch (error: any) {
    console.error('Error in /api/ai/pulse route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
