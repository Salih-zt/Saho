export interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  recoveryGoals: string[];
  isGuest: boolean;
  createdAt: number;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  textToSpeech: boolean;
}

export interface CaregiverContact {
  contactId: string;
  name: string;
  relationship: string;
  phone: string;
  emergencyEnabled: boolean;
}

export interface RecoverySession {
  sessionId: string;
  userId: string;
  timestamp: number;
  emotion: string;
  riskLevel: 'low' | 'medium' | 'high';
  message: string;
  aiActions: string[];
  breathing: boolean;
  emergencyTriggered: boolean;
  imageUrl?: string;
}

export interface TimelineEntry {
  id: string;
  userId: string;
  timestamp: number;
  type: 'breathing' | 'contact' | 'education' | 'reflection' | 'milestone';
  title: string;
  description: string;
}

export interface EducationCard {
  id: string;
  category: 'cravings' | 'withdrawal' | 'medication' | 'overdose' | 'harm-reduction';
  title: string;
  content: string;
  summary: string;
  audioScript?: string;
}

export interface PulseAIResponse {
  risk: 'low' | 'medium' | 'high';
  emotion: string;
  message: string;
  actions: string[];
  breathing: boolean;
  emergency: boolean;
}

export interface VisionAIResponse {
  confidence: number; // 0.0 to 1.0
  identifiedItem: string;
  isTrigger: boolean;
  reason: string;
  harmReductionAdvice: string;
  professionalVerificationAdvice: string;
}
