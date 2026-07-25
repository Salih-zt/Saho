import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase/firebase';
import { UserProfile } from '../types';

export class UserService {
  /**
   * Syncs user profile with Firestore users collection on sign-in
   */
  public static async syncUserProfile(profile: UserProfile): Promise<UserProfile> {
    if (!isFirebaseConfigured || !db) {
      return profile;
    }

    try {
      const userRef = doc(db, 'users', profile.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user document
        const newUserDoc = {
          uid: profile.id,
          displayName: profile.displayName,
          email: profile.email,
          createdAt: profile.createdAt,
          recoveryGoal: profile.recoveryGoals || [],
        };
        await setDoc(userRef, newUserDoc);
        return {
          ...profile,
          recoveryGoals: newUserDoc.recoveryGoal,
        };
      } else {
        // Load existing document
        const data = userSnap.data();
        return {
          ...profile,
          displayName: data.displayName || profile.displayName,
          email: data.email || profile.email,
          recoveryGoals: data.recoveryGoal || [],
        };
      }
    } catch (error) {
      console.error('Failed to sync user profile with Firestore:', error);
      return profile;
    }
  }

  /**
   * Updates user recovery goals array
   */
  public static async updateRecoveryGoals(uid: string, goals: string[]): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      return;
    }

    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        recoveryGoal: goals,
      });
    } catch (error) {
      console.error('Failed to update user recovery goals:', error);
      throw error;
    }
  }
}
