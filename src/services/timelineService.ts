import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase/firebase';
import { TimelineEntry } from '../types';

export class TimelineService {
  /**
   * Fetches all timeline entries for the user from Firestore
   */
  public static async fetchTimelineEntries(uid: string): Promise<TimelineEntry[]> {
    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return [];
    }

    try {
      const timelineRef = collection(db, 'timeline_entries');
      const q = query(
        timelineRef, 
        where('uid', '==', uid), 
        orderBy('createdAt', 'desc')
      );
      const querySnap = await getDocs(q);

      const entries: TimelineEntry[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({
          id: docSnap.id,
          userId: data.uid,
          timestamp: data.createdAt,
          title: data.title,
          description: data.description,
          type: data.type || 'reflection',
        });
      });
      return entries;
    } catch (error) {
      console.error('Failed to fetch timeline entries from Firestore:', error);
      return [];
    }
  }

  /**
   * Adds a new timeline entry to Firestore
   */
  public static async addTimelineEntry(
    uid: string, 
    title: string, 
    description: string, 
    type: TimelineEntry['type']
  ): Promise<TimelineEntry> {
    const newEntry: Omit<TimelineEntry, 'id' | 'userId'> = {
      title,
      description,
      timestamp: Date.now(),
      type,
    };

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        const timelineRef = collection(db, 'timeline_entries');
        const docRef = await addDoc(timelineRef, {
          uid,
          title: newEntry.title,
          description: newEntry.description,
          createdAt: newEntry.timestamp,
          type: newEntry.type
        });
        return {
          id: docRef.id,
          userId: uid,
          ...newEntry
        };
      } catch (error) {
        console.error('Failed to write timeline entry to Firestore:', error);
      }
    }

    // Local simulated offline fallback
    return {
      id: `local_event_${Date.now()}`,
      userId: uid,
      ...newEntry
    };
  }

  /**
   * Deletes all timeline logs for a specific user
   */
  public static async clearTimeline(uid: string): Promise<void> {
    if (!isFirebaseConfigured || !db || !auth?.currentUser) {
      return;
    }

    try {
      const timelineRef = collection(db, 'timeline_entries');
      const q = query(timelineRef, where('uid', '==', uid));
      const querySnap = await getDocs(q);

      const batch = writeBatch(db);
      querySnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error('Failed to clear timeline entries from Firestore:', error);
      throw error;
    }
  }
}
