import { describe, it, expect } from 'vitest';
import { GeminiService } from '../../services/ai/gemini';

describe('Gemini Vision Live Integration Test', () => {
  it('should analyze image base64 successfully', async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Skipping live Gemini Vision test: GEMINI_API_KEY is not defined.');
      return;
    }

    // 1x1 pixel black JPEG base64
    const sampleImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

    console.log('Testing live Gemini Vision using key: ' + apiKey.substring(0, 10) + '...');
    
    try {
      const response = await GeminiService.analyzeImage(sampleImageBase64);
      console.log('Gemini Vision response:', response);

      expect(response).toBeDefined();
      expect(typeof response.confidence).toBe('number');
      expect(response.identifiedItem).toBeDefined();
      expect(typeof response.isTrigger).toBe('boolean');
      expect(response.reason).toBeDefined();
      expect(response.harmReductionAdvice).toBeDefined();
    } catch (error: any) {
      console.error('Gemini Vision test failed with:', error);
      throw error;
    }
  }, 20000);
});
