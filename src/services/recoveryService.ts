import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase/firebase';
import { useRecoveryStore } from '../store/useRecoveryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { RecoverySession, TimelineEntry } from '../types';
import { TimelineService } from './timelineService';
import { CaregiverService } from './caregiverService';

export class RecoveryService {
  /**
   * Saves a new crisis recovery session to Firestore (and local store)
   */
  public static async saveSession(
    sessionData: Omit<RecoverySession, 'sessionId' | 'timestamp' | 'userId'>
  ): Promise<RecoverySession> {
    const user = useAuthStore.getState().user;
    const uid = user ? user.id : 'anonymous';
    
    const session: RecoverySession = {
      ...sessionData,
      sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
      userId: uid,
      timestamp: Date.now(),
    };

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await addDoc(collection(db, 'recovery_sessions'), {
          uid,
          emotion: session.emotion,
          aiResponse: {
            risk: session.riskLevel,
            message: session.message,
            actions: session.aiActions,
            breathing: session.breathing || false,
            emergency: session.emergencyTriggered || false,
          },
          risk: session.riskLevel,
          imageUrl: session.imageUrl || null,
          createdAt: session.timestamp,
        });
      } catch (error) {
        console.error('Firebase saveSession failed, saving to local store:', error);
      }
    }

    // Cache in Zustand store
    useRecoveryStore.getState().addSession(session);
    
    // Auto-create a timeline entry celebrating their health action using TimelineService
    await TimelineService.addTimelineEntry(
      uid,
      `Faced ${session.emotion}`,
      `Navigated a ${session.riskLevel}-risk emotional state successfully using SAHO companion.`,
      'reflection'
    );

    return session;
  }

  /**
   * Sends AI-generated SOS emergency alert to caregivers
   */
  public static async notifyCaregivers(
    session: RecoverySession,
    location?: { latitude: number; longitude: number }
  ): Promise<{ success: boolean; sentTo: string[] }> {
    const user = useAuthStore.getState().user;
    const uid = user ? user.id : 'anonymous';
    
    const contacts = useSettingsStore.getState().contacts;
    const enabledContacts = contacts.filter((c) => c.emergencyEnabled);
    const sentNames: string[] = [];

    if (enabledContacts.length === 0) {
      return { success: false, sentTo: [] };
    }

    // Call CaregiverService to handle the server POST alert
    const success = await CaregiverService.dispatchEmergencyNotification(uid, enabledContacts, {
      emotion: session.emotion,
      risk: session.riskLevel,
      responseMessage: session.message,
    });

    enabledContacts.forEach((c) => sentNames.push(c.name));

    // Add a timeline log of alert triggered
    await TimelineService.addTimelineEntry(
      uid,
      'Circle of Safety Alerted',
      `Dispatched emergency guidance SMS to ${sentNames.join(', ')}.`,
      'contact'
    );

    return { success, sentTo: sentNames };
  }
}
