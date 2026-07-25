import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase/firebase';

export class EducationService {
  /**
   * Fetches all completed lesson IDs for the user from Firestore
   */
  public static async fetchCompletedLessons(uid: string): Promise<string[]> {
    if (!isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const progressRef = collection(db, 'education_progress');
      const q = query(progressRef, where('uid', '==', uid));
      const querySnap = await getDocs(q);

      const completedIds: string[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.lessonId) {
          completedIds.push(data.lessonId);
        }
      });
      return completedIds;
    } catch (error) {
      console.error('Failed to fetch education progress from Firestore:', error);
      return [];
    }
  }

  /**
   * Marks a lesson as completed in Firestore
   */
  public static async markLessonComplete(uid: string, lessonId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      return;
    }

    try {
      // Use uid + lessonId as key to prevent duplicate entries
      const docId = `${uid}_${lessonId}`;
      const docRef = doc(db, 'education_progress', docId);
      await setDoc(docRef, {
        uid,
        lessonId,
        completedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to mark lesson complete in Firestore:', error);
      throw error;
    }
  }
}
