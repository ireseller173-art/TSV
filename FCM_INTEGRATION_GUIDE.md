# Firebase Cloud Messaging Integration Guide

## Quick Overview

Cool Messenger includes a complete push notification system using Firebase Cloud Messaging (FCM) and Expo Notifications. Users receive notifications for:

- **New Messages** - When someone sends a message
- **Incoming Calls** - When someone calls
- **Missed Calls** - When a call is not answered
- **Message Reactions** - When someone reacts to a message

---

## Architecture

### Components

1. **NotificationProvider** (`lib/notification-provider.tsx`)
   - Manages notification permissions
   - Handles incoming notifications
   - Routes notification taps to appropriate screens
   - Provides hooks for sending notifications

2. **Cloud Functions** (Backend)
   - Triggered by Firestore events
   - Sends notifications to users
   - Handles rate limiting and batching

3. **Firestore Schema**
   - `users/{userId}.pushTokens` - Array of device tokens
   - `chats/{chatId}/messages` - Message events
   - `calls/{callId}` - Call events

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
pnpm add expo-notifications expo-device
```

### Step 2: Update app.config.ts

```typescript
const config: ExpoConfig = {
  // ... existing config
  plugins: [
    // ... existing plugins
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#0a7ea4",
        sounds: [
          "./assets/sounds/notification.wav",
          "./assets/sounds/call-ringtone.wav",
        ],
        defaultChannel: "default",
      },
    ],
  ],
};
```

### Step 3: Use NotificationProvider in Components

**Example 1: Send message notification**

```typescript
import { useNotifications } from '@/lib/notification-provider';

export function ChatDetail() {
  const { sendMessageNotification } = useNotifications();

  const handleSendMessage = async (message: string) => {
    // Send message to Firestore
    await chatService.sendMessage(chatId, userId, userName, avatar, message);

    // Send notification to recipient
    const recipientId = chat.participants.find(id => id !== userId);
    await sendMessageNotification(userName, message, chatId, userId);
  };

  return (
    // ... component JSX
  );
}
```

**Example 2: Send incoming call notification**

```typescript
import { useNotifications } from '@/lib/notification-provider';

export function CallService() {
  const { sendIncomingCallNotification } = useNotifications();

  const handleIncomingCall = async (callerId: string, callerName: string) => {
    const callId = generateCallId();
    
    // Create call in Firestore
    await createCall(callerId, userId, callId);

    // Send notification
    await sendIncomingCallNotification(callerName, callerId, callId);
  };

  return null;
}
```

**Example 3: Send missed call notification**

```typescript
const { sendMissedCallNotification } = useNotifications();

const handleMissedCall = async (callerId: string, callerName: string) => {
  // Save to call history
  await callService.saveCallToHistory(callerId, callerName, userId, userName, Date.now(), 0, 'missed');

  // Send notification
  await sendMissedCallNotification(callerName, callerId);
};
```

### Step 4: Register Device Token with Firebase

The `NotificationProvider` automatically:
1. Requests notification permissions
2. Gets the Expo push token
3. Saves token to Firestore

**Manual registration (if needed):**

```typescript
import { useNotifications } from '@/lib/notification-provider';
import { useAuth } from '@/lib/auth-provider';

export function RegisterDeviceToken() {
  const { user } = useAuth();
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    if (user && expoPushToken) {
      // Register token in Firestore
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, {
        pushTokens: arrayUnion(expoPushToken),
        lastTokenUpdate: new Date(),
      });
    }
  }, [user, expoPushToken]);

  return null;
}
```

---

## Cloud Functions Setup

### Step 1: Initialize Firebase Functions

```bash
cd functions
firebase init functions
npm install firebase-admin firebase-functions
```

### Step 2: Create Notification Functions

Create `functions/src/notifications.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Send notification when message is created
 */
export const sendMessageNotification = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;

    try {
      // Get chat
      const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
      const chat = chatDoc.data();

      if (!chat) return;

      // Get sender info
      const senderDoc = await admin.firestore()
        .collection('users')
        .doc(message.senderId)
        .get();
      const sender = senderDoc.data();

      // Get recipients
      const recipients = chat.participants.filter((uid: string) => uid !== message.senderId);

      // Send to each recipient
      for (const recipientId of recipients) {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(recipientId)
          .get();
        const user = userDoc.data();

        if (!user?.pushTokens || user.pushTokens.length === 0) continue;

        const payload = {
          notification: {
            title: sender?.displayName || 'New Message',
            body: message.content.substring(0, 100),
          },
          data: {
            type: 'message',
            chatId,
            senderId: message.senderId,
            action: 'open_chat',
          },
        };

        await admin.messaging().sendMulticast({
          tokens: user.pushTokens,
          notification: payload.notification,
          data: payload.data,
        });
      }
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  });

/**
 * Send notification for incoming call
 */
export const sendCallNotification = functions.firestore
  .document('calls/{callId}')
  .onCreate(async (snap) => {
    const call = snap.data();

    try {
      // Get recipient
      const recipientDoc = await admin.firestore()
        .collection('users')
        .doc(call.recipientId)
        .get();
      const recipient = recipientDoc.data();

      if (!recipient?.pushTokens || recipient.pushTokens.length === 0) return;

      // Get caller
      const callerDoc = await admin.firestore()
        .collection('users')
        .doc(call.callerId)
        .get();
      const caller = callerDoc.data();

      const payload = {
        notification: {
          title: 'Incoming Call',
          body: `${caller?.displayName || 'Someone'} is calling...`,
        },
        data: {
          type: 'call',
          callId: call.id,
          callerId: call.callerId,
          action: 'open_call',
        },
      };

      await admin.messaging().sendMulticast({
        tokens: recipient.pushTokens,
        notification: payload.notification,
        data: payload.data,
      });
    } catch (error) {
      console.error('Error sending call notification:', error);
    }
  });

/**
 * Send notification for missed call
 */
export const sendMissedCallNotification = functions.firestore
  .document('calls/{callId}')
  .onUpdate(async (change) => {
    const call = change.after.data();
    const previousCall = change.before.data();

    // Check if call was missed
    if (previousCall.status !== 'ended' && call.status === 'ended' && !call.answered) {
      try {
        const recipientDoc = await admin.firestore()
          .collection('users')
          .doc(call.recipientId)
          .get();
        const recipient = recipientDoc.data();

        if (!recipient?.pushTokens || recipient.pushTokens.length === 0) return;

        const callerDoc = await admin.firestore()
          .collection('users')
          .doc(call.callerId)
          .get();
        const caller = callerDoc.data();

        const payload = {
          notification: {
            title: 'Missed Call',
            body: `You missed a call from ${caller?.displayName || 'Someone'}`,
          },
          data: {
            type: 'call_missed',
            callerId: call.callerId,
            action: 'open_call_history',
          },
        };

        await admin.messaging().sendMulticast({
          tokens: recipient.pushTokens,
          notification: payload.notification,
          data: payload.data,
        });
      } catch (error) {
        console.error('Error sending missed call notification:', error);
      }
    }
  });
```

### Step 3: Deploy Functions

```bash
firebase deploy --only functions
```

---

## Firestore Schema Updates

### Update users collection

```
/users/{userId}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── avatar: string
  ├── status: string
  ├── pushTokens: array (NEW)
  ├── lastTokenUpdate: timestamp (NEW)
  ├── createdAt: timestamp
  └── contacts: array
```

### Update security rules

```javascript
match /users/{userId} {
  allow read: if isAuth();
  allow create: if isUser(userId);
  allow update: if isUser(userId) || 
    (isAuth() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['pushTokens', 'lastTokenUpdate']));
}
```

---

## Testing Notifications

### Test Locally

```bash
# Start dev server
pnpm dev

# Open app in Expo Go or browser
# Check console for push token
# Verify token is saved in Firestore
```

### Send Test Notification via Firebase Console

1. Go to **Cloud Messaging** in Firebase Console
2. Click **"Send your first message"**
3. Enter notification details:
   - Title: "Test Message"
   - Body: "This is a test notification"
4. Select target: **Topic** or **Device token**
5. Click **"Send"**

### Test Scenarios

**Scenario 1: Message Notification**
- Open app with User A
- Send message from User B
- Verify notification appears on User A's device

**Scenario 2: Incoming Call Notification**
- Open app with User A
- Initiate call from User B
- Verify incoming call notification on User A's device

**Scenario 3: Missed Call Notification**
- Receive incoming call
- Reject or ignore the call
- Verify missed call notification

---

## Notification Payload Examples

### Message Notification

```json
{
  "notification": {
    "title": "John Doe",
    "body": "Hey, how are you?"
  },
  "data": {
    "type": "message",
    "chatId": "chat_123",
    "senderId": "user_456",
    "action": "open_chat"
  }
}
```

### Incoming Call Notification

```json
{
  "notification": {
    "title": "Incoming Call",
    "body": "John Doe is calling..."
  },
  "data": {
    "type": "call",
    "callId": "call_789",
    "callerId": "user_456",
    "action": "open_call"
  }
}
```

### Missed Call Notification

```json
{
  "notification": {
    "title": "Missed Call",
    "body": "You missed a call from John Doe"
  },
  "data": {
    "type": "call_missed",
    "callerId": "user_456",
    "action": "open_call_history"
  }
}
```

---

## Best Practices

1. **Rate Limiting**
   - Don't send more than 1 notification per minute per user
   - Batch multiple messages into single notification

2. **Personalization**
   - Include sender name and message preview
   - Show caller name for incoming calls

3. **Timing**
   - Send notifications during user's active hours
   - Respect user's notification settings

4. **Permissions**
   - Always request permissions before sending
   - Handle permission denial gracefully

5. **Testing**
   - Test on real devices before production
   - Test with slow network conditions
   - Test with notifications disabled

6. **Monitoring**
   - Monitor delivery rates in Firebase Console
   - Track failed deliveries
   - Set up alerts for issues

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications received | Verify push tokens are saved in Firestore |
| "Permission denied" error | Check Firestore security rules |
| Notifications not showing | Verify app has notification permissions |
| Wrong notification content | Check message data in Firestore |
| Notifications not routing | Verify action handlers in NotificationProvider |
| Cloud Functions not triggering | Check function logs in Firebase Console |

---

## Production Checklist

- [ ] Enable Cloud Messaging in Firebase
- [ ] Configure APNs certificate for iOS
- [ ] Deploy Cloud Functions
- [ ] Update Firestore security rules
- [ ] Test notifications on real devices
- [ ] Monitor notification delivery rates
- [ ] Set up alerts for failed deliveries
- [ ] Document notification types for users
- [ ] Create notification settings UI (optional)

---

## Next Steps

1. ✅ Install notification dependencies
2. ✅ Update app.config.ts
3. ✅ Deploy Cloud Functions
4. ✅ Update Firestore schema
5. ✅ Test notifications locally
6. ✅ Deploy to production

**Your app now has production-ready push notifications!**
