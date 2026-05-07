# Push Notifications Implementation Guide

Comprehensive guide for implementing push notifications in TSV Keeper for group chats and direct messages.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Setup Instructions](#setup-instructions)
5. [Usage Examples](#usage-examples)
6. [Firebase Integration](#firebase-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The push notification system in TSV Keeper provides:

- **Device Token Management**: Register and manage push tokens for multiple devices
- **Notification Preferences**: Granular control over notification types and settings
- **Smart Muting**: Mute notifications for specific chats or groups
- **Quiet Hours**: Automatic muting during specified time ranges
- **Do Not Disturb**: Temporary notification suppression
- **Notification History**: Track delivered and read notifications
- **Sound & Vibration**: Customizable audio and haptic feedback
- **Badge Counts**: App icon badge management

---

## Architecture

### Core Services

```
lib/
├── types/
│   └── push-notification.ts       # Type definitions
├── push-notification-service.ts   # Core service logic
├── notification-provider.tsx      # React context provider
└── components/
    └── notification-preferences-screen.tsx  # UI component
```

### Data Flow

```
User Action
    ↓
NotificationProvider (Context)
    ↓
push-notification-service (Logic)
    ↓
AsyncStorage (Local Persistence)
    ↓
Firebase (Cloud Sync - optional)
    ↓
Expo Notifications (Device Delivery)
```

---

## Components

### 1. Push Notification Types

**File**: `lib/types/push-notification.ts`

Defines all notification-related types:

- `NotificationType`: Message, group message, call, reaction, etc.
- `NotificationPreferences`: User notification settings
- `DeviceToken`: Device registration information
- `PushNotificationPayload`: Notification content structure
- `NotificationHistoryEntry`: Delivered notification tracking

### 2. Push Notification Service

**File**: `lib/push-notification-service.ts`

Core service providing:

- **Device Token Management**
  - `registerDeviceToken()` - Register new device
  - `getDeviceTokens()` - Get all tokens for user
  - `removeDeviceToken()` - Remove device token

- **Preferences Management**
  - `getNotificationPreferences()` - Load user preferences
  - `updateNotificationPreferences()` - Save preferences
  - `getDefaultNotificationPreferences()` - Get defaults

- **Notification Control**
  - `sendLocalNotification()` - Send notification
  - `muteChatNotifications()` - Mute specific chat
  - `muteGroupNotifications()` - Mute specific group
  - `clearAllNotifications()` - Clear all notifications
  - `setBadgeCount()` - Update app badge

- **History & Tracking**
  - `addNotificationToHistory()` - Log notification
  - `getNotificationHistory()` - Retrieve history
  - `markNotificationAsRead()` - Mark as read

### 3. Notification Provider

**File**: `lib/notification-provider.tsx`

React context provider that:

- Initializes notification system on app launch
- Manages notification permissions
- Handles notification responses (taps)
- Provides hooks for components to use notifications
- Integrates with device token registration

### 4. Notification Preferences Screen

**File**: `components/notification-preferences-screen.tsx`

UI component for users to:

- Enable/disable notifications globally
- Configure notification types (messages, calls, groups, etc.)
- Set sound and vibration preferences
- Configure quiet hours
- Enable do not disturb mode
- Manage badge count display

---

## Setup Instructions

### 1. Initialize Notifications in App

**File**: `app/_layout.tsx`

```tsx
import { NotificationProvider } from '@/lib/notification-provider';
import { useAuth } from '@/hooks/use-auth';

export default function RootLayout() {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id}>
      {/* Rest of app */}
    </NotificationProvider>
  );
}
```

### 2. Configure Expo Notifications

**File**: `app.config.ts`

Notifications are already configured in the template:

```ts
plugins: [
  [
    "expo-notifications",
    {
      icon: "./assets/images/notification-icon.png",
      color: "#ffffff",
      sounds: ["default"],
    },
  ],
]
```

### 3. Request Permissions

Permissions are automatically requested when the app starts:

```tsx
// In NotificationProvider
const { status } = await Notifications.requestPermissionsAsync({
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
  },
});
```

### 4. Handle Notification Responses

**File**: `lib/notification-provider.tsx`

Automatically handles when users tap notifications:

```tsx
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  // Navigate based on action
  if (data.action === 'open_chat') {
    // Navigate to chat
  }
});
```

---

## Usage Examples

### Send a Message Notification

```tsx
import { useNotifications } from '@/lib/notification-provider';

export function ChatScreen() {
  const { sendMessageNotification } = useNotifications();

  const handleNewMessage = async (message) => {
    await sendMessageNotification(
      'John Doe',           // Sender name
      message.text,         // Message preview
      chatId,              // Chat ID
      message.senderId     // Sender ID
    );
  };

  return (/* ... */);
}
```

### Send a Group Message Notification

```tsx
const { sendGroupMessageNotification } = useNotifications();

await sendGroupMessageNotification(
  'Team Chat',           // Group name
  'Jane Smith',          // Sender name
  'Check this out!',     // Message preview
  groupId,              // Group ID
  senderId              // Sender ID
);
```

### Update Notification Preferences

```tsx
const { updatePreferences } = useNotifications();

// Disable message notifications
await updatePreferences({
  messageNotifications: false,
});

// Enable quiet hours
await updatePreferences({
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

### Mute Notifications for a Chat

```tsx
const { muteChatNotifications } = useNotifications();

await muteChatNotifications(chatId);
```

### Mute Notifications for a Group

```tsx
const { muteGroupNotifications } = useNotifications();

await muteGroupNotifications(groupId);
```

### Update Badge Count

```tsx
const { updateBadgeCount } = useNotifications();

// Set badge to 5
await updateBadgeCount(5);

// Clear badge
await updateBadgeCount(0);
```

---

## Firebase Integration

### 1. Store Device Tokens in Firebase

**Firestore Collection**: `users/{userId}/deviceTokens`

```json
{
  "id": "token-1",
  "token": "expo-push-token-xxx",
  "platform": "ios",
  "deviceName": "iPhone 15",
  "isActive": true,
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "lastUsedAt": 1234567890
}
```

### 2. Store Notification Preferences in Firebase

**Firestore Collection**: `users/{userId}/notificationPreferences`

```json
{
  "enabled": true,
  "messageNotifications": true,
  "groupMessageNotifications": true,
  "soundEnabled": true,
  "vibrationEnabled": true,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "mutedChatIds": ["chat-1", "chat-2"],
  "mutedGroupIds": ["group-1"],
  "updatedAt": 1234567890
}
```

### 3. Cloud Function for Sending Notifications

**File**: `server/functions/send-notification.ts`

```typescript
import * as admin from 'firebase-admin';

export async function sendNotificationToUser(
  userId: string,
  notification: {
    title: string;
    body: string;
    data: Record<string, string>;
  }
) {
  // Get user's device tokens
  const tokensSnapshot = await admin
    .firestore()
    .collection('users')
    .doc(userId)
    .collection('deviceTokens')
    .where('isActive', '==', true)
    .get();

  const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

  if (tokens.length === 0) {
    console.log('No active device tokens for user:', userId);
    return;
  }

  // Send notification
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    tokens: tokens,
  };

  const response = await admin.messaging().sendMulticast(message);

  console.log(`Sent ${response.successCount} notifications`);
  console.log(`Failed ${response.failureCount} notifications`);

  // Handle failed tokens
  response.responses.forEach((resp, index) => {
    if (!resp.success) {
      console.error(`Failed to send to token ${tokens[index]}:`, resp.error);
      // Mark token as inactive
      // TODO: Update token status in Firestore
    }
  });
}
```

### 4. Trigger Notifications on Message

**File**: `server/functions/on-message-created.ts`

```typescript
import * as functions from 'firebase-functions';
import { sendNotificationToUser } from './send-notification';

export const onMessageCreated = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;

    // Get chat participants
    const chatDoc = await admin
      .firestore()
      .collection('chats')
      .doc(chatId)
      .get();

    const participants = chatDoc.data()?.participants || [];

    // Send notification to each participant (except sender)
    for (const participantId of participants) {
      if (participantId !== message.senderId) {
        await sendNotificationToUser(participantId, {
          title: message.senderName,
          body: message.text,
          data: {
            chatId,
            messageId: snap.id,
            senderId: message.senderId,
            action: 'open_chat',
          },
        });
      }
    }
  });
```

---

## Testing

### Run Unit Tests

```bash
pnpm test __tests__/push-notification-service.test.ts
```

### Test Coverage

The test suite includes 19 tests covering:

- Notification preferences (creation, retrieval, updates)
- Device token management (registration, retrieval, removal)
- Chat and group muting
- Notification history tracking
- Sound and vibration settings
- Quiet hours and do not disturb
- Notification payload creation

### Manual Testing

1. **Test Permission Request**
   - Launch app
   - Check if permission dialog appears
   - Grant permissions

2. **Test Local Notification**
   - Send test notification from console
   - Verify notification appears on device

3. **Test Preferences**
   - Open notification preferences screen
   - Toggle various settings
   - Verify settings are saved

4. **Test Muting**
   - Mute a chat
   - Send message
   - Verify no notification appears

5. **Test Quiet Hours**
   - Enable quiet hours (current time to 1 minute from now)
   - Send notification
   - Verify notification is suppressed

---

## Troubleshooting

### Notifications Not Appearing

**Issue**: Notifications are not displayed on device

**Solutions**:
1. Check permissions: `Settings → App → Notifications → Allow`
2. Verify device token is registered: Check `AsyncStorage` for tokens
3. Check notification preferences: Ensure notifications are enabled
4. Check quiet hours: Verify current time is outside quiet hours
5. Check do not disturb: Ensure DND is not enabled

### Permission Denied

**Issue**: User denies notification permissions

**Solutions**:
1. Explain why notifications are needed
2. Provide link to settings: `Settings → App → Notifications`
3. Gracefully handle without notifications
4. Retry permission request later

### Device Token Not Registered

**Issue**: Device token is not being registered

**Solutions**:
1. Verify `userId` is provided to `NotificationProvider`
2. Check network connectivity
3. Verify `AsyncStorage` is working
4. Check console for errors

### Notifications Delayed

**Issue**: Notifications arrive late

**Solutions**:
1. Check network connectivity
2. Verify Firebase is configured correctly
3. Check Firebase Cloud Functions logs
4. Verify device is not in low-power mode

### Badge Count Not Updating

**Issue**: App icon badge doesn't show count

**Solutions**:
1. Verify `badgeCountEnabled` is true in preferences
2. Check platform support (iOS only by default)
3. Verify badge count is being set: `setBadgeCount(count)`
4. Restart app to refresh badge

### Quiet Hours Not Working

**Issue**: Notifications appear during quiet hours

**Solutions**:
1. Verify time format is correct: `HH:mm` (24-hour)
2. Check device timezone
3. Verify `quietHoursEnabled` is true
4. Check if current time is within range

---

## Best Practices

### 1. Always Request Permissions

```tsx
await requestNotificationPermissions();
```

### 2. Register Device Token on App Launch

```tsx
if (userId) {
  await registerDeviceToken(userId);
}
```

### 3. Check Preferences Before Sending

```tsx
const enabled = await isNotificationEnabledForChat(userId, chatId);
if (enabled) {
  await sendNotification(notification);
}
```

### 4. Provide User Control

- Always offer notification preferences screen
- Allow muting specific chats/groups
- Respect quiet hours and DND settings

### 5. Handle Notification Taps

```tsx
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  // Navigate to appropriate screen
});
```

### 6. Clean Up Inactive Tokens

Periodically remove inactive device tokens:

```tsx
const tokens = await getDeviceTokens(userId);
for (const token of tokens) {
  if (!token.isActive) {
    await removeDeviceToken(userId, token.id);
  }
}
```

### 7. Log Notification Events

Track notification delivery and engagement:

```tsx
await addNotificationToHistory(notification);
// Later...
await markNotificationAsRead(userId, notificationId);
```

---

## Security Considerations

### 1. Validate Device Tokens

- Verify token format before storing
- Remove invalid tokens
- Periodically refresh tokens

### 2. Protect User Preferences

- Store preferences securely in AsyncStorage
- Encrypt sensitive data if needed
- Validate preference changes

### 3. Rate Limit Notifications

- Implement per-user rate limiting
- Prevent notification spam
- Monitor for abuse

### 4. Handle Sensitive Data

- Don't include sensitive info in notification body
- Use generic titles for private chats
- Provide option to hide message preview

---

## Performance Optimization

### 1. Batch Notifications

```tsx
// Instead of sending one notification per message
// Batch multiple messages into one notification
const notification = {
  title: 'New Messages',
  body: `You have 5 new messages`,
  data: { action: 'open_chat', chatId },
};
```

### 2. Lazy Load Preferences

```tsx
// Load preferences only when needed
const prefs = await getNotificationPreferences(userId);
```

### 3. Debounce Preference Updates

```tsx
// Debounce preference changes to reduce writes
const debouncedUpdate = debounce(
  (prefs) => updateNotificationPreferences(userId, prefs),
  1000
);
```

### 4. Clean Up History

```tsx
// Keep only last 100 notifications
const history = await getNotificationHistory(userId);
const limited = history.slice(-100);
```

---

## Future Enhancements

1. **Rich Notifications**: Add images and action buttons
2. **Notification Groups**: Group similar notifications
3. **Smart Delivery**: Optimize delivery based on user activity
4. **Analytics**: Track notification engagement
5. **A/B Testing**: Test different notification strategies
6. **ML-based Timing**: Predict best time to send notifications
7. **Notification Channels**: Android notification channels support
8. **Custom Sounds**: Allow users to set custom notification sounds

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review test cases in `__tests__/push-notification-service.test.ts`
3. Check Firebase Cloud Functions logs
4. Review Expo Notifications documentation: https://docs.expo.dev/versions/latest/sdk/notifications/

---

## References

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
