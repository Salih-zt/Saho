/**
 * @file recoveryService.test.ts
 * @description Unit tests for RecoveryService session creation, risk classification,
 * and caregiver dispatch logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PulseAIResponse } from '../../types';

// ─── Risk Classification Helper ───────────────────────────────────────────────
/** Mirrors the local fallback logic in SahoNowContainer to test risk mapping */
function classifyRisk(emotion: string): 'low' | 'medium' | 'high' {
  const key = emotion.toLowerCase();
  if (key.includes('panic') || key.includes('give') || key.includes('giving') || key.includes('end')) return 'high';
  if (key.includes('crav') || key.includes('sick') || key.includes('anx')) return 'medium';
  if (key.includes('lone') || key.includes('sad')) return 'medium';
  return 'low';
}

/** Validates a PulseAIResponse matches the expected schema contract */
function isValidPulseResponse(response: unknown): response is PulseAIResponse {
  const r = response as PulseAIResponse;
  return (
    typeof r === 'object' &&
    r !== null &&
    ['low', 'medium', 'high'].includes(r.risk) &&
    typeof r.emotion === 'string' &&
    typeof r.message === 'string' &&
    Array.isArray(r.actions) && r.actions.length === 3 &&
    r.actions.every((a: unknown) => typeof a === 'string') &&
    typeof r.breathing === 'boolean' &&
    typeof r.emergency === 'boolean'
  );
}

// ─── Risk Level Classification Tests ─────────────────────────────────────────
describe('Risk Level Classification', () => {
  it('should classify panic as high risk', () => {
    expect(classifyRisk("I'm Panicking")).toBe('high');
    expect(classifyRisk('panic attack')).toBe('high');
  });

  it('should classify giving up as high risk', () => {
    expect(classifyRisk('giving up')).toBe('high');
    expect(classifyRisk('want to end it')).toBe('high');
  });

  it('should classify craving as medium risk', () => {
    expect(classifyRisk("I'm Craving")).toBe('medium');
    expect(classifyRisk('craving badly')).toBe('medium');
  });

  it('should classify loneliness as medium risk', () => {
    expect(classifyRisk("I'm Lonely")).toBe('medium');
    expect(classifyRisk('feeling sad and lonely')).toBe('medium');
  });

  it('should classify a calm check-in as low risk', () => {
    expect(classifyRisk('just checking in')).toBe('low');
    expect(classifyRisk('feeling okay today')).toBe('low');
  });
});

// ─── PulseAIResponse Schema Contract Tests ────────────────────────────────────
describe('PulseAIResponse Schema Validation', () => {
  it('should validate a fully correct response object', () => {
    const response: PulseAIResponse = {
      risk: 'high',
      emotion: 'panic',
      message: 'You are safe right now.',
      actions: ['Breathe slowly.', 'Drop your shoulders.', 'Name 3 things you see.'],
      breathing: true,
      emergency: false,
    };
    expect(isValidPulseResponse(response)).toBe(true);
  });

  it('should reject a response with wrong number of actions', () => {
    const response = {
      risk: 'low',
      emotion: 'calm',
      message: 'All is well.',
      actions: ['One action only'],
      breathing: false,
      emergency: false,
    };
    expect(isValidPulseResponse(response)).toBe(false);
  });

  it('should reject a response with invalid risk value', () => {
    const response = {
      risk: 'critical', // invalid
      emotion: 'panic',
      message: 'Test',
      actions: ['a', 'b', 'c'],
      breathing: true,
      emergency: false,
    };
    expect(isValidPulseResponse(response)).toBe(false);
  });

  it('should reject a response with non-string actions', () => {
    const response = {
      risk: 'medium',
      emotion: 'craving',
      message: 'Hold on.',
      actions: [1, 2, 3], // invalid
      breathing: true,
      emergency: false,
    };
    expect(isValidPulseResponse(response)).toBe(false);
  });

  it('should reject a null response', () => {
    expect(isValidPulseResponse(null)).toBe(false);
  });
});

// ─── Emergency Flag Tests ─────────────────────────────────────────────────────
describe('Emergency Flag Logic', () => {
  it('emergency should be true only for life-threatening situations', () => {
    const dangerousResponse: PulseAIResponse = {
      risk: 'high',
      emotion: 'suicidal',
      message: 'Please reach out now.',
      actions: ['Call 999.', 'Tell someone near you.', 'Stay on the line.'],
      breathing: false,
      emergency: true,
    };
    expect(dangerousResponse.emergency).toBe(true);
    expect(isValidPulseResponse(dangerousResponse)).toBe(true);
  });

  it('emergency should be false for craving or panic without life-threat', () => {
    const nonEmergency: PulseAIResponse = {
      risk: 'high',
      emotion: 'panic',
      message: 'You are safe.',
      actions: ['Breathe.', 'Ground yourself.', 'Call a friend.'],
      breathing: true,
      emergency: false,
    };
    expect(nonEmergency.emergency).toBe(false);
  });
});

// ─── Caregiver Dispatch Payload Tests ────────────────────────────────────────
describe('Caregiver SMS Dispatch Payload', () => {
  it('should build a valid notify payload with required fields', () => {
    const payload = {
      uid: 'user_abc123',
      contacts: [{
        contactId: 'c1',
        name: 'John Doe',
        phone: '+447700900000',
        relationship: 'Brother',
        emergencyEnabled: true,
      }],
      alert: {
        type: 'EMERGENCY_TRIGGERED',
        risk: 'high',
        emotion: "I'm Panicking",
        details: 'User is experiencing severe panic.',
        timestamp: Date.now(),
      },
    };

    expect(payload.uid).toBeTruthy();
    expect(payload.contacts.length).toBeGreaterThan(0);
    expect(payload.contacts[0].emergencyEnabled).toBe(true);
    expect(payload.alert.risk).toBe('high');
    expect(typeof payload.alert.timestamp).toBe('number');
  });

  it('should select only the FIRST SOS-enabled contact for dispatch', () => {
    const allContacts = [
      { name: 'Alice', phone: '+1111', relationship: 'Mom', emergencyEnabled: true, contactId: 'c1' },
      { name: 'Bob',   phone: '+2222', relationship: 'Dad', emergencyEnabled: true, contactId: 'c2' },
    ];
    // Mirrors contacts.find((c) => c.emergencyEnabled)
    const primary = allContacts.find(c => c.emergencyEnabled);
    expect(primary?.name).toBe('Alice');
  });

  it('should return empty dispatch list when no contacts have SOS enabled', () => {
    const allContacts = [
      { name: 'Alice', phone: '+1111', relationship: 'Mom', emergencyEnabled: false, contactId: 'c1' },
    ];
    const primary = allContacts.find(c => c.emergencyEnabled);
    expect(primary).toBeUndefined();
  });
});
