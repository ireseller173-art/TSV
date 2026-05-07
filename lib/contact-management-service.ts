import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ContactPreferences {
  contactId: string;
  isFavorite: boolean;
  isBlocked: boolean;
  blockedAt?: number;
  favoriteAddedAt?: number;
  notes?: string;
}

const CONTACT_PREFS_KEY = 'contact_preferences';

export class ContactManagementService {
  /**
   * Add contact to favorites
   */
  static async addToFavorites(contactId: string): Promise<ContactPreferences | null> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      const updated: ContactPreferences = {
        ...prefs,
        contactId,
        isFavorite: true,
        favoriteAddedAt: Date.now(),
      };

      await this.saveContactPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }

  /**
   * Remove contact from favorites
   */
  static async removeFromFavorites(contactId: string): Promise<ContactPreferences | null> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      const updated: ContactPreferences = {
        ...prefs,
        contactId,
        isFavorite: false,
      };

      await this.saveContactPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return null;
    }
  }

  /**
   * Block contact
   */
  static async blockContact(contactId: string, reason?: string): Promise<ContactPreferences | null> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      const updated: ContactPreferences = {
        ...prefs,
        contactId,
        isBlocked: true,
        blockedAt: Date.now(),
        notes: reason || prefs.notes,
      };

      await this.saveContactPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error blocking contact:', error);
      return null;
    }
  }

  /**
   * Unblock contact
   */
  static async unblockContact(contactId: string): Promise<ContactPreferences | null> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      const updated: ContactPreferences = {
        ...prefs,
        contactId,
        isBlocked: false,
      };

      await this.saveContactPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error unblocking contact:', error);
      return null;
    }
  }

  /**
   * Get contact preferences
   */
  static async getContactPreferences(contactId: string): Promise<ContactPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(CONTACT_PREFS_KEY);
      const allPrefs: ContactPreferences[] = prefsJson ? JSON.parse(prefsJson) : [];

      const prefs = allPrefs.find((p) => p.contactId === contactId);

      if (prefs) {
        return prefs;
      }

      // Return default preferences
      return {
        contactId,
        isFavorite: false,
        isBlocked: false,
      };
    } catch (error) {
      console.error('Error getting contact preferences:', error);
      return {
        contactId,
        isFavorite: false,
        isBlocked: false,
      };
    }
  }

  /**
   * Get all favorite contacts
   */
  static async getFavoriteContacts(): Promise<string[]> {
    try {
      const prefsJson = await AsyncStorage.getItem(CONTACT_PREFS_KEY);
      const allPrefs: ContactPreferences[] = prefsJson ? JSON.parse(prefsJson) : [];

      return allPrefs
        .filter((p) => p.isFavorite && !p.isBlocked)
        .sort((a, b) => (b.favoriteAddedAt || 0) - (a.favoriteAddedAt || 0))
        .map((p) => p.contactId);
    } catch (error) {
      console.error('Error getting favorite contacts:', error);
      return [];
    }
  }

  /**
   * Get all blocked contacts
   */
  static async getBlockedContacts(): Promise<string[]> {
    try {
      const prefsJson = await AsyncStorage.getItem(CONTACT_PREFS_KEY);
      const allPrefs: ContactPreferences[] = prefsJson ? JSON.parse(prefsJson) : [];

      return allPrefs
        .filter((p) => p.isBlocked)
        .sort((a, b) => (b.blockedAt || 0) - (a.blockedAt || 0))
        .map((p) => p.contactId);
    } catch (error) {
      console.error('Error getting blocked contacts:', error);
      return [];
    }
  }

  /**
   * Check if contact is blocked
   */
  static async isContactBlocked(contactId: string): Promise<boolean> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      return prefs.isBlocked;
    } catch (error) {
      console.error('Error checking if contact is blocked:', error);
      return false;
    }
  }

  /**
   * Check if contact is favorite
   */
  static async isContactFavorite(contactId: string): Promise<boolean> {
    try {
      const prefs = await this.getContactPreferences(contactId);
      return prefs.isFavorite;
    } catch (error) {
      console.error('Error checking if contact is favorite:', error);
      return false;
    }
  }

  /**
   * Save contact preferences
   */
  private static async saveContactPreferences(prefs: ContactPreferences): Promise<void> {
    try {
      const prefsJson = await AsyncStorage.getItem(CONTACT_PREFS_KEY);
      const allPrefs: ContactPreferences[] = prefsJson ? JSON.parse(prefsJson) : [];

      const index = allPrefs.findIndex((p) => p.contactId === prefs.contactId);

      if (index > -1) {
        allPrefs[index] = prefs;
      } else {
        allPrefs.push(prefs);
      }

      await AsyncStorage.setItem(CONTACT_PREFS_KEY, JSON.stringify(allPrefs));
    } catch (error) {
      console.error('Error saving contact preferences:', error);
    }
  }

  /**
   * Clear all contact preferences
   */
  static async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONTACT_PREFS_KEY);
    } catch (error) {
      console.error('Error clearing contact preferences:', error);
    }
  }
}
