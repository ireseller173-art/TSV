import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';
import { UserPresence } from './user-presence-service';

export class UserPresenceFirebase {
  private static firebaseListeners: Map<string, any> = new Map();

  /**
   * Sync presence with Firebase Realtime Database
   */
  static async syncWithFirebase(currentUserId: string, presence: UserPresence): Promise<void> {
    try {
      const db = getDatabase();
      const presenceRef = ref(db, `presence/${currentUserId}`);
      
      // Set user presence in Firebase
      await set(presenceRef, {
        userId: presence.userId,
        isOnline: presence.isOnline,
        lastSeen: presence.lastSeen,
        status: presence.status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.warn('Firebase sync failed:', error);
    }
  }

  /**
   * Listen for presence updates from Firebase
   */
  static listenToPresence(userId: string, callback: (presence: UserPresence) => void): () => void {
    try {
      const db = getDatabase();
      const presenceRef = ref(db, `presence/${userId}`);
      
      const unsubscribe = onValue(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          callback({
            userId: data.userId || userId,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
            status: data.status,
          });
        }
      });

      this.firebaseListeners.set(userId, unsubscribe);
      
      return () => {
        unsubscribe();
        this.firebaseListeners.delete(userId);
      };
    } catch (error) {
      console.warn('Firebase listen failed:', error);
      return () => {};
    }
  }

  /**
   * Get presence from Firebase
   */
  static async getPresenceFromFirebase(userId: string): Promise<UserPresence | null> {
    try {
      const db = getDatabase();
      const presenceRef = ref(db, `presence/${userId}`);
      const snapshot = await get(presenceRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          userId: data.userId || userId,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen,
          status: data.status,
        };
      }
      return null;
    } catch (error) {
      console.warn('Firebase get failed:', error);
      return null;
    }
  }

  /**
   * Stop listening to presence updates
   */
  static stopListening(userId: string): void {
    const unsubscribe = this.firebaseListeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.firebaseListeners.delete(userId);
    }
  }

  /**
   * Stop all listeners
   */
  static stopAllListeners(): void {
    this.firebaseListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.firebaseListeners.clear();
  }
}
