import { describe, it, expect } from 'vitest';
import { GeminiService } from '../../services/ai/gemini';

describe('Gemini API Live Integration Test', () => {
  it('should return a valid structured response from Gemini API using the configured key', async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Skipping live Gemini API test: GEMINI_API_KEY is not defined in .env.local.');
      return;
    }

    console.log('Testing live Gemini connectivity using API key: ' + apiKey.substring(0, 10) + '...');
    
    try {
      const response = await GeminiService.getPulseGuidance(
        'craving',
        'I am having a strong urge to use. Need support.'
      );

      console.log('Successfully received live Gemini response:', response);

      expect(response).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(response.risk);
      expect(response.message).toBeDefined();
      expect(response.actions).toHaveLength(3);
      expect(typeof response.breathing).toBe('boolean');
      expect(typeof response.emergency).toBe('boolean');
    } catch (error) {
      console.error('Failed to communicate with live Gemini API:', error);
      throw error;
    }
  }, 15000);
});
