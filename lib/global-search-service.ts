import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchResult {
  id: string;
  type: 'message' | 'contact' | 'group' | 'chat';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: number;
  preview?: string;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

const SEARCH_HISTORY_KEY = '@cool_messenger_search_history';
const MAX_HISTORY_ITEMS = 20;

export class GlobalSearchService {
  /**
   * Search across messages, contacts, and groups
   */
  static async search(query: string): Promise<SearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search in messages (mock data - in real app, query from Firestore)
      const messageResults = await this.searchMessages(lowerQuery);
      results.push(...messageResults);

      // Search in contacts (mock data)
      const contactResults = await this.searchContacts(lowerQuery);
      results.push(...contactResults);

      // Search in groups (mock data)
      const groupResults = await this.searchGroups(lowerQuery);
      results.push(...groupResults);

      // Sort by relevance and timestamp
      results.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp - a.timestamp;
        }
        return 0;
      });

      // Save to search history
      await this.addToHistory(query, results.length);

      return results;
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }

  /**
   * Search in messages
   */
  private static async searchMessages(query: string): Promise<SearchResult[]> {
    try {
      // In a real app, this would query Firestore
      // For now, returning empty array
      return [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Search in contacts
   */
  private static async searchContacts(query: string): Promise<SearchResult[]> {
    try {
      // In a real app, this would query Firestore
      // For now, returning empty array
      return [];
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  }

  /**
   * Search in groups
   */
  private static async searchGroups(query: string): Promise<SearchResult[]> {
    try {
      // In a real app, this would query Firestore
      // For now, returning empty array
      return [];
    } catch (error) {
      console.error('Error searching groups:', error);
      return [];
    }
  }

  /**
   * Get search history
   */
  static async getHistory(): Promise<SearchHistory[]> {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Add query to search history
   */
  static async addToHistory(query: string, resultCount: number): Promise<void> {
    try {
      const history = await this.getHistory();

      // Remove duplicate if exists
      const filtered = history.filter((item) => item.query !== query);

      // Add new entry at the beginning
      const newEntry: SearchHistory = {
        query,
        timestamp: Date.now(),
        resultCount,
      };

      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  /**
   * Clear search history
   */
  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  /**
   * Remove specific item from history
   */
  static async removeFromHistory(query: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter((item) => item.query !== query);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  /**
   * Get popular searches
   */
  static async getPopularSearches(): Promise<string[]> {
    try {
      const history = await this.getHistory();
      return history.slice(0, 5).map((item) => item.query);
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }
}

export default GlobalSearchService;
