/**
 * Presence Service
 * Manages user online/offline status and last seen timestamps
 */

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  status?: 'online' | 'away' | 'offline';
}

export const presenceService = {
  /**
   * Get user presence status
   */
  async getUserPresence(userId: string): Promise<UserPresence> {
    // TODO: Implement Firebase Realtime Database or Firestore query
    return {
      userId,
      isOnline: Math.random() > 0.5, // Mock data
      lastSeen: Date.now(),
      status: 'online',
    };
  },

  /**
   * Set user online
   */
  async setUserOnline(userId: string): Promise<void> {
    // TODO: Update Firebase Realtime Database
  },

  /**
   * Set user offline
   */
  async setUserOffline(userId: string): Promise<void> {
    // TODO: Update Firebase Realtime Database with lastSeen timestamp
  },

  /**
   * Subscribe to user presence changes
   */
  subscribeToPresence(userId: string, callback: (presence: UserPresence) => void): () => void {
    // TODO: Implement Firebase listener
    const unsubscribe = () => {
    };
    return unsubscribe;
  },

  /**
   * Get formatted last seen text
   */
  getLastSeenText(lastSeen: number): string {
    const now = Date.now();
    const diff = now - lastSeen;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    const date = new Date(lastSeen);
    return date.toLocaleDateString();
  },

  /**
   * Check if user is online
   */
  isUserOnline(presence: UserPresence): boolean {
    return presence.isOnline && presence.status === 'online';
  },
};
