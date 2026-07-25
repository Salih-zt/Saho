import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase/firebase';
import { CaregiverContact } from '../types';

export class CaregiverService {
  /**
   * Fetches all caregiver contacts configured for the specified user uid from Firestore
   */
  public static async fetchContacts(uid: string): Promise<CaregiverContact[]> {
    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return [];
    }

    try {
      const contactsRef = collection(db, 'caregiver_contacts');
      const q = query(contactsRef, where('uid', '==', uid));
      const querySnap = await getDocs(q);

      const list: CaregiverContact[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          contactId: docSnap.id,
          name: data.name,
          phone: data.phone,
          relationship: data.relationship,
          emergencyEnabled: data.emergencyEnabled ?? true,
        });
      });
      return list;
    } catch (error) {
      console.error('Failed to fetch caregiver contacts from Firestore:', error);
      return [];
    }
  }

  /**
   * Saves or updates a caregiver contact in Firestore
   */
  public static async saveContact(uid: string, contact: CaregiverContact): Promise<void> {
    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return;
    }

    try {
      const docRef = doc(db, 'caregiver_contacts', contact.contactId);
      await setDoc(docRef, {
        uid,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        emergencyEnabled: contact.emergencyEnabled,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to save caregiver contact to Firestore:', error);
      throw error;
    }
  }

  /**
   * Deletes a caregiver contact from Firestore
   */
  public static async deleteContact(contactId: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return;
    }

    try {
      const docRef = doc(db, 'caregiver_contacts', contactId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Failed to delete caregiver contact from Firestore:', error);
      throw error;
    }
  }

  /**
   * Triggers caregiver alert notification via local API broadcast
   */
  public static async dispatchEmergencyNotification(
    uid: string, 
    contacts: CaregiverContact[], 
    sessionDetails: { emotion: string; responseMessage: string; risk: string }
  ): Promise<boolean> {
    const activeContacts = contacts.filter((c) => c.emergencyEnabled);
    if (activeContacts.length === 0) {
      return false;
    }

    try {
      const response = await fetch('/api/caregiver/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          contacts: activeContacts,
          alert: {
            type: 'EMERGENCY_TRIGGERED',
            risk: sessionDetails.risk,
            emotion: sessionDetails.emotion,
            details: sessionDetails.responseMessage,
            timestamp: Date.now(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('API route returned error code ' + response.status);
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Failed to dispatch emergency caregiver notifications:', error);
      return false;
    }
  }
}
