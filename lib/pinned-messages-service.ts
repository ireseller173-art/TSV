import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Message } from './chat-service';

export interface PinnedMessage {
  messageId: string;
  chatId: string;
  message: Message;
  pinnedAt: number;
  pinnedBy: string;
}

const PINNED_MESSAGES_KEY = 'pinned_messages';

export class PinnedMessagesService {
  /**
   * Pin a message
   */
  static async pinMessage(
    messageId: string,
    chatId: string,
    message: Message,
    userId: string
  ): Promise<PinnedMessage | null> {
    try {
      const pinnedMessage: PinnedMessage = {
        messageId,
        chatId,
        message,
        pinnedAt: Date.now(),
        pinnedBy: userId,
      };

      // Save to AsyncStorage
      const pinnedMessages = await this.getPinnedMessages(chatId);
      if (!pinnedMessages.find((pm) => pm.messageId === messageId)) {
        pinnedMessages.push(pinnedMessage);
        await AsyncStorage.setItem(
          `${PINNED_MESSAGES_KEY}_${chatId}`,
          JSON.stringify(pinnedMessages)
        );
      }

      // Save to Firebase
      try {
        const db = getFirestore();
        const pinnedRef = doc(db, `chats/${chatId}/pinnedMessages`, messageId);
        await setDoc(pinnedRef, pinnedMessage);
      } catch (firebaseError) {
        console.warn('Firebase pin failed, using local storage:', firebaseError);
      }

      return pinnedMessage;
    } catch (error) {
      console.error('Error pinning message:', error);
      return null;
    }
  }

  /**
   * Unpin a message
   */
  static async unpinMessage(messageId: string, chatId: string): Promise<boolean> {
    try {
      // Remove from AsyncStorage
      const pinnedMessages = await this.getPinnedMessages(chatId);
      const filtered = pinnedMessages.filter((pm) => pm.messageId !== messageId);
      await AsyncStorage.setItem(
        `${PINNED_MESSAGES_KEY}_${chatId}`,
        JSON.stringify(filtered)
      );

      // Remove from Firebase
      try {
        const db = getFirestore();
        const pinnedRef = doc(db, `chats/${chatId}/pinnedMessages`, messageId);
        await deleteDoc(pinnedRef);
      } catch (firebaseError) {
        console.warn('Firebase unpin failed, using local storage:', firebaseError);
      }

      return true;
    } catch (error) {
      console.error('Error unpinning message:', error);
      return false;
    }
  }

  /**
   * Get pinned messages for a chat
   */
  static async getPinnedMessages(chatId: string): Promise<PinnedMessage[]> {
    try {
      // Try Firebase first
      try {
        const db = getFirestore();
        const pinnedRef = collection(db, `chats/${chatId}/pinnedMessages`);
        const snapshot = await getDocs(pinnedRef);
        const pinnedMessages: PinnedMessage[] = [];
        snapshot.forEach((doc) => {
          pinnedMessages.push(doc.data() as PinnedMessage);
        });
        
        if (pinnedMessages.length > 0) {
          // Cache in AsyncStorage
          await AsyncStorage.setItem(
            `${PINNED_MESSAGES_KEY}_${chatId}`,
            JSON.stringify(pinnedMessages)
          );
          return pinnedMessages;
        }
      } catch (firebaseError) {
        console.warn('Firebase get pinned failed, using local storage:', firebaseError);
      }

      // Fall back to AsyncStorage
      const pinnedJson = await AsyncStorage.getItem(`${PINNED_MESSAGES_KEY}_${chatId}`);
      return pinnedJson ? JSON.parse(pinnedJson) : [];
    } catch (error) {
      console.error('Error getting pinned messages:', error);
      return [];
    }
  }

  /**
   * Check if a message is pinned
   */
  static async isMessagePinned(messageId: string, chatId: string): Promise<boolean> {
    try {
      const pinnedMessages = await this.getPinnedMessages(chatId);
      return pinnedMessages.some((pm) => pm.messageId === messageId);
    } catch (error) {
      console.error('Error checking if message is pinned:', error);
      return false;
    }
  }

  /**
   * Get pinned message count for a chat
   */
  static async getPinnedMessageCount(chatId: string): Promise<number> {
    try {
      const pinnedMessages = await this.getPinnedMessages(chatId);
      return pinnedMessages.length;
    } catch (error) {
      console.error('Error getting pinned message count:', error);
      return 0;
    }
  }

  /**
   * Clear all pinned messages for a chat
   */
  static async clearPinnedMessages(chatId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(`${PINNED_MESSAGES_KEY}_${chatId}`);
      return true;
    } catch (error) {
      console.error('Error clearing pinned messages:', error);
      return false;
    }
  }

  /**
   * Reorder pinned messages
   */
  static async reorderPinnedMessages(
    chatId: string,
    messageIds: string[]
  ): Promise<boolean> {
    try {
      const pinnedMessages = await this.getPinnedMessages(chatId);
      const reordered = messageIds
        .map((id) => pinnedMessages.find((pm) => pm.messageId === id))
        .filter((pm) => pm !== undefined) as PinnedMessage[];

      await AsyncStorage.setItem(
        `${PINNED_MESSAGES_KEY}_${chatId}`,
        JSON.stringify(reordered)
      );

      return true;
    } catch (error) {
      console.error('Error reordering pinned messages:', error);
      return false;
    }
  }
}
