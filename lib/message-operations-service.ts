import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from './chat-service';

const MESSAGES_KEY = 'messages';
const EDITED_MESSAGES_KEY = 'edited_messages';

export interface EditedMessage {
  messageId: string;
  originalText: string;
  editedText: string;
  editedAt: number;
  editCount: number;
}

export class MessageOperationsService {
  /**
   * Edit a message
   */
  static async editMessage(
    messageId: string,
    newText: string,
    chatId: string
  ): Promise<Message | null> {
    try {
      // Get all messages
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];

      // Find and update the message
      const messageIndex = messages.findIndex(
        (m) => m.id === messageId && m.chatId === chatId
      );

      if (messageIndex === -1) {
        console.error('Message not found');
        return null;
      }

      const originalMessage = messages[messageIndex];
      const editedMessage: Message = {
        ...originalMessage,
        text: newText,
        isEdited: true,
        editedAt: Date.now(),
      };

      messages[messageIndex] = editedMessage;

      // Save updated messages
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

      // Track edit history
      await this.trackEditHistory(messageId, originalMessage.text, newText);

      return editedMessage;
    } catch (error) {
      console.error('Error editing message:', error);
      return null;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, chatId: string): Promise<boolean> {
    try {
      // Get all messages
      const messagesJson = await AsyncStorage.getItem(MESSAGES_KEY);
      const messages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];

      // Find and remove the message
      const filteredMessages = messages.filter(
        (m) => !(m.id === messageId && m.chatId === chatId)
      );

      if (filteredMessages.length === messages.length) {
        console.error('Message not found');
        return false;
      }

      // Save updated messages
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Get edit history for a message
   */
  static async getEditHistory(messageId: string): Promise<EditedMessage[]> {
    try {
      const historyJson = await AsyncStorage.getItem(
        `${EDITED_MESSAGES_KEY}_${messageId}`
      );
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Error getting edit history:', error);
      return [];
    }
  }

  /**
   * Track edit history
   */
  private static async trackEditHistory(
    messageId: string,
    originalText: string,
    editedText: string
  ): Promise<void> {
    try {
      const history = await this.getEditHistory(messageId);

      const editCount = history.length + 1;
      const editedMessage: EditedMessage = {
        messageId,
        originalText,
        editedText,
        editedAt: Date.now(),
        editCount,
      };

      history.push(editedMessage);

      await AsyncStorage.setItem(
        `${EDITED_MESSAGES_KEY}_${messageId}`,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Error tracking edit history:', error);
    }
  }

  /**
   * Can edit message (only if sent by current user and within time limit)
   */
  static canEditMessage(message: Message, currentUserId: string): boolean {
    // Can only edit own messages
    if (message.senderId !== currentUserId) {
      return false;
    }

    // Can edit messages sent within last 24 hours
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const timeSinceSent = Date.now() - message.timestamp;

    return timeSinceSent < oneDayInMs;
  }

  /**
   * Can delete message (only if sent by current user)
   */
  static canDeleteMessage(message: Message, currentUserId: string): boolean {
    return message.senderId === currentUserId;
  }

  /**
   * Clear all edit history
   */
  static async clearEditHistory(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const editHistoryKeys = allKeys.filter((key) =>
        key.startsWith(EDITED_MESSAGES_KEY)
      );

      if (editHistoryKeys.length > 0) {
        await AsyncStorage.multiRemove(editHistoryKeys);
      }
    } catch (error) {
      console.error('Error clearing edit history:', error);
    }
  }
}
