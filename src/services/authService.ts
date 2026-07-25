import { signInAnonymously, signOut, UserCredential, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { UserProfile } from '../types';

export class AuthService {
  /**
   * Google Sign In Authentication
   */
  public static async signInWithGoogle(): Promise<UserProfile> {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const creds = await signInWithPopup(auth, provider);
        const profile: UserProfile = {
          id: creds.user.uid,
          displayName: creds.user.displayName || 'Google Companion',
          email: creds.user.email,
          recoveryGoals: ['Maintain Sobriety', 'Daily Breathing', 'Google Sync Active'],
          isGuest: false,
          createdAt: Date.now(),
        };
        useAuthStore.getState().setUser(profile);
        return profile;
      } catch (error) {
        console.error('Firebase Google Auth Sign-in failed:', error);
        throw error;
      }
    }

    // Local simulated Google authentication
    return this.loginWithEmail('google-auth@gmail.com', 'Google Companion Account');
  }
  /**
   * Signs in a user anonymously for quick emergency access
   */
  public static async signInAsGuest(): Promise<UserProfile> {
    if (isFirebaseConfigured && auth) {
      try {
        const creds: UserCredential = await signInAnonymously(auth);
        const profile: UserProfile = {
          id: creds.user.uid,
          displayName: 'Guest Companion',
          email: null,
          recoveryGoals: [],
          isGuest: true,
          createdAt: Date.now(),
        };
        useAuthStore.getState().setUser(profile);
        useAuthStore.getState().setGuest(true);
        return profile;
      } catch (error: any) {
        if (error?.code === 'auth/admin-restricted-operation') {
          console.warn(
            'Firebase Setup Required: Anonymous Authentication is currently disabled in your Firebase console.\n' +
            'To resolve this: Go to Firebase Console -> Authentication -> Sign-in method, and enable "Anonymous".\n' +
            'Reverting to fully functional Local Guest Mode in the meantime.'
          );
        } else {
          console.error('Firebase guest signin failed, reverting to local guest mode:', error);
        }
      }
    }
    
    // Local fallback
    useAuthStore.getState().setGuest(true);
    const guestUser = useAuthStore.getState().user!;
    return guestUser;
  }

  /**
   * Signs out the current user
   */
  public static async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Firebase signout error:', error);
      }
    }
    useAuthStore.getState().logout();
  }

  /**
   * Mock Email Login for demo/fallback verification
   */
  public static async loginWithEmail(email: string, name: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      displayName: name || 'Recovery Advocate',
      email: email,
      recoveryGoals: ['Maintain Sobriety', 'Daily Breathing', 'Build Caregiver Support'],
      isGuest: false,
      createdAt: Date.now(),
    };
    useAuthStore.getState().setUser(profile);
    return profile;
  }
}
