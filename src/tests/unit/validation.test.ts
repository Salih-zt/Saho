import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Recreate the schemas from our route endpoints to test their validation boundaries
const pulseRequestSchema = z.object({
  emotion: z.string().min(1),
  transcript: z.string().optional().default(''),
});

const visionRequestSchema = z.object({
  image: z.string().refine((val) => {
    return val.startsWith('data:image/');
  }, 'Must be a valid base64 image string (data:image/...)'),
});

const notifyRequestSchema = z.object({
  emotion: z.string(),
  riskLevel: z.enum(['low', 'medium', 'high']),
  actionsTaken: z.array(z.string()),
  location: z.string().url().optional(),
  recipients: z.array(z.string()).min(1),
});

describe('SAHO API Request Schema Validations', () => {
  describe('Pulse Request Schema', () => {
    it('should validate valid payload parameters', () => {
      const valid = { emotion: 'panic', transcript: 'I feel a strong urge to use.' };
      const parsed = pulseRequestSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should fail validation if emotion is missing or empty', () => {
      const invalid = { emotion: '', transcript: 'Hello' };
      const parsed = pulseRequestSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Vision Request Schema', () => {
    it('should validate correct base64 data image URI format', () => {
      const valid = { image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD' };
      const parsed = visionRequestSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should fail if image is not a data URL', () => {
      const invalid = { image: 'my_substance_photo.jpg' };
      const parsed = visionRequestSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Caregiver Notify Request Schema', () => {
    it('should validate correct notify payload parameters', () => {
      const valid = {
        emotion: 'craving',
        riskLevel: 'medium',
        actionsTaken: ['Walk away.', 'Drink water.', 'Breathe.'],
        location: 'https://maps.google.com/?q=37.7749,-122.4194',
        recipients: ['555-0199', '555-0188']
      };
      const parsed = notifyRequestSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it('should reject invalid risk levels', () => {
      const invalid = {
        emotion: 'panic',
        riskLevel: 'critical', // Invalid enum
        actionsTaken: ['Breathe.'],
        recipients: ['555-0199']
      };
      const parsed = notifyRequestSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });
  });
});
