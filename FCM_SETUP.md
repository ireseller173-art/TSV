# Firebase Cloud Messaging (FCM) Setup Guide

## Overview

This guide explains how to set up Firebase Cloud Messaging for push notifications in Cool Messenger. Users will receive notifications for new messages, incoming calls, and other important events.

---

## Phase 1: Firebase Project Configuration

### Step 1.1: Enable Cloud Messaging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "cool-messenger" project
3. Go to **Build → Cloud Messaging**
4. Click **"Enable"** (if not already enabled)

### Step 1.2: Get Server Key

1. Go to **Project Settings** (gear icon)
2. Click **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. Save the JSON file securely (you'll need this for backend)

### Step 1.3: Configure APNs (for iOS)

1. Go to **Cloud Messaging** tab
2. Scroll to **"Apple Configuration"**
3. Upload your APNs certificate (from Apple Developer)
4. Click **"Upload"**

---

## Phase 2: App Configuration

### Step 2.1: Update app.config.ts

Add FCM configuration to `app.config.ts`:

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

### Step 2.2: Install Dependencies

```bash
pnpm add expo-notifications expo-device
```

---

## Phase 3: Notification Service Integration

### Step 3.1: Use NotificationProvider

The `NotificationProvider` is already integrated in `app/_layout.tsx`. It handles:

- Requesting notification permissions
- Getting Expo push token
- Handling incoming notifications
- Routing notification taps to appropriate screens

### Step 3.2: Send Notifications from Components

**Example: Send notification when message arrives**

```typescript
import { useNotifications } from '@/lib/notification-provider';

export function ChatDetail() {
  const { sendMessageNotification } = useNotifications();

  const handleNewMessage = async (senderName: string, message: string, chatId: string) => {
    // Send notification
    await sendMessageNotification(senderName, message, chatId, senderId);
  };

  return (
    // ... component JSX
  );
}
```

**Example: Send notification for incoming call**

```typescript
const { sendIncomingCallNotification } = useNotifications();

const handleIncomingCall = async (callerName: string, callerId: string, callId: string) => {
  await sendIncomingCallNotification(callerName, callerId, callId);
};
```

---

## Phase 4: Backend Integration (Cloud Functions)

### Step 4.1: Create Cloud Function for Messages

Create `functions/src/notifications.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Send notification when new message is sent
 */
export const onMessageCreated = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;

    // Get chat document
    const chatDoc = await admin.firestore().collection('chats').doc(chatId).get();
    const chat = chatDoc.data();

    if (!chat) return;

    // Get recipient (other participant)
    const recipients = chat.participants.filter((uid: string) => uid !== message.senderId);

    // Get sender info
    const senderDoc = await admin.firestore().collection('users').doc(message.senderId).get();
    const sender = senderDoc.data();

    // Get recipient tokens
    for (const recipientId of recipients) {
      const userDoc = await admin.firestore().collection('users').doc(recipientId).get();
      const user = userDoc.data();

      if (!user?.pushTokens || user.pushTokens.length === 0) continue;

      // Send notification to all devices
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

      try {
        await admin.messaging().sendMulticast({
          tokens: user.pushTokens,
          notification: payload.notification,
          data: payload.data,
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  });

/**
 * Send notification for incoming call
 */
export const onCallCreated = functions.firestore
  .document('calls/{callId}')
  .onCreate(async (snap) => {
    const call = snap.data();

    // Get recipient user
    const recipientDoc = await admin.firestore()
      .collection('users')
      .doc(call.recipientId)
      .get();
    const recipient = recipientDoc.data();

    if (!recipient?.pushTokens || recipient.pushTokens.length === 0) return;

    // Get caller info
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

    try {
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
export const onCallEnded = functions.firestore
  .document('calls/{callId}')
  .onUpdate(async (change) => {
    const call = change.after.data();
    const previousCall = change.before.data();

    // Check if call was missed (ended without being answered)
    if (previousCall.status !== 'ended' && call.status === 'ended' && !call.answered) {
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

      try {
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

### Step 4.2: Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

---

## Phase 5: Update Firestore Schema

### Add pushTokens to users collection

Update `/users/{userId}` to include:

```
/users/{userId}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── avatar: string
  ├── pushTokens: array (list of device tokens)
  ├── lastTokenUpdate: timestamp
  └── ... other fields
```

---

## Phase 6: Testing Notifications

### Test Locally

```bash
# Start dev server
pnpm dev

# Open app in browser or Expo Go
# Sign in with test account
# Check console for push token
```

### Send Test Notification

Use Firebase Console:

1. Go to **Cloud Messaging**
2. Click **"Send your first message"**
3. Fill in notification details
4. Select target audience (by topic or token)
5. Click **"Send"**

### Test Scenarios

1. **Message Notification**
   - Open app with User A
   - Send message from User B
   - Verify notification appears

2. **Call Notification**
   - Open app with User A
   - Initiate call from User B
   - Verify incoming call notification

3. **Missed Call Notification**
   - Reject incoming call
   - Verify missed call notification

---

## Phase 7: Production Deployment

### Step 7.1: Update Security Rules

Add notification rules to Firestore:

```javascript
match /users/{userId} {
  allow read: if isAuth();
  allow create, update: if isUser(userId);
  
  // Allow updating pushTokens from app
  allow update: if isUser(userId) && 
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['pushTokens', 'lastTokenUpdate']);
}
```

### Step 7.2: Configure Production Settings

1. Update `app.config.ts` with production settings
2. Build for production:

```bash
# Android
eas build --platform android --auto-submit

# iOS
eas build --platform ios --auto-submit
```

### Step 7.3: Monitor Notifications

1. Go to **Cloud Messaging** in Firebase Console
2. Monitor delivery rates and errors
3. Set up alerts for failed deliveries

---

## Notification Types

### Message Notification

```
Title: Sender Name
Body: Message preview (first 100 chars)
Action: open_chat
```

### Incoming Call Notification

```
Title: Incoming Call
Body: {Caller Name} is calling...
Action: open_call
```

### Missed Call Notification

```
Title: Missed Call
Body: You missed a call from {Caller Name}
Action: open_call_history
```

### Reaction Notification

```
Title: New Reaction
Body: {User Name} reacted with {emoji}
Action: open_chat
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No notifications received | Check push tokens are saved in Firestore |
| Notifications not showing | Verify notification permissions granted |
| Wrong notification content | Check message data is correct |
| Notifications not routing | Verify action handlers in NotificationProvider |

---

## Best Practices

1. **Rate Limiting**: Don't send more than 1 notification per minute per user
2. **Grouping**: Group related notifications (e.g., multiple messages)
3. **Timing**: Send notifications during user's active hours
4. **Personalization**: Include sender name and message preview
5. **Permissions**: Always request permissions before sending
6. **Testing**: Test on real devices before production

---

## Next Steps

1. ✅ Enable Cloud Messaging in Firebase
2. ✅ Configure APNs for iOS
3. ✅ Install notification dependencies
4. ✅ Deploy Cloud Functions
5. ✅ Test notifications locally
6. ✅ Deploy to production

**Your app now has push notifications!**
