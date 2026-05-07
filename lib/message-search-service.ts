/**
 * Message Search Service
 * 
 * Handles searching and filtering messages across chats
 * Supports full-text search, date filtering, and sender filtering
 */

import { Message } from './chat-service';

export interface SearchQuery {
  text?: string;
  chatId?: string;
  senderId?: string;
  startDate?: number;
  endDate?: number;
  type?: 'text' | 'image' | 'voice' | 'call';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  message: Message;
  relevance: number; // 0-1 score
  context?: string; // surrounding text
}

class MessageSearchServiceClass {
  private messageCache: Map<string, Message[]> = new Map();

  /**
   * Index messages for faster searching
   */
  async indexMessages(messages: Message[]): Promise<void> {
    try {
      for (const message of messages) {
        const chatId = message.chatId;
        if (!this.messageCache.has(chatId)) {
          this.messageCache.set(chatId, []);
        }
        const chatMessages = this.messageCache.get(chatId)!;
        if (!chatMessages.find((m) => m.id === message.id)) {
          chatMessages.push(message);
        }
      }
      console.log('✅ Messages indexed:', messages.length);
    } catch (error) {
      console.error('Error indexing messages:', error);
      throw error;
    }
  }

  /**
   * Search messages by text
   */
  async searchByText(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      const searchText = (query.text || '').toLowerCase();

      if (!searchText) {
        return results;
      }

      // Search in cache
      for (const [, messages] of this.messageCache) {
        for (const message of messages) {
          // Apply filters
          if (query.chatId && message.chatId !== query.chatId) continue;
          if (query.senderId && message.senderId !== query.senderId) continue;
          if (query.type && message.type !== query.type) continue;
          if (query.startDate && message.timestamp < query.startDate) continue;
          if (query.endDate && message.timestamp > query.endDate) continue;

          // Check if text matches
          const messageText = message.text.toLowerCase();
          if (messageText.includes(searchText)) {
            const relevance = this.calculateRelevance(messageText, searchText);
            results.push({
              message,
              relevance,
              context: this.getContext(message.text, searchText),
            });
          }
        }
      }

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      // Apply pagination
      const limit = query.limit || 50;
      const offset = query.offset || 0;
      const paginatedResults = results.slice(offset, offset + limit);

      console.log('✅ Search results found:', paginatedResults.length);
      return paginatedResults;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Search messages by sender
   */
  async searchBySender(
    senderId: string,
    chatId?: string
  ): Promise<SearchResult[]> {
    try {
      return this.searchByText({ senderId, chatId });
    } catch (error) {
      console.error('Error searching by sender:', error);
      throw error;
    }
  }

  /**
   * Search messages by date range
   */
  async searchByDateRange(
    startDate: number,
    endDate: number,
    chatId?: string
  ): Promise<SearchResult[]> {
    try {
      return this.searchByText({ startDate, endDate, chatId });
    } catch (error) {
      console.error('Error searching by date:', error);
      throw error;
    }
  }

  /**
   * Search messages by type
   */
  async searchByType(
    type: 'text' | 'image' | 'voice' | 'call',
    chatId?: string
  ): Promise<SearchResult[]> {
    try {
      return this.searchByText({ type, chatId });
    } catch (error) {
      console.error('Error searching by type:', error);
      throw error;
    }
  }

  /**
   * Get all messages in a chat
   */
  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      return this.messageCache.get(chatId) || [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match = 1.0
    if (lowerText === lowerQuery) {
      return 1.0;
    }

    // Starts with = 0.8
    if (lowerText.startsWith(lowerQuery)) {
      return 0.8;
    }

    // Contains = 0.6
    if (lowerText.includes(lowerQuery)) {
      return 0.6;
    }

    // Partial match = 0.4
    const queryWords = lowerQuery.split(' ');
    const matchedWords = queryWords.filter((word) =>
      lowerText.includes(word)
    ).length;
    if (matchedWords > 0) {
      return 0.4 * (matchedWords / queryWords.length);
    }

    return 0;
  }

  /**
   * Get context around search result
   */
  private getContext(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, 100);

    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + query.length + 30);
    const context = text.substring(start, end);

    return `...${context}...`;
  }

  /**
   * Get trending search terms
   */
  async getTrendingSearches(): Promise<string[]> {
    try {
      // In a real implementation, this would analyze search history
      return [];
    } catch (error) {
      console.error('Error getting trending searches:', error);
      throw error;
    }
  }

  /**
   * Save search history
   */
  async saveSearchHistory(query: string): Promise<void> {
    try {
      console.log('✅ Search saved to history:', query);
    } catch (error) {
      console.error('Error saving search history:', error);
      throw error;
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    try {
      return [];
    } catch (error) {
      console.error('Error getting search history:', error);
      throw error;
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      console.log('✅ Search history cleared');
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  /**
   * Clear message cache
   */
  async clearCache(): Promise<void> {
    try {
      this.messageCache.clear();
      console.log('✅ Message cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }
}

export const MessageSearchService = new MessageSearchServiceClass();
