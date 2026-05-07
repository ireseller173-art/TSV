import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  registerDeviceToken,
  muteChatNotifications,
  unmuteChatNotifications,
  muteGroupNotifications,
  unmuteGroupNotifications,
} from './push-notification-service';
import { NotificationPreferences } from './types/push-notification';

/**
 * Notification types for different events
 */
export type NotificationType = 'message' | 'call' | 'call_missed' | 'call_ended' | 'reaction' | 'group_message';

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  sound?: string;
  badge?: number;
}

/**
 * Notification context type
 */
interface NotificationContextType {
  expoPushToken: string | null;
  preferences: NotificationPreferences | null;
  sendMessageNotification: (senderName: string, messagePreview: string, chatId: string, senderId: string) => Promise<void>;
  sendGroupMessageNotification: (groupName: string, senderName: string, messagePreview: string, groupId: string, senderId: string) => Promise<void>;
  sendIncomingCallNotification: (callerName: string, callerId: string, callId: string) => Promise<void>;
  sendMissedCallNotification: (callerName: string, callerId: string) => Promise<void>;
  sendCallEndedNotification: (callerName: string, duration: number) => Promise<void>;
  sendReactionNotification: (senderName: string, emoji: string, chatId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  setBadgeCount: (count: number) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  muteChatNotifications: (chatId: string) => Promise<void>;
  unmuteChatNotifications: (chatId: string) => Promise<void>;
  muteGroupNotifications: (groupId: string) => Promise<void>;
  unmuteGroupNotifications: (groupId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Notification Provider Component
 */
export function NotificationProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    // Initialize notifications
    initializeNotifications();
  }, []);

  useEffect(() => {
    // Load preferences when userId changes
    if (userId) {
      loadPreferences(userId);
      registerToken(userId);
    }
  }, [userId]);

  const initializeNotifications = async () => {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log('Notification received:', notification);
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        } as any;
      },
    });

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationTap(response.notification);
    });

    // Request permissions and get token
    const token = await requestNotificationPermissions();
    if (token) {
      setExpoPushToken(token);
    }

    return subscription;
  };

  const registerToken = async (currentUserId: string) => {
    try {
      await registerDeviceToken(currentUserId);
      console.log('[NotificationProvider] Device token registered');
    } catch (error) {
      console.error('[NotificationProvider] Failed to register device token:', error);
    }
  };

  const loadPreferences = async (currentUserId: string) => {
    try {
      const prefs = await getNotificationPreferences(currentUserId);
      setPreferences(prefs);
      console.log('[NotificationProvider] Preferences loaded');
    } catch (error) {
      console.error('[NotificationProvider] Failed to load preferences:', error);
    }
  };

  const requestNotificationPermissions = async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  };

  const sendLocalNotification = async (payload: NotificationPayload) => {
    try {
      // Check if notifications are enabled for this type
      if (!preferences?.enabled) {
        console.log('[NotificationProvider] Notifications disabled globally');
        return;
      }

      // Check notification type preferences
      if (payload.type === 'message' && !preferences?.messageNotifications) {
        console.log('[NotificationProvider] Message notifications disabled');
        return;
      }

      if (payload.type === 'group_message' && !preferences?.groupMessageNotifications) {
        console.log('[NotificationProvider] Group message notifications disabled');
        return;
      }

      if (payload.type === 'call' && !preferences?.callNotifications) {
        console.log('[NotificationProvider] Call notifications disabled');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          sound: preferences?.soundEnabled ? (payload.sound || 'default') : undefined,
          badge: preferences?.badgeCountEnabled ? (payload.badge || 1) : undefined,
          data: {
            type: payload.type,
            ...payload.data,
          },
        },
        trigger: { type: 'time', seconds: 1 } as any,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const sendMessageNotification = async (
    senderName: string,
    messagePreview: string,
    chatId: string,
    senderId: string
  ) => {
    return sendLocalNotification({
      type: 'message',
      title: senderName,
      body: messagePreview,
      data: {
        chatId,
        senderId,
        action: 'open_chat',
      },
      sound: 'default',
      badge: 1,
    });
  };

  const sendGroupMessageNotification = async (
    groupName: string,
    senderName: string,
    messagePreview: string,
    groupId: string,
    senderId: string
  ) => {
    return sendLocalNotification({
      type: 'group_message',
      title: `${groupName} • ${senderName}`,
      body: messagePreview,
      data: {
        groupId,
        senderId,
        action: 'open_group',
      },
      sound: 'default',
      badge: 1,
    });
  };

  const sendIncomingCallNotification = async (
    callerName: string,
    callerId: string,
    callId: string
  ) => {
    return sendLocalNotification({
      type: 'call',
      title: 'Incoming Call',
      body: `${callerName} is calling...`,
      data: {
        callId,
        callerId,
        action: 'open_call',
      },
      sound: 'call_ringtone',
      badge: 1,
    });
  };

  const sendMissedCallNotification = async (callerName: string, callerId: string) => {
    return sendLocalNotification({
      type: 'call_missed',
      title: 'Missed Call',
      body: `You missed a call from ${callerName}`,
      data: {
        callerId,
        action: 'open_call_history',
      },
      sound: 'default',
      badge: 1,
    });
  };

  const sendCallEndedNotification = async (callerName: string, duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return sendLocalNotification({
      type: 'call_ended',
      title: 'Call Ended',
      body: `Call with ${callerName} ended (${durationStr})`,
      data: {
        action: 'open_call_history',
      },
      sound: 'default',
      badge: 1,
    });
  };

  const sendReactionNotification = async (
    senderName: string,
    emoji: string,
    chatId: string
  ) => {
    return sendLocalNotification({
      type: 'reaction',
      title: 'New Reaction',
      body: `${senderName} reacted with ${emoji}`,
      data: {
        chatId,
        action: 'open_chat',
      },
      sound: 'default',
      badge: 1,
    });
  };

  const handleNotificationTap = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    const action = data.action as string;

    console.log('Notification tapped:', action, data);

    // Route to appropriate screen based on action
    switch (action) {
      case 'open_chat':
        console.log('Navigate to chat:', data.chatId);
        break;
      case 'open_group':
        console.log('Navigate to group:', data.groupId);
        break;
      case 'open_call':
        console.log('Navigate to call:', data.callId);
        break;
      case 'open_call_history':
        console.log('Navigate to call history');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.setBadgeCountAsync(count);
      }
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const updatePreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!preferences) {
      throw new Error('Preferences not initialized');
    }

    try {
      const updated = await updateNotificationPreferences(preferences.userId, prefs);
      setPreferences(updated);
      console.log('[NotificationProvider] Preferences updated');
    } catch (error) {
      console.error('[NotificationProvider] Failed to update preferences:', error);
      throw error;
    }
  };

  const handleMuteChatNotifications = async (chatId: string) => {
    if (!preferences) {
      throw new Error('Preferences not initialized');
    }

    try {
      await muteChatNotifications(preferences.userId, chatId);
      const updated = await getNotificationPreferences(preferences.userId);
      setPreferences(updated);
    } catch (error) {
      console.error('[NotificationProvider] Failed to mute chat:', error);
      throw error;
    }
  };

  const handleUnmuteChatNotifications = async (chatId: string) => {
    if (!preferences) {
      throw new Error('Preferences not initialized');
    }

    try {
      await unmuteChatNotifications(preferences.userId, chatId);
      const updated = await getNotificationPreferences(preferences.userId);
      setPreferences(updated);
    } catch (error) {
      console.error('[NotificationProvider] Failed to unmute chat:', error);
      throw error;
    }
  };

  const handleMuteGroupNotifications = async (groupId: string) => {
    if (!preferences) {
      throw new Error('Preferences not initialized');
    }

    try {
      await muteGroupNotifications(preferences.userId, groupId);
      const updated = await getNotificationPreferences(preferences.userId);
      setPreferences(updated);
    } catch (error) {
      console.error('[NotificationProvider] Failed to mute group:', error);
      throw error;
    }
  };

  const handleUnmuteGroupNotifications = async (groupId: string) => {
    if (!preferences) {
      throw new Error('Preferences not initialized');
    }

    try {
      await unmuteGroupNotifications(preferences.userId, groupId);
      const updated = await getNotificationPreferences(preferences.userId);
      setPreferences(updated);
    } catch (error) {
      console.error('[NotificationProvider] Failed to unmute group:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    preferences,
    sendMessageNotification,
    sendGroupMessageNotification,
    sendIncomingCallNotification,
    sendMissedCallNotification,
    sendCallEndedNotification,
    sendReactionNotification,
    clearAllNotifications,
    setBadgeCount,
    updatePreferences,
    muteChatNotifications: handleMuteChatNotifications,
    unmuteChatNotifications: handleUnmuteChatNotifications,
    muteGroupNotifications: handleMuteGroupNotifications,
    unmuteGroupNotifications: handleUnmuteGroupNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
