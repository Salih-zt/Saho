import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase/firebase';

export class StorageService {
  /**
   * Uploads a base64 image data string to Firebase Storage
   * @param uid The user ID associated with the upload
   * @param base64Data The base64 data string (e.g. data:image/jpeg;base64,...)
   * @returns Promise resolving to the secure download URL
   */
  public static async uploadBase64Image(uid: string, base64Data: string): Promise<string> {
    // 1. Perform strict format validation checks first (Security Guidelines)
    const parts = base64Data.split(';base64,');
    if (parts.length < 2) {
      throw new Error('Invalid image format.');
    }
    
    const contentType = parts[0].split(':')[1];
    
    // Estimate size of base64 file representation
    const approxSize = (parts[1].length * 3) / 4;
    if (approxSize > 5 * 1024 * 1024) {
      throw new Error('Image upload exceeds the 5MB security limit.');
    }

    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid file type. Only image uploads are permitted.');
    }

    if (!isFirebaseConfigured || !storage) {
      console.warn('Firebase Storage is not configured. Returning local base64 fallback string.');
      return base64Data; // Return local base64 string for offline rendering
    }

    try {
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const timestamp = Date.now();
      const fileExtension = contentType.split('/')[1] || 'jpg';
      const storagePath = `images/${uid}/${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, storagePath);

      // Perform upload
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: contentType,
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error('Failed to upload image to Firebase Storage:', error);
      throw error;
    }
  }
}
