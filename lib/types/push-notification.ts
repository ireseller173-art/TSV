/**
 * Push Notification Types
 * Defines all types and interfaces for push notification system
 */

/**
 * Types of push notifications
 */
export type NotificationType = 
  | 'message'           // New message in chat
  | 'group_message'     // New message in group chat
  | 'group_invite'      // Invited to group
  | 'group_update'      // Group info updated
  | 'member_joined'     // Member joined group
  | 'member_left'       // Member left group
  | 'call_incoming'     // Incoming call
  | 'call_missed'       // Missed call
  | 'reaction'          // Message reaction
  | 'mention'           // User mentioned
  | 'system';           // System notification

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * Notification sound options
 */
export type NotificationSound = 
  | 'default'
  | 'silent'
  | 'chime'
  | 'bell'
  | 'ping'
  | 'whoosh'
  | 'custom';

/**
 * Push notification payload
 */
export interface PushNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    chatId?: string;
    groupId?: string;
    userId?: string;
    messageId?: string;
    senderName?: string;
    senderAvatar?: string;
    action?: string;
    deepLink?: string;
  };
  priority: NotificationPriority;
  badge?: number;
  sound?: NotificationSound;
  timestamp: number;
  read: boolean;
}

/**
 * Device token information
 */
export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number;
}

/**
 * Notification preferences for a user
 */
export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  
  // Message notifications
  messageNotifications: boolean;
  groupMessageNotifications: boolean;
  
  // Group notifications
  groupInviteNotifications: boolean;
  groupUpdateNotifications: boolean;
  memberJoinedNotifications: boolean;
  memberLeftNotifications: boolean;
  
  // Call notifications
  callNotifications: boolean;
  missedCallNotifications: boolean;
  
  // Interaction notifications
  reactionNotifications: boolean;
  mentionNotifications: boolean;
  
  // Sound and vibration
  soundEnabled: boolean;
  notificationSound: NotificationSound;
  vibrationEnabled: boolean;
  
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string;   // HH:mm format
  
  // Do not disturb
  doNotDisturbEnabled: boolean;
  doNotDisturbUntil?: number;
  
  // Badge count
  badgeCountEnabled: boolean;
  
  // Muted chats/groups
  mutedChatIds: string[];
  mutedGroupIds: string[];
  
  // Updated at
  updatedAt: number;
}

/**
 * Notification history entry
 */
export interface NotificationHistoryEntry {
  id: string;
  userId: string;
  notification: PushNotificationPayload;
  deliveredAt: number;
  readAt?: number;
  actionTaken?: string;
  dismissed: boolean;
}

/**
 * Notification settings for a specific chat/group
 */
export interface ChatNotificationSettings {
  chatId?: string;
  groupId?: string;
  userId: string;
  isMuted: boolean;
  muteUntil?: number;
  customSound?: NotificationSound;
  customVibration?: boolean;
  showPreview: boolean;
  updatedAt: number;
}

/**
 * Notification response when user interacts with notification
 */
export interface NotificationResponse {
  notificationId: string;
  action: 'opened' | 'dismissed' | 'replied';
  reply?: string;
  timestamp: number;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  userId: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalDismissed: number;
  averageReadTime: number; // in milliseconds
  lastNotificationTime?: number;
  updatedAt: number;
}

/**
 * Notification permission status
 */
export type NotificationPermissionStatus = 
  | 'granted'
  | 'denied'
  | 'default'
  | 'provisional';

/**
 * Notification permission request result
 */
export interface NotificationPermissionResult {
  status: NotificationPermissionStatus;
  message: string;
  timestamp: number;
}

/**
 * Scheduled notification
 */
export interface ScheduledNotification {
  id: string;
  userId: string;
  payload: PushNotificationPayload;
  scheduledFor: number;
  sent: boolean;
  sentAt?: number;
  createdAt: number;
}

/**
 * Notification template for different scenarios
 */
export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  priority: NotificationPriority;
  sound?: NotificationSound;
  badge?: boolean;
}

/**
 * Notification group for grouping similar notifications
 */
export interface NotificationGroup {
  id: string;
  userId: string;
  type: NotificationType;
  chatId?: string;
  groupId?: string;
  notifications: PushNotificationPayload[];
  count: number;
  lastNotificationTime: number;
  dismissed: boolean;
}
