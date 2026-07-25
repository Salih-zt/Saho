import { 
  signInAnonymously, 
  signOut, 
  UserCredential, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { UserProfile } from '../types';
import { UserService } from './userService';

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
        const synced = await UserService.syncUserProfile(profile);
        useAuthStore.getState().setUser(synced);
        return synced;
      } catch (error: any) {
        console.error('Firebase Google Auth Sign-in failed:', error);
        throw error;
      }
    }

    // Local offline simulation
    return this.simulateLocalLogin('google-auth@gmail.com', 'Google Companion Account');
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
        const synced = await UserService.syncUserProfile(profile);
        useAuthStore.getState().setUser(synced);
        useAuthStore.getState().setGuest(true);
        return synced;
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
    const guestUser = useAuthStore.getState().user || {
      id: `local_guest_${Math.random().toString(36).substring(2, 9)}`,
      displayName: 'Local Guest Companion',
      email: null,
      recoveryGoals: ['Maintain Sobriety'],
      isGuest: true,
      createdAt: Date.now(),
    };
    useAuthStore.getState().setUser(guestUser);
    return guestUser;
  }

  /**
   * Register a new user using Email & Password
   */
  public static async signUpWithEmail(email: string, displayName: string): Promise<UserProfile> {
    return this.signUpWithEmailAndPassword(email, 'SahoPass123!', displayName);
  }

  public static async signUpWithEmailAndPassword(email: string, password: string, displayName: string): Promise<UserProfile> {
    if (isFirebaseConfigured && auth) {
      try {
        const creds = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(creds.user, { displayName });
        
        const profile: UserProfile = {
          id: creds.user.uid,
          displayName: displayName,
          email: creds.user.email,
          recoveryGoals: ['Maintain Sobriety', 'Daily Breathing'],
          isGuest: false,
          createdAt: Date.now(),
        };
        const synced = await UserService.syncUserProfile(profile);
        useAuthStore.getState().setUser(synced);
        return synced;
      } catch (error: any) {
        console.error('Firebase Email sign-up failed:', error);
        throw error;
      }
    }
    
    return this.simulateLocalLogin(email, displayName);
  }

  /**
   * Sign in using Email & Password
   */
  public static async signInWithEmailAndPassword(email: string, classNamePassword?: string): Promise<UserProfile> {
    const password = classNamePassword || 'SahoPass123!';
    if (isFirebaseConfigured && auth) {
      try {
        const creds = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          id: creds.user.uid,
          displayName: creds.user.displayName || 'Recovery Advocate',
          email: creds.user.email,
          recoveryGoals: ['Maintain Sobriety', 'Daily Breathing'],
          isGuest: false,
          createdAt: Date.now(),
        };
        const synced = await UserService.syncUserProfile(profile);
        useAuthStore.getState().setUser(synced);
        return synced;
      } catch (error: any) {
        console.error('Firebase Email sign-in failed:', error);
        throw error;
      }
    }
    
    return this.simulateLocalLogin(email, 'Recovery Friend');
  }

  /**
   * Triggers Password Reset email
   */
  public static async sendPasswordReset(email: string): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        console.error('Firebase Password reset request failed:', error);
        throw error;
      }
    } else {
      console.log(`[Local Simulation] Password reset email sent to: ${email}`);
    }
  }

  /**
   * Signs out the current user
   */
  public static async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (error: any) {
        console.error('Firebase signout error:', error);
      }
    }
    useAuthStore.getState().logout();
  }

  /**
   * Offline/Local Simulated Login
   */
  private static simulateLocalLogin(email: string, displayName: string): UserProfile {
    const profile: UserProfile = {
      id: `local_user_${Math.random().toString(36).substring(2, 9)}`,
      displayName: displayName,
      email: email,
      recoveryGoals: ['Maintain Sobriety', 'Daily Breathing'],
      isGuest: false,
      createdAt: Date.now(),
    };
    useAuthStore.getState().setUser(profile);
    useAuthStore.getState().setGuest(false);
    return profile;
  }
}
