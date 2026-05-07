import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: number;
  status: 'online' | 'offline' | 'away';
}

const PRESENCE_KEY = 'user_presence';
const PRESENCE_UPDATE_INTERVAL = 30000; // 30 seconds

export class UserPresenceService {
  private static updateInterval: ReturnType<typeof setInterval> | null = null;
  private static listeners: ((presence: UserPresence[]) => void)[] = [];

  /**
   * Initialize presence tracking
   */
  static async initialize(currentUserId: string): Promise<void> {
    try {
      // Start periodic presence update
      this.startPresenceTracking(currentUserId);

      // Set current user as online
      await this.setUserOnline(currentUserId);
    } catch (error) {
      console.error('Error initializing presence service:', error);
    }
  }

  /**
   * Set user as online
   */
  static async setUserOnline(userId: string): Promise<void> {
    try {
      const presence = await this.getUserPresence(userId);
      const updatedPresence: UserPresence = {
        userId,
        isOnline: true,
        lastSeen: Date.now(),
        status: 'online',
      };

      await this.updateUserPresence(updatedPresence);
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  }

  /**
   * Set user as offline
   */
  static async setUserOffline(userId: string): Promise<void> {
    try {
      const presence = await this.getUserPresence(userId);
      const updatedPresence: UserPresence = {
        userId,
        isOnline: false,
        lastSeen: Date.now(),
        status: 'offline',
      };

      await this.updateUserPresence(updatedPresence);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  }

  /**
   * Set user as away
   */
  static async setUserAway(userId: string): Promise<void> {
    try {
      const presence = await this.getUserPresence(userId);
      const updatedPresence: UserPresence = {
        userId,
        isOnline: true,
        lastSeen: Date.now(),
        status: 'away',
      };

      await this.updateUserPresence(updatedPresence);
    } catch (error) {
      console.error('Error setting user away:', error);
    }
  }

  /**
   * Get user presence
   */
  static async getUserPresence(userId: string): Promise<UserPresence> {
    try {
      const presenceJson = await AsyncStorage.getItem(PRESENCE_KEY);
      const allPresence: UserPresence[] = presenceJson ? JSON.parse(presenceJson) : [];

      const userPresence = allPresence.find((p) => p.userId === userId);

      if (userPresence) {
        return userPresence;
      }

      // Return default offline presence
      return {
        userId,
        isOnline: false,
        lastSeen: 0,
        status: 'offline',
      };
    } catch (error) {
      console.error('Error getting user presence:', error);
      return {
        userId,
        isOnline: false,
        lastSeen: 0,
        status: 'offline',
      };
    }
  }

  /**
   * Get all user presence
   */
  static async getAllPresence(): Promise<UserPresence[]> {
    try {
      const presenceJson = await AsyncStorage.getItem(PRESENCE_KEY);
      return presenceJson ? JSON.parse(presenceJson) : [];
    } catch (error) {
      console.error('Error getting all presence:', error);
      return [];
    }
  }

  /**
   * Update user presence
   */
  private static async updateUserPresence(presence: UserPresence): Promise<void> {
    try {
      const allPresence = await this.getAllPresence();
      const index = allPresence.findIndex((p) => p.userId === presence.userId);

      if (index > -1) {
        allPresence[index] = presence;
      } else {
        allPresence.push(presence);
      }

      await AsyncStorage.setItem(PRESENCE_KEY, JSON.stringify(allPresence));

      // Notify listeners
      this.notifyListeners(allPresence);
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  }

  /**
   * Format last seen time
   */
  static formatLastSeen(lastSeen: number): string {
    if (lastSeen === 0) {
      return 'Never';
    }

    const now = Date.now();
    const diff = now - lastSeen;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    // Less than 1 week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // Format as date
    const date = new Date(lastSeen);
    return date.toLocaleDateString();
  }

  /**
   * Subscribe to presence updates
   */
  static subscribe(listener: (presence: UserPresence[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(presence: UserPresence[]): void {
    this.listeners.forEach((listener) => {
      listener(presence);
    });
  }

  /**
   * Start presence tracking (periodic updates)
   */
  private static startPresenceTracking(currentUserId: string): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        // Update current user's last seen time
        const presence = await this.getUserPresence(currentUserId);
        if (presence.isOnline) {
          await this.updateUserPresence({
            ...presence,
            lastSeen: Date.now(),
          });
        }
      } catch (error) {
        console.error('Error in presence tracking:', error);
      }
    }, PRESENCE_UPDATE_INTERVAL);
  }

  /**
   * Stop presence tracking
   */
  static stopPresenceTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Clear all presence data
   */
  static async clearPresence(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PRESENCE_KEY);
    } catch (error) {
      console.error('Error clearing presence:', error);
    }
  }
}
