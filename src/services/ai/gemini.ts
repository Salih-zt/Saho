import { z } from 'zod';
import { PulseAIResponse, VisionAIResponse } from '../../types';

// Zod Schemas for strict API contracts
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

// Offline/Grounding Compassionate Fallbacks
const MOCK_PULSE_RESPONSES: Record<string, PulseAIResponse> = {
  craving: {
    risk: 'medium',
    emotion: 'craving',
    message: 'Craving is a wave that peaks and passes. You are not your craving; you are the observer of it.',
    actions: [
      'Change your physical environment immediately—go to another room or step outside.',
      'Drink a full glass of cold water slowly, focusing on the temperature and sensation.',
      'Use the 5-4-3-2-1 grounding technique to notice 5 things you can see around you.'
    ],
    breathing: true,
    emergency: false,
  },
  panic: {
    risk: 'high',
    emotion: 'panic',
    message: 'You are safe right now in this exact moment. Let your breathing settle. This panic is a feeling, not a fact.',
    actions: [
      'Press the Guided Breathing button and inhale deeply for 4 seconds.',
      'Unclench your jaw, drop your shoulders, and place your feet flat on the floor.',
      'If you feel unsafe, click "Circle of Safety" to alert your emergency contacts.'
    ],
    breathing: true,
    emergency: false,
  },
  lonely: {
    risk: 'low',
    emotion: 'lonely',
    message: 'Isolation is a strong trigger, but you are not alone. There are people who care deeply about your recovery.',
    actions: [
      'Call or text a supportive friend or family member from your Circle of Safety.',
      'Write down three things you are grateful for or looking forward to today.',
      'Read a story or educational card in the Education Hub to focus your mind.'
    ],
    breathing: false,
    emergency: false,
  },
  sick: {
    risk: 'medium',
    emotion: 'feeling sick',
    message: 'Physical discomfort is exhausting, but it is part of your body healing and adjusting. Be gentle with yourself.',
    actions: [
      'Lie down in a quiet, dark room and rest your body.',
      'Sip a warm herbal tea or water to ease physical tension.',
      'Contact a healthcare provider if your symptoms worsen or feel unmanageable.'
    ],
    breathing: true,
    emergency: false,
  },
  givingup: {
    risk: 'high',
    emotion: 'giving up',
    message: 'It is okay to feel tired, but please do not make a temporary feeling a permanent decision. Your life is worth fighting for.',
    actions: [
      'Do not make any decisions right now. Just pause and breathe.',
      'Reach out directly to your trusted contacts or call a crisis support line.',
      'Focus only on getting through the next 5 minutes. You can do 5 minutes.'
    ],
    breathing: true,
    emergency: true,
  },
  default: {
    risk: 'low',
    emotion: 'general',
    message: 'I am here with you. Together we can take this one step, one moment, one breath at a time.',
    actions: [
      'Sit comfortably and pay attention to the rise and fall of your chest.',
      'Write down what is currently on your mind to release some mental pressure.',
      'Browse the Education Hub for grounding tools and advice.'
    ],
    breathing: true,
    emergency: false,
  }
};

export class GeminiService {
  private static getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  /**
   * Scans text for malicious prompt injection keywords
   */
  private static filterPromptInjection(text: string): string {
    const lower = text.toLowerCase();
    const blacklist = [
      'ignore previous instructions',
      'ignore system prompt',
      'bypass security',
      'override system',
      'new role',
      'you are now',
      'system command',
      'acting as'
    ];
    
    const containsMaliciousText = blacklist.some((phrase) => lower.includes(phrase));
    if (containsMaliciousText) {
      console.warn('[Prompt Guard Alert]: Malicious injection patterns identified. Resetting input context to safety defaults.');
      return 'seeking de-escalation advice';
    }
    return text;
  }

  /**
   * Safe fetch request execution with exponential backoff retries
   */
  private static async fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        if (response.status >= 500 && i < retries - 1) {
          await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
          continue;
        }
        return response;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
    throw new Error('API fetch failed after maximum retry attempts.');
  }

  /**
   * Generates de-escalation response using Gemini Flash
   */
  public static async getPulseGuidance(emotion: string, transcript: string = ''): Promise<PulseAIResponse> {
    const apiKey = this.getApiKey();
    const cleanEmotion = emotion.toLowerCase();
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using local compassionate mock guidance.');
      return this.getMockPulseResponse(cleanEmotion);
    }

    // Input sanitization / injection checks
    const safeEmotion = this.filterPromptInjection(cleanEmotion);
    const safeTranscript = this.filterPromptInjection(transcript);

    try {
      const systemPrompt = `You are SAHO, a compassionate, non-judgmental recovery companion for individuals with Substance Use Disorder. 
Task: Support the user who is experiencing distress.
Constraints:
- Response MUST be valid JSON only. Do not wrap in markdown \`\`\`json blocks.
- Compassionate Message: Calm, empathetic tone. MAXIMUM 80 words. Never diagnose. Never shame.
- Actions: Provide exactly 3 short, actionable, sequential steps. Each action must be a single sentence. No jargon.
- Risk Level: 'low', 'medium', or 'high'.
- Breathing: true if a breathing exercise would benefit their state (especially craving, panic, sickness), false otherwise.
- Emergency: true if the user mentions suicide, overdose, immediate relapse risk, or severe danger.

JSON Response Contract Schema:
{
  "risk": "low" | "medium" | "high",
  "emotion": string,
  "message": string,
  "actions": [string, string, string],
  "breathing": boolean,
  "emergency": boolean
}`;

      const userContent = `User context:
Selected emotional state: "${safeEmotion}"
User spoke: "${safeTranscript}"

Provide the JSON response matching the schema contract.`;

      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Strict parse & validation using Zod
      const parsedData = JSON.parse(textResponse.trim());
      const validated = pulseResponseSchema.parse(parsedData);
      return validated;

    } catch (error) {
      console.error('Error fetching from Gemini API. Falling back to mock:', error);
      return this.getMockPulseResponse(cleanEmotion);
    }
  }

  /**
   * Identifies objects/substances/triggers from images using Gemini Vision
   */
  public static async analyzeImage(base64Image: string): Promise<VisionAIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using local mock Vision AI analyzer.');
      return this.getMockVisionResponse(base64Image);
    }

    try {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

      const prompt = `You are a clinical recovery AI assistant. Identify if this image contains potential relapse triggers (e.g. alcohol, syringes, pill bottles, pipes, smoking apparatus) or unknown medications.
Respond in valid JSON only. Do not wrap in markdown blocks.

JSON Response Contract Schema:
{
  "confidence": number (float between 0.0 and 1.0),
  "identifiedItem": string (name of identified item or "None"),
  "isTrigger": boolean (true if it's a known relapse trigger or substance),
  "reason": string (brief, non-judgmental explanation),
  "harmReductionAdvice": string (actionable grounding exercise or disposal/avoidance guidance),
  "professionalVerificationAdvice": string (advice to consult professional or call emergency if unknown substance/medication)
}`;

      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType, data: base64Data } },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini Vision API error: ${response.statusText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Strict parse & validation using Zod
      const parsedData = JSON.parse(textResponse.trim());
      const validated = visionResponseSchema.parse(parsedData);
      return validated;

    } catch (error) {
      console.error('Error in Gemini Vision analysis. Falling back to mock:', error);
      return this.getMockVisionResponse(base64Image);
    }
  }

  private static getMockPulseResponse(emotion: string): PulseAIResponse {
    if (emotion.includes('crav')) return MOCK_PULSE_RESPONSES.craving;
    if (emotion.includes('panic') || emotion.includes('anx')) return MOCK_PULSE_RESPONSES.panic;
    if (emotion.includes('lone') || emotion.includes('sad')) return MOCK_PULSE_RESPONSES.lonely;
    if (emotion.includes('sick') || emotion.includes('withdraw')) return MOCK_PULSE_RESPONSES.sick;
    if (emotion.includes('give') || emotion.includes('end')) return MOCK_PULSE_RESPONSES.givingup;
    return MOCK_PULSE_RESPONSES.default;
  }

  private static getMockVisionResponse(base64Image: string): VisionAIResponse {
    return {
      confidence: 0.85,
      identifiedItem: 'Amber Pill Bottle',
      isTrigger: true,
      reason: 'This resembles a medication container or prescription bottle which can trigger urges or represent unknown substances.',
      harmReductionAdvice: 'Keep it closed, place it out of sight, and try a 2-minute breathing exercise to ground yourself.',
      professionalVerificationAdvice: 'Consult a pharmacy or licensed physician to identify unknown prescription medicines before use.'
    };
  }
}
