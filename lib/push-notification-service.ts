/**
 * Push Notification Service
 * Handles push notifications, device tokens, and notification preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  PushNotificationPayload,
  DeviceToken,
  NotificationPreferences,
  NotificationHistoryEntry,
  ChatNotificationSettings,
  NotificationPermissionStatus,
  NotificationPermissionResult,
} from './types/push-notification';

const DEVICE_TOKENS_KEY = '@tsv_keeper_device_tokens';
const NOTIFICATION_PREFS_KEY = '@tsv_keeper_notification_prefs';
const NOTIFICATION_HISTORY_KEY = '@tsv_keeper_notification_history';
const CHAT_NOTIFICATION_SETTINGS_KEY = '@tsv_keeper_chat_notification_settings';

/**
 * Configure notification handler
 */
export async function configureNotifications(): Promise<void> {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    },
  });

  // Request permissions
  await requestNotificationPermissions();
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermissions(): Promise<NotificationPermissionResult> {
  try {

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: false,
      },
    });

    const statusMap: Record<string, NotificationPermissionStatus> = {
      granted: 'granted',
      denied: 'denied',
      default: 'default',
      provisional: 'provisional',
    };

    const permissionStatus = statusMap[status] || 'default';


    return {
      status: permissionStatus,
      message: `Notifications ${permissionStatus}`,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get device push token
 */
export async function getDevicePushToken(): Promise<string | null> {
  try {

    // For web, we can't get a real push token
    if (Platform.OS === 'web') {
      return `web-${Date.now()}`;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    return token;
  } catch (error) {
    return null;
  }
}

/**
 * Register device token
 */
export async function registerDeviceToken(
  userId: string,
  deviceName: string = 'Unknown Device'
): Promise<DeviceToken> {
  try {

    const token = await getDevicePushToken();
    if (!token) {
      throw new Error('Failed to get device push token');
    }

    const deviceToken: DeviceToken = {
      id: `${userId}-${Platform.OS}-${Date.now()}`,
      userId,
      token,
      platform: Platform.OS as 'ios' | 'android' | 'web',
      deviceName,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    // Store device token
    const tokens = await getDeviceTokens(userId);
    tokens.push(deviceToken);
    await AsyncStorage.setItem(
      `${DEVICE_TOKENS_KEY}_${userId}`,
      JSON.stringify(tokens)
    );

    return deviceToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all device tokens for a user
 */
export async function getDeviceTokens(userId: string): Promise<DeviceToken[]> {
  try {
    const data = await AsyncStorage.getItem(`${DEVICE_TOKENS_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Remove device token
 */
export async function removeDeviceToken(userId: string, tokenId: string): Promise<void> {
  try {
    const tokens = await getDeviceTokens(userId);
    const filtered = tokens.filter((t) => t.id !== tokenId);
    await AsyncStorage.setItem(
      `${DEVICE_TOKENS_KEY}_${userId}`,
      JSON.stringify(filtered)
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Get notification preferences for user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  try {
    const data = await AsyncStorage.getItem(`${NOTIFICATION_PREFS_KEY}_${userId}`);

    if (data) {
      return JSON.parse(data);
    }

    // Return default preferences
    return getDefaultNotificationPreferences(userId);
  } catch (error) {
    return getDefaultNotificationPreferences(userId);
  }
}

/**
 * Get default notification preferences
 */
function getDefaultNotificationPreferences(userId: string): NotificationPreferences {
  return {
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
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const current = await getNotificationPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...preferences,
      userId,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      `${NOTIFICATION_PREFS_KEY}_${userId}`,
      JSON.stringify(updated)
    );

    return updated;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if notifications are enabled for a chat/group
 */
export async function isNotificationEnabledForChat(
  userId: string,
  chatId?: string,
  groupId?: string
): Promise<boolean> {
  try {
    const prefs = await getNotificationPreferences(userId);

    // Check if globally disabled
    if (!prefs.enabled) {
      return false;
    }

    // Check if muted
    if (chatId && prefs.mutedChatIds.includes(chatId)) {
      return false;
    }
    if (groupId && prefs.mutedGroupIds.includes(groupId)) {
      return false;
    }

    // Check quiet hours
    if (prefs.quietHoursEnabled && isInQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd)) {
      return false;
    }

    // Check do not disturb
    if (prefs.doNotDisturbEnabled && prefs.doNotDisturbUntil && prefs.doNotDisturbUntil > Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if current time is within quiet hours
 */
function isInQuietHours(startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime < endTime;
  }
}

/**
 * Send local notification
 */
export async function sendLocalNotification(
  notification: PushNotificationPayload
): Promise<string> {
  try {

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        badge: notification.badge,
        sound: notification.sound !== 'silent' ? notification.sound : undefined,
        data: notification.data,
      },
      trigger: null,
    });

    // Store in history
    await addNotificationToHistory(notification);

    return notificationId;
  } catch (error) {
    throw error;
  }
}

/**
 * Add notification to history
 */
export async function addNotificationToHistory(
  notification: PushNotificationPayload
): Promise<void> {
  try {
    const history = await getNotificationHistory(notification.data.userId || '');

    const entry: NotificationHistoryEntry = {
      id: `${notification.id}-${Date.now()}`,
      userId: notification.data.userId || '',
      notification,
      deliveredAt: Date.now(),
      dismissed: false,
    };

    history.push(entry);

    // Keep only last 100 notifications
    const limited = history.slice(-100);

    await AsyncStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${notification.data.userId}`,
      JSON.stringify(limited)
    );
  } catch (error) {
  }
}

/**
 * Get notification history for user
 */
export async function getNotificationHistory(userId: string): Promise<NotificationHistoryEntry[]> {
  try {
    const data = await AsyncStorage.getItem(`${NOTIFICATION_HISTORY_KEY}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    const history = await getNotificationHistory(userId);

    const entry = history.find((h) => h.id === notificationId);
    if (entry) {
      entry.readAt = Date.now();
      await AsyncStorage.setItem(
        `${NOTIFICATION_HISTORY_KEY}_${userId}`,
        JSON.stringify(history)
      );
    }
  } catch (error) {
  }
}

/**
 * Mute notifications for a chat
 */
export async function muteChatNotifications(
  userId: string,
  chatId: string,
  muteUntil?: number
): Promise<void> {
  try {
    const prefs = await getNotificationPreferences(userId);

    if (!prefs.mutedChatIds.includes(chatId)) {
      prefs.mutedChatIds.push(chatId);
    }

    await updateNotificationPreferences(userId, prefs);
  } catch (error) {
    throw error;
  }
}

/**
 * Unmute notifications for a chat
 */
export async function unmuteChatNotifications(
  userId: string,
  chatId: string
): Promise<void> {
  try {
    const prefs = await getNotificationPreferences(userId);
    prefs.mutedChatIds = prefs.mutedChatIds.filter((id) => id !== chatId);

    await updateNotificationPreferences(userId, prefs);
  } catch (error) {
    throw error;
  }
}

/**
 * Mute notifications for a group
 */
export async function muteGroupNotifications(
  userId: string,
  groupId: string,
  muteUntil?: number
): Promise<void> {
  try {
    const prefs = await getNotificationPreferences(userId);

    if (!prefs.mutedGroupIds.includes(groupId)) {
      prefs.mutedGroupIds.push(groupId);
    }

    await updateNotificationPreferences(userId, prefs);
  } catch (error) {
    throw error;
  }
}

/**
 * Unmute notifications for a group
 */
export async function unmuteGroupNotifications(
  userId: string,
  groupId: string
): Promise<void> {
  try {
    const prefs = await getNotificationPreferences(userId);
    prefs.mutedGroupIds = prefs.mutedGroupIds.filter((id) => id !== groupId);

    await updateNotificationPreferences(userId, prefs);
  } catch (error) {
    throw error;
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    throw error;
  }
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await Notifications.setBadgeCountAsync(count);
    }
  } catch (error) {
  }
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    if (Platform.OS !== 'web') {
      return await Notifications.getBadgeCountAsync();
    }
    return 0;
  } catch (error) {
    return 0;
  }
}
