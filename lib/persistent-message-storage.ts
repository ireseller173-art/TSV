import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  edited?: boolean;
  editedAt?: number;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  voiceUrl?: string;
  voiceDuration?: number;
}

export interface StoredChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isGroup: boolean;
  members?: string[];
}

const MESSAGES_KEY = 'messages';
const CHATS_KEY = 'chats';
const CHAT_MESSAGES_PREFIX = 'chat_messages_';

export class PersistentMessageStorage {
  /**
   * Save message to AsyncStorage
   */
  static async saveMessage(message: StoredMessage): Promise<void> {
    try {
      const chatKey = `${CHAT_MESSAGES_PREFIX}${message.chatId}`;
      const existingMessages = await this.getChatMessages(message.chatId);
      
      // Replace if message already exists, otherwise add
      const index = existingMessages.findIndex(m => m.id === message.id);
      if (index >= 0) {
        existingMessages[index] = message;
      } else {
        existingMessages.push(message);
      }
      
      await AsyncStorage.setItem(chatKey, JSON.stringify(existingMessages));
      
      // Update chat's last message
      await this.updateChatLastMessage(message.chatId, message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  /**
   * Get all messages for a chat
   */
  static async getChatMessages(chatId: string): Promise<StoredMessage[]> {
    try {
      const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
      const data = await AsyncStorage.getItem(chatKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messages = await this.getChatMessages(chatId);
      const filtered = messages.filter(m => m.id !== messageId);
      const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
      await AsyncStorage.setItem(chatKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  /**
   * Update message (for edits, reactions, status)
   */
  static async updateMessage(
    chatId: string,
    messageId: string,
    updates: Partial<StoredMessage>
  ): Promise<void> {
    try {
      const messages = await this.getChatMessages(chatId);
      const message = messages.find(m => m.id === messageId);
      
      if (message) {
        Object.assign(message, updates, { editedAt: Date.now() });
        const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
        await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  /**
   * Add reaction to message
   */
  static async addReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messages = await this.getChatMessages(chatId);
      const message = messages.find(m => m.id === messageId);
      
      if (message) {
        if (!message.reactions) {
          message.reactions = {};
        }
        if (!message.reactions[emoji]) {
          message.reactions[emoji] = [];
        }
        if (!message.reactions[emoji].includes(userId)) {
          message.reactions[emoji].push(userId);
        }
        
        const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
        await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  /**
   * Remove reaction from message
   */
  static async removeReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messages = await this.getChatMessages(chatId);
      const message = messages.find(m => m.id === messageId);
      
      if (message && message.reactions && message.reactions[emoji]) {
        message.reactions[emoji] = message.reactions[emoji].filter(id => id !== userId);
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji];
        }
        
        const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
        await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }

  /**
   * Save chat
   */
  static async saveChat(chat: StoredChat): Promise<void> {
    try {
      const chats = await this.getAllChats();
      const index = chats.findIndex(c => c.id === chat.id);
      
      if (index >= 0) {
        chats[index] = chat;
      } else {
        chats.push(chat);
      }
      
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }

  /**
   * Get all chats
   */
  static async getAllChats(): Promise<StoredChat[]> {
    try {
      const data = await AsyncStorage.getItem(CHATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  /**
   * Get single chat
   */
  static async getChat(chatId: string): Promise<StoredChat | null> {
    try {
      const chats = await this.getAllChats();
      return chats.find(c => c.id === chatId) || null;
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  /**
   * Update chat (for unread count, mute, pin, etc.)
   */
  static async updateChat(chatId: string, updates: Partial<StoredChat>): Promise<void> {
    try {
      const chat = await this.getChat(chatId);
      if (chat) {
        Object.assign(chat, updates);
        await this.saveChat(chat);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  }

  /**
   * Delete chat
   */
  static async deleteChat(chatId: string): Promise<void> {
    try {
      const chats = await this.getAllChats();
      const filtered = chats.filter(c => c.id !== chatId);
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(filtered));
      
      // Also delete all messages for this chat
      const chatKey = `${CHAT_MESSAGES_PREFIX}${chatId}`;
      await AsyncStorage.removeItem(chatKey);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }

  /**
   * Update chat's last message
   */
  private static async updateChatLastMessage(
    chatId: string,
    message: StoredMessage
  ): Promise<void> {
    try {
      const chat = await this.getChat(chatId);
      if (chat) {
        chat.lastMessage = message.text || `[${message.fileType || 'File'}]`;
        chat.lastMessageTime = message.timestamp;
        await this.saveChat(chat);
      }
    } catch (error) {
      console.error('Error updating chat last message:', error);
    }
  }

  /**
   * Clear all data (for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      const chats = await this.getAllChats();
      await AsyncStorage.removeItem(CHATS_KEY);
      
      for (const chat of chats) {
        const chatKey = `${CHAT_MESSAGES_PREFIX}${chat.id}`;
        await AsyncStorage.removeItem(chatKey);
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  /**
   * Search messages in a chat
   */
  static async searchMessages(chatId: string, query: string): Promise<StoredMessage[]> {
    try {
      const messages = await this.getChatMessages(chatId);
      const lowerQuery = query.toLowerCase();
      return messages.filter(m => 
        m.text.toLowerCase().includes(lowerQuery) ||
        m.senderName.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get unread count across all chats
   */
  static async getTotalUnreadCount(): Promise<number> {
    try {
      const chats = await this.getAllChats();
      return chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
