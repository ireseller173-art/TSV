import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PersistentMessageStorage, StoredMessage, StoredChat } from '@/lib/persistent-message-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('PersistentMessageStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save a message to AsyncStorage', async () => {
      const message: StoredMessage = {
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'user1',
        senderName: 'John',
        text: 'Hello',
        timestamp: Date.now(),
        status: 'sent',
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.saveMessage(message);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle message updates', async () => {
      const message1: StoredMessage = {
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'user1',
        senderName: 'John',
        text: 'Hello',
        timestamp: Date.now(),
        status: 'sent',
      };

      const message2: StoredMessage = {
        ...message1,
        text: 'Hello Updated',
        status: 'delivered',
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify([message1]));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.saveMessage(message2);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getChatMessages', () => {
    it('should retrieve messages for a chat', async () => {
      const messages: StoredMessage[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'John',
          text: 'Hello',
          timestamp: Date.now(),
          status: 'sent',
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(messages));

      const result = await PersistentMessageStorage.getChatMessages('chat1');

      expect(result).toEqual(messages);
    });

    it('should return empty array if no messages', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const result = await PersistentMessageStorage.getChatMessages('chat1');

      expect(result).toEqual([]);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const messages: StoredMessage[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'John',
          text: 'Hello',
          timestamp: Date.now(),
          status: 'sent',
        },
        {
          id: 'msg2',
          chatId: 'chat1',
          senderId: 'user2',
          senderName: 'Jane',
          text: 'Hi',
          timestamp: Date.now(),
          status: 'sent',
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(messages));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.deleteMessage('chat1', 'msg1');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('addReaction', () => {
    it('should add a reaction to a message', async () => {
      const message: StoredMessage = {
        id: 'msg1',
        chatId: 'chat1',
        senderId: 'user1',
        senderName: 'John',
        text: 'Hello',
        timestamp: Date.now(),
        status: 'sent',
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify([message]));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.addReaction('chat1', 'msg1', '👍', 'user2');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Chat operations', () => {
    it('should save a chat', async () => {
      const chat: StoredChat = {
        id: 'chat1',
        name: 'John Doe',
        unreadCount: 0,
        isMuted: false,
        isPinned: false,
        isArchived: false,
        isGroup: false,
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.saveChat(chat);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should get all chats', async () => {
      const chats: StoredChat[] = [
        {
          id: 'chat1',
          name: 'John Doe',
          unreadCount: 0,
          isMuted: false,
          isPinned: false,
          isArchived: false,
          isGroup: false,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(chats));

      const result = await PersistentMessageStorage.getAllChats();

      expect(result).toEqual(chats);
    });

    it('should update a chat', async () => {
      const chat: StoredChat = {
        id: 'chat1',
        name: 'John Doe',
        unreadCount: 0,
        isMuted: false,
        isPinned: false,
        isArchived: false,
        isGroup: false,
      };

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify([chat]));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.updateChat('chat1', { unreadCount: 5 });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should delete a chat', async () => {
      const chats: StoredChat[] = [
        {
          id: 'chat1',
          name: 'John Doe',
          unreadCount: 0,
          isMuted: false,
          isPinned: false,
          isArchived: false,
          isGroup: false,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(chats));
      vi.mocked(AsyncStorage.removeItem).mockResolvedValueOnce(undefined);
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await PersistentMessageStorage.deleteChat('chat1');

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('searchMessages', () => {
    it('should search messages by text', async () => {
      const messages: StoredMessage[] = [
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'John',
          text: 'Hello World',
          timestamp: Date.now(),
          status: 'sent',
        },
        {
          id: 'msg2',
          chatId: 'chat1',
          senderId: 'user2',
          senderName: 'Jane',
          text: 'Hi there',
          timestamp: Date.now(),
          status: 'sent',
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(messages));

      const result = await PersistentMessageStorage.searchMessages('chat1', 'Hello');

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getTotalUnreadCount', () => {
    it('should calculate total unread count', async () => {
      const chats: StoredChat[] = [
        {
          id: 'chat1',
          name: 'John',
          unreadCount: 3,
          isMuted: false,
          isPinned: false,
          isArchived: false,
          isGroup: false,
        },
        {
          id: 'chat2',
          name: 'Jane',
          unreadCount: 2,
          isMuted: false,
          isPinned: false,
          isArchived: false,
          isGroup: false,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(chats));

      const result = await PersistentMessageStorage.getTotalUnreadCount();

      expect(result).toBe(5);
    });
  });
});
