/**
 * Badge Service Tests
 * 
 * Tests for badge counter functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBadgeCount,
  incrementUnreadMessages,
  incrementMissedCalls,
  resetUnreadMessages,
  resetMissedCalls,
  resetAllBadges,
  getUnreadCountForChat,
  incrementUnreadForChat,
  resetUnreadForChat,
  getMissedCallCountForContact,
  incrementMissedCallsForContact,
  resetMissedCallsForContact,
} from '../lib/badge-service';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Mock Notifications
vi.mock('expo-notifications', () => ({
  setBadgeCountAsync: vi.fn(),
}));

describe('Badge Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBadgeCount', () => {
    it('should return default badge count when no data stored', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const count = await getBadgeCount();
      expect(count).toEqual({ unreadMessages: 0, missedCalls: 0, total: 0 });
    });

    it('should return stored badge count', async () => {
      const storedCount = { unreadMessages: 5, missedCalls: 2, total: 7 };
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(storedCount));
      const count = await getBadgeCount();
      expect(count).toEqual(storedCount);
    });
  });

  describe('incrementUnreadMessages', () => {
    it('should increment unread messages by 1', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await incrementUnreadMessages(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"unreadMessages":6')
      );
    });

    it('should increment unread messages by specified count', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await incrementUnreadMessages(3);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"unreadMessages":8')
      );
    });
  });

  describe('incrementMissedCalls', () => {
    it('should increment missed calls by 1', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await incrementMissedCalls(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"missedCalls":3')
      );
    });

    it('should increment missed calls by specified count', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await incrementMissedCalls(2);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"missedCalls":4')
      );
    });
  });

  describe('resetUnreadMessages', () => {
    it('should reset unread messages to 0', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await resetUnreadMessages();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"unreadMessages":0')
      );
    });
  });

  describe('resetMissedCalls', () => {
    it('should reset missed calls to 0', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(
        JSON.stringify({ unreadMessages: 5, missedCalls: 2, total: 7 })
      );
      await resetMissedCalls();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"missedCalls":0')
      );
    });
  });

  describe('resetAllBadges', () => {
    it('should reset all counters to 0', async () => {
      await resetAllBadges();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"unreadMessages":0')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"missedCalls":0')
      );
    });
  });

  describe('Chat-specific counters', () => {
    it('should get unread count for chat', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue('5');
      const count = await getUnreadCountForChat('chat123');
      expect(count).toBe(5);
    });

    it('should increment unread count for chat', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue('5');
      await incrementUnreadForChat('chat123', 2);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'unread_chat_chat123',
        '7'
      );
    });

    it('should reset unread count for chat', async () => {
      await resetUnreadForChat('chat123');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('unread_chat_chat123');
    });
  });

  describe('Contact-specific missed call counters', () => {
    it('should get missed call count for contact', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue('3');
      const count = await getMissedCallCountForContact('contact123');
      expect(count).toBe(3);
    });

    it('should increment missed call count for contact', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue('3');
      await incrementMissedCallsForContact('contact123', 1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'missed_calls_contact123',
        '4'
      );
    });

    it('should reset missed call count for contact', async () => {
      await resetMissedCallsForContact('contact123');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('missed_calls_contact123');
    });
  });
});
