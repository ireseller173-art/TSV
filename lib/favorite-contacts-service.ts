/**
 * Favorite Contacts Service
 * 
 * Manages favorite/starred contacts for quick access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteContact {
  contactId: string;
  name: string;
  avatar: string;
  addedAt: number;
}

const FAVORITES_KEY = 'favorite_contacts';

class FavoriteContactsServiceClass {
  /**
   * Add contact to favorites
   */
  async addToFavorites(contactId: string, name: string, avatar: string): Promise<FavoriteContact> {
    try {
      const favorites = await this.getFavorites();
      
      // Check if already in favorites
      if (favorites.some((f) => f.contactId === contactId)) {
        console.log('✅ Contact already in favorites:', contactId);
        return favorites.find((f) => f.contactId === contactId)!;
      }

      const favorite: FavoriteContact = {
        contactId,
        name,
        avatar,
        addedAt: Date.now(),
      };

      favorites.push(favorite);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

      console.log('✅ Contact added to favorites:', contactId);
      return favorite;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove contact from favorites
   */
  async removeFromFavorites(contactId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((f) => f.contactId !== contactId);

      if (filtered.length === favorites.length) {
        console.log('⚠️ Contact not in favorites:', contactId);
        return false;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      console.log('✅ Contact removed from favorites:', contactId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get all favorite contacts
   */
  async getFavorites(): Promise<FavoriteContact[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Check if contact is favorite
   */
  async isFavorite(contactId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((f) => f.contactId === contactId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }

  /**
   * Get favorite contact by ID
   */
  async getFavorite(contactId: string): Promise<FavoriteContact | null> {
    try {
      const favorites = await this.getFavorites();
      return favorites.find((f) => f.contactId === contactId) || null;
    } catch (error) {
      console.error('Error getting favorite:', error);
      return null;
    }
  }

  /**
   * Reorder favorites
   */
  async reorderFavorites(contactIds: string[]): Promise<FavoriteContact[]> {
    try {
      const favorites = await this.getFavorites();
      const reordered: FavoriteContact[] = [];

      for (const contactId of contactIds) {
        const favorite = favorites.find((f) => f.contactId === contactId);
        if (favorite) {
          reordered.push(favorite);
        }
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(reordered));
      console.log('✅ Favorites reordered');
      return reordered;
    } catch (error) {
      console.error('Error reordering favorites:', error);
      throw error;
    }
  }

  /**
   * Clear all favorites
   */
  async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      console.log('✅ All favorites cleared');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }

  /**
   * Get favorite count
   */
  async getFavoriteCount(): Promise<number> {
    try {
      const favorites = await this.getFavorites();
      return favorites.length;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }

  /**
   * Export favorites as JSON
   */
  async exportFavorites(): Promise<string> {
    try {
      const favorites = await this.getFavorites();
      return JSON.stringify(favorites, null, 2);
    } catch (error) {
      console.error('Error exporting favorites:', error);
      throw error;
    }
  }

  /**
   * Import favorites from JSON
   */
  async importFavorites(jsonData: string): Promise<FavoriteContact[]> {
    try {
      const favorites: FavoriteContact[] = JSON.parse(jsonData);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      console.log('✅ Favorites imported:', favorites.length);
      return favorites;
    } catch (error) {
      console.error('Error importing favorites:', error);
      throw error;
    }
  }

  /**
   * Sync favorites with server
   */
  async syncFavorites(): Promise<FavoriteContact[]> {
    try {
      // In a real implementation, this would sync with a backend
      const favorites = await this.getFavorites();
      console.log('✅ Favorites synced');
      return favorites;
    } catch (error) {
      console.error('Error syncing favorites:', error);
      throw error;
    }
  }

  /**
   * Get recently added favorites
   */
  async getRecentFavorites(limit: number = 5): Promise<FavoriteContact[]> {
    try {
      const favorites = await this.getFavorites();
      return favorites
        .sort((a, b) => b.addedAt - a.addedAt)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent favorites:', error);
      return [];
    }
  }
}

export const FavoriteContactsService = new FavoriteContactsServiceClass();
