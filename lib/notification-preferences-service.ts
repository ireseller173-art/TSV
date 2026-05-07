import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationPreference {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
}

export interface NotificationPreferences {
  userId: string;
  messages: NotificationPreference;
  calls: NotificationPreference;
  groups: NotificationPreference;
  mentions: NotificationPreference;
  reactions: NotificationPreference;
  updatedAt: number;
}

const STORAGE_KEY = '@cool_messenger_notification_preferences';

/**
 * Notification Preferences Service
 * Manages user notification settings and preferences
 */
export class NotificationPreferencesService {
  /**
   * Get default notification preferences
   */
  static getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      messages: {
        enabled: true,
        sound: true,
        vibration: true,
        preview: true,
      },
      calls: {
        enabled: true,
        sound: true,
        vibration: true,
        preview: true,
      },
      groups: {
        enabled: true,
        sound: false,
        vibration: true,
        preview: false,
      },
      mentions: {
        enabled: true,
        sound: true,
        vibration: true,
        preview: true,
      },
      reactions: {
        enabled: true,
        sound: false,
        vibration: false,
        preview: false,
      },
      updatedAt: Date.now(),
    };
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      const stored = await AsyncStorage.getItem(key);

      if (stored) {
        return JSON.parse(stored);
      }

      // Return defaults if not found
      const defaults = this.getDefaultPreferences(userId);
      await AsyncStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const key = `${STORAGE_KEY}_${userId}`;
      const current = await this.getPreferences(userId);

      const updated: NotificationPreferences = {
        ...current,
        ...preferences,
        userId,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update specific notification category
   */
  static async updateCategory(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>,
    preference: NotificationPreference
  ): Promise<NotificationPreferences> {
    try {
      const current = await this.getPreferences(userId);
      return this.updatePreferences(userId, {
        ...current,
        [category]: preference,
      });
    } catch (error) {
      console.error('Error updating notification category:', error);
      throw error;
    }
  }

  /**
   * Toggle notification for category
   */
  static async toggleNotification(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>,
    field: keyof NotificationPreference
  ): Promise<NotificationPreferences> {
    try {
      const current = await this.getPreferences(userId);
      const categoryPrefs = current[category];

      const updated = {
        ...current,
        [category]: {
          ...categoryPrefs,
          [field]: !categoryPrefs[field],
        },
      };

      return this.updatePreferences(userId, updated);
    } catch (error) {
      console.error('Error toggling notification:', error);
      throw error;
    }
  }

  /**
   * Reset to default preferences
   */
  static async resetToDefaults(userId: string): Promise<NotificationPreferences> {
    try {
      const defaults = this.getDefaultPreferences(userId);
      const key = `${STORAGE_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  }

  /**
   * Check if notification should be shown
   */
  static async shouldShowNotification(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>
  ): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      return prefs[category].enabled;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true; // Default to showing
    }
  }

  /**
   * Get notification sound preference
   */
  static async shouldPlaySound(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>
  ): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      return prefs[category].enabled && prefs[category].sound;
    } catch (error) {
      console.error('Error checking sound preference:', error);
      return true;
    }
  }

  /**
   * Get notification vibration preference
   */
  static async shouldVibrate(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>
  ): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      return prefs[category].enabled && prefs[category].vibration;
    } catch (error) {
      console.error('Error checking vibration preference:', error);
      return true;
    }
  }

  /**
   * Get notification preview preference
   */
  static async shouldShowPreview(
    userId: string,
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>
  ): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      return prefs[category].enabled && prefs[category].preview;
    } catch (error) {
      console.error('Error checking preview preference:', error);
      return true;
    }
  }

  /**
   * Export preferences as JSON
   */
  static async exportPreferences(userId: string): Promise<string> {
    try {
      const prefs = await this.getPreferences(userId);
      return JSON.stringify(prefs, null, 2);
    } catch (error) {
      console.error('Error exporting preferences:', error);
      throw error;
    }
  }

  /**
   * Import preferences from JSON
   */
  static async importPreferences(userId: string, json: string): Promise<NotificationPreferences> {
    try {
      const prefs = JSON.parse(json);
      return this.updatePreferences(userId, prefs);
    } catch (error) {
      console.error('Error importing preferences:', error);
      throw error;
    }
  }
}

export default NotificationPreferencesService;
