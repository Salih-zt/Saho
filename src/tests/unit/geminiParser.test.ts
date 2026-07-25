import { describe, it, expect } from 'vitest';
import { GeminiService } from '@/services/ai/gemini';
import { z } from 'zod';

// Schema matcher matching the Phase 4 JSON Response Contract
const pulseResponseSchema = z.object({
  risk: z.enum(['low', 'medium', 'high']),
  emotion: z.string(),
  message: z.string(),
  actions: z.array(z.string()).length(3),
  breathing: z.boolean(),
  emergency: z.boolean(),
});

const visionResponseSchema = z.object({
  confidence: z.number().min(0).max(1),
  identifiedItem: z.string(),
  isTrigger: z.boolean(),
  reason: z.string(),
  harmReductionAdvice: z.string(),
  professionalVerificationAdvice: z.string(),
});

describe('SAHO AI Output JSON Response Contracts', () => {
  it('should verify that all mock pulse responses match the documented schema contract', async () => {
    // Run de-escalation for different emotions and verify output schema
    const emotions = ['craving', 'panic', 'lonely', 'sick', 'givingup', 'unknown'];
    
    for (const em of emotions) {
      const guidance = await GeminiService.getPulseGuidance(em);
      
      // Validate schema
      const parseResult = pulseResponseSchema.safeParse(guidance);
      expect(parseResult.success).toBe(true);

      // Verify word limit constraint (max 80 words for empathetic message)
      if (parseResult.success) {
        const wordCount = parseResult.data.message.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(80);
      }
    }
  });

  it('should verify that mock vision responses conform to the vision JSON contract schema', async () => {
    const analysis = await GeminiService.analyzeImage('data:image/jpeg;base64,dummy_data');
    
    const parseResult = visionResponseSchema.safeParse(analysis);
    expect(parseResult.success).toBe(true);
  });
});
