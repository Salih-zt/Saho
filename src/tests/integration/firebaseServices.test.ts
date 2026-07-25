import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../../services/authService';
import { UserService } from '../../services/userService';
import { TimelineService } from '../../services/timelineService';
import { CaregiverService } from '../../services/caregiverService';
import { StorageService } from '../../services/storageService';

describe('SAHO Production Firebase Services Integration', () => {
  
  describe('AuthService Integration Fallbacks', () => {
    it('should fall back to local simulated login if Firebase client is unconfigured or offline', async () => {
      const email = 'test-advocate@gmail.com';
      const name = 'Recovery Advocate';
      const profile = await AuthService.signUpWithEmailAndPassword(email, 'SahoPass123!', name);
      
      expect(profile).toBeDefined();
      expect(profile.email).toBe(email);
      expect(profile.displayName).toBe(name);
      expect(profile.isGuest).toBe(false);
      expect(profile.id).toBeDefined();
    });

    it('should generate a valid Guest Profile on guest sign-in fallback', async () => {
      const profile = await AuthService.signInAsGuest();
      expect(profile).toBeDefined();
      expect(profile.isGuest).toBe(true);
      expect(profile.displayName).toContain('Guest');
    });
  });

  describe('TimelineService Integration', () => {
    it('should generate structured TimelineEntry models successfully', async () => {
      const uid = 'user_123';
      const entry = await TimelineService.addTimelineEntry(
        uid,
        'Completed Breathing Exercise',
        'Finished 4 minutes of paced breathing.',
        'breathing'
      );

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(uid);
      expect(entry.title).toBe('Completed Breathing Exercise');
      expect(entry.type).toBe('breathing');
      expect(entry.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('StorageService Integration Security Guardrails', () => {
    it('should throw an error if image file size exceeds the 5MB security threshold', async () => {
      // Simulate a large image base64 data string (approx 6MB)
      const mockLargeBase64 = 'data:image/jpeg;base64,' + 'a'.repeat(8 * 1024 * 1024);
      
      await expect(
        StorageService.uploadBase64Image('user_123', mockLargeBase64)
      ).rejects.toThrow('Image upload exceeds the 5MB security limit.');
    });

    it('should throw an error if file MIME type is not a valid image format', async () => {
      // Simulate an html file base64 data string
      const mockHtmlBase64 = 'data:text/html;base64,PGh0bWw+aGVsbG88L2h0bWw+';
      
      await expect(
        StorageService.uploadBase64Image('user_123', mockHtmlBase64)
      ).rejects.toThrow('Invalid file type. Only image uploads are permitted.');
    });
  });
});
