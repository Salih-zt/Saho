import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GeminiService } from '@/services/ai/gemini';

const requestSchema = z.object({
  image: z.string().refine((val) => {
    // Check if valid base64 image string
    return val.startsWith('data:image/');
  }, 'Must be a valid base64 image string (data:image/...)'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid image data payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { image } = result.data;

    // Check size limit: prevent extremely large payloads (e.g. max 8MB string size)
    const base64Length = image.length - (image.indexOf(',') + 1);
    const approximateBytes = (base64Length * 3) / 4;
    const maxBytes = 8 * 1024 * 1024; // 8MB

    if (approximateBytes > maxBytes) {
      return NextResponse.json(
        { error: 'Image size exceeds maximum limit of 8MB' },
        { status: 413 }
      );
    }

    // Call Gemini Vision service
    const analysis = await GeminiService.analyzeImage(image);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in /api/vision/analyze route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
