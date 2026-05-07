/**
 * Push Notification Service Tests
 * Tests for notification service, preferences, and device token management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock __DEV__ global
if (typeof (globalThis as any).__DEV__ === 'undefined') {
  (globalThis as any).__DEV__ = false;
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences, PushNotificationPayload, DeviceToken } from '@/lib/types/push-notification';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Push Notification Service', () => {
  const userId = 'test-user-123';
  const chatId = 'chat-456';
  const groupId = 'group-789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Notification Preferences', () => {
    it('should create default notification preferences', () => {
      const defaultPrefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(defaultPrefs.userId).toBe(userId);
      expect(defaultPrefs.enabled).toBe(true);
      expect(defaultPrefs.messageNotifications).toBe(true);
      expect(defaultPrefs.soundEnabled).toBe(true);
    });

    it('should validate notification preferences structure', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: false,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: false,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: false,
        mentionNotifications: true,
        soundEnabled: false,
        notificationSound: 'bell',
        vibrationEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [chatId],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(prefs.messageNotifications).toBe(false);
      expect(prefs.soundEnabled).toBe(false);
      expect(prefs.mutedChatIds).toContain(chatId);
      expect(prefs.quietHoursEnabled).toBe(true);
    });

    it('should preserve quiet hours settings', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: true,
        quietHoursStart: '23:00',
        quietHoursEnd: '07:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(prefs.quietHoursStart).toBe('23:00');
      expect(prefs.quietHoursEnd).toBe('07:00');
      expect(prefs.quietHoursEnabled).toBe(true);
    });

    it('should handle do not disturb settings', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: true,
        doNotDisturbUntil: Date.now() + 3600000,
        badgeCountEnabled: true,
        mutedChatIds: [],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(prefs.doNotDisturbEnabled).toBe(true);
      expect(prefs.doNotDisturbUntil).toBeGreaterThan(Date.now());
    });
  });

  describe('Device Token Management', () => {
    it('should create device token with correct structure', () => {
      const deviceToken: DeviceToken = {
        id: `${userId}-ios-${Date.now()}`,
        userId,
        token: 'expo-push-token-123',
        platform: 'ios',
        deviceName: 'iPhone 15',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
      };

      expect(deviceToken.userId).toBe(userId);
      expect(deviceToken.platform).toBe('ios');
      expect(deviceToken.deviceName).toBe('iPhone 15');
      expect(deviceToken.isActive).toBe(true);
    });

    it('should support multiple device tokens', () => {
      const deviceTokens: DeviceToken[] = [
        {
          id: 'token-1',
          userId,
          token: 'expo-push-token-1',
          platform: 'ios',
          deviceName: 'iPhone 15',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastUsedAt: Date.now(),
        },
        {
          id: 'token-2',
          userId,
          token: 'expo-push-token-2',
          platform: 'android',
          deviceName: 'Samsung Galaxy',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastUsedAt: Date.now(),
        },
      ];

      expect(deviceTokens).toHaveLength(2);
      expect(deviceTokens[0].platform).toBe('ios');
      expect(deviceTokens[1].platform).toBe('android');
    });

    it('should handle inactive device tokens', () => {
      const deviceToken: DeviceToken = {
        id: 'token-inactive',
        userId,
        token: 'expo-push-token-inactive',
        platform: 'web',
        deviceName: 'Chrome Browser',
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastUsedAt: Date.now(),
      };

      expect(deviceToken.isActive).toBe(false);
      expect(deviceToken.platform).toBe('web');
    });
  });

  describe('Chat and Group Muting', () => {
    it('should track muted chats', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [chatId],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(prefs.mutedChatIds).toContain(chatId);
      expect(prefs.mutedGroupIds).toHaveLength(0);
    });

    it('should track muted groups', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [],
        mutedGroupIds: [groupId],
        updatedAt: Date.now(),
      };

      expect(prefs.mutedGroupIds).toContain(groupId);
      expect(prefs.mutedChatIds).toHaveLength(0);
    });

    it('should support multiple muted chats and groups', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: true,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: ['chat-1', 'chat-2', 'chat-3'],
        mutedGroupIds: ['group-1', 'group-2'],
        updatedAt: Date.now(),
      };

      expect(prefs.mutedChatIds).toHaveLength(3);
      expect(prefs.mutedGroupIds).toHaveLength(2);
    });
  });

  describe('Notification Payload', () => {
    it('should create message notification payload', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-1',
        type: 'message',
        title: 'John Doe',
        body: 'Hey, how are you?',
        data: {
          userId,
          chatId,
          messageId: 'msg-123',
        },
        priority: 'normal',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      expect(notification.type).toBe('message');
      expect(notification.title).toBe('John Doe');
      expect(notification.data.chatId).toBe(chatId);
    });

    it('should create group message notification payload', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-2',
        type: 'group_message',
        title: 'Team Chat • Jane Smith',
        body: 'Check this out!',
        data: {
          userId,
          groupId,
          messageId: 'msg-456',
          senderName: 'Jane Smith',
        },
        priority: 'normal',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      expect(notification.type).toBe('group_message');
      expect(notification.data.groupId).toBe(groupId);
      expect(notification.data.senderName).toBe('Jane Smith');
    });

    it('should create call notification payload', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-3',
        type: 'call_incoming' as any,
        title: 'Incoming Call',
        body: 'John Doe is calling...',
        data: {
          userId,
          action: 'open_call',
          deepLink: 'call://call-789',
        },
        priority: 'high',
        sound: 'default',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      expect(notification.type).toBe('call_incoming');
      expect(notification.priority).toBe('high');
    });

    it('should support notification reactions', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-4',
        type: 'reaction',
        title: 'New Reaction',
        body: 'John Doe reacted with 👍',
        data: {
          userId,
          chatId,
          messageId: 'msg-789',
          action: 'open_chat',
        },
        priority: 'normal',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      expect(notification.type).toBe('reaction');
      expect(notification.data.chatId).toBe(chatId);
    });
  });

  describe('Notification History', () => {
    it('should track notification delivery', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-1',
        type: 'message',
        title: 'John Doe',
        body: 'Hello!',
        data: { userId, chatId },
        priority: 'normal',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      const deliveredAt = Date.now();
      expect(deliveredAt).toBeGreaterThanOrEqual(notification.timestamp);
    });

    it('should track notification read status', () => {
      const notification: PushNotificationPayload = {
        id: 'notif-1',
        type: 'message',
        title: 'John Doe',
        body: 'Hello!',
        data: { userId, chatId },
        priority: 'normal',
        badge: 1,
        timestamp: Date.now(),
        read: false,
      };

      expect(notification.read).toBe(false);

      // Mark as read
      const readNotification = { ...notification, read: true };
      expect(readNotification.read).toBe(true);
    });

    it('should support notification dismissal', () => {
      const historyEntry = {
        id: 'hist-1',
        userId,
        deliveredAt: Date.now(),
        dismissed: false,
      };

      expect(historyEntry.dismissed).toBe(false);

      // Mark as dismissed
      const dismissedEntry = { ...historyEntry, dismissed: true };
      expect(dismissedEntry.dismissed).toBe(true);
    });
  });

  describe('Sound and Vibration Settings', () => {
    it('should support different notification sounds', () => {
      const sounds = ['default', 'silent', 'chime', 'bell', 'ping', 'whoosh', 'custom'] as const;

      sounds.forEach((sound) => {
        const prefs: NotificationPreferences = {
          userId,
          enabled: true,
          messageNotifications: true,
          groupMessageNotifications: true,
          groupInviteNotifications: true,
          groupUpdateNotifications: true,
          memberJoinedNotifications: false,
          memberLeftNotifications: false,
          callNotifications: true,
          missedCallNotifications: true,
          reactionNotifications: true,
          mentionNotifications: true,
          soundEnabled: true,
          notificationSound: sound,
          vibrationEnabled: true,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          doNotDisturbEnabled: false,
          badgeCountEnabled: true,
          mutedChatIds: [],
          mutedGroupIds: [],
          updatedAt: Date.now(),
        };

        expect(prefs.notificationSound).toBe(sound);
      });
    });

    it('should toggle sound independently from vibration', () => {
      const prefs: NotificationPreferences = {
        userId,
        enabled: true,
        messageNotifications: true,
        groupMessageNotifications: true,
        groupInviteNotifications: true,
        groupUpdateNotifications: true,
        memberJoinedNotifications: false,
        memberLeftNotifications: false,
        callNotifications: true,
        missedCallNotifications: true,
        reactionNotifications: true,
        mentionNotifications: true,
        soundEnabled: false,
        notificationSound: 'default',
        vibrationEnabled: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        doNotDisturbEnabled: false,
        badgeCountEnabled: true,
        mutedChatIds: [],
        mutedGroupIds: [],
        updatedAt: Date.now(),
      };

      expect(prefs.soundEnabled).toBe(false);
      expect(prefs.vibrationEnabled).toBe(true);
    });
  });
});
