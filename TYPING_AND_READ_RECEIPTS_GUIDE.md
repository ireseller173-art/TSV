# Typing Indicators & Read Receipts Guide

## Overview

Cool Messenger includes a complete system for displaying typing indicators and message read receipts. Users can see:

- **Typing Indicators** - When someone is composing a message ("User is typing...")
- **Message Status** - Delivery status (Sending, Sent, Delivered, Read)
- **Read Receipts** - Who has read the message and when

---

## Architecture

### Components

1. **MessageStatusService** (`lib/message-status-service.ts`)
   - Manages message status states
   - Handles typing indicator logic
   - Provides utility functions

2. **MessageStatusProvider** (`lib/message-status-provider.tsx`)
   - Context provider for app-wide status management
   - Handles state updates and cleanup
   - Provides hooks for components

3. **MessageStatusIndicator** (`components/message-status-indicator.tsx`)
   - Displays message delivery status
   - Shows read receipts
   - Responsive sizing

4. **TypingIndicatorDisplay** (`components/typing-indicator-display.tsx`)
   - Animated typing indicator
   - Shows who is typing
   - Auto-cleanup of stale indicators

---

## Implementation

### Step 1: Use MessageStatusProvider

The `MessageStatusProvider` is already integrated in `app/_layout.tsx`. It provides hooks for managing message status.

### Step 2: Display Message Status in Chat

**Example: Update message bubble to show status**

```typescript
import { useMessageStatus } from '@/lib/message-status-provider';
import { MessageStatusIndicator } from '@/components/message-status-indicator';

export function ChatDetail() {
  const { getMessageStatus } = useMessageStatus();

  const renderMessage = (message: Message) => {
    const status = getMessageStatus(message.id);
    const messageStatus = status?.status || 'sent';

    return (
      <View className="flex-row items-end gap-2 mb-2">
        <View className="flex-1 bg-primary rounded-lg p-3">
          <Text className="text-white">{message.content}</Text>
        </View>
        <MessageStatusIndicator
          status={messageStatus}
          readBy={status?.readBy}
          isOwn={message.senderId === currentUserId}
          size="small"
        />
      </View>
    );
  };

  return (
    // ... component JSX
  );
}
```

### Step 3: Display Typing Indicator

**Example: Show typing indicator in chat**

```typescript
import { useMessageStatus } from '@/lib/message-status-provider';
import { TypingIndicatorDisplay } from '@/components/typing-indicator-display';

export function ChatDetail() {
  const { getTypingUsers } = useMessageStatus();
  const typingUsers = getTypingUsers(chatId);
  const isTyping = typingUsers.length > 0;

  return (
    <View className="flex-1">
      <FlatList
        data={messages}
        renderItem={({ item }) => renderMessage(item)}
        keyExtractor={(item) => item.id}
      />
      <TypingIndicatorDisplay
        isTyping={isTyping}
        userName={typingUsers[0]?.userName}
        userCount={typingUsers.length}
      />
      {/* Input area */}
    </View>
  );
}
```

### Step 4: Send Typing Indicator

**Example: Notify when user starts typing**

```typescript
import { useMessageStatus } from '@/lib/message-status-provider';

export function ChatDetail() {
  const { setUserTyping, setUserIdle } = useMessageStatus();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleTextChange = (text: string) => {
    setInputText(text);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    setUserTyping(currentUserId, currentUserName, chatId);

    // Set idle after 3 seconds of no input
    const timeout = setTimeout(() => {
      setUserIdle(currentUserId, chatId);
    }, 3000);

    setTypingTimeout(timeout);
  };

  return (
    <TextInput
      value={inputText}
      onChangeText={handleTextChange}
      placeholder="Type a message..."
    />
  );
}
```

### Step 5: Update Message Status on Send

**Example: Update status when message is sent**

```typescript
import { useMessageStatus } from '@/lib/message-status-provider';
import { messageStatusService } from '@/lib/message-status-service';

export function ChatDetail() {
  const { updateMessageStatus, markMessageAsDelivered } = useMessageStatus();

  const handleSendMessage = async (content: string) => {
    const messageId = generateId();

    // Create initial status
    const initialStatus = messageStatusService.createMessageStatus(messageId, 'sending');
    updateMessageStatus(messageId, initialStatus);

    try {
      // Send message to Firebase
      await chatService.sendMessage(chatId, currentUserId, content);

      // Mark as delivered
      markMessageAsDelivered(messageId);

      // Simulate server confirmation
      setTimeout(() => {
        const deliveredStatus = messageStatusService.createMessageStatus(messageId, 'delivered');
        updateMessageStatus(messageId, deliveredStatus);
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    // ... component JSX
  );
}
```

### Step 6: Mark Message as Read

**Example: Mark message as read when viewed**

```typescript
import { useMessageStatus } from '@/lib/message-status-provider';

export function ChatDetail() {
  const { markMessageAsRead } = useMessageStatus();

  useEffect(() => {
    // Mark all visible messages as read
    messages.forEach((message) => {
      if (message.senderId !== currentUserId) {
        markMessageAsRead(message.id, currentUserId);
      }
    });
  }, [messages, currentUserId, markMessageAsRead]);

  return (
    // ... component JSX
  );
}
```

---

## Message Status Flow

```
User sends message
        ↓
Status: "sending" (⏱️)
        ↓
Message reaches server
        ↓
Status: "delivered" (✓✓)
        ↓
Recipient opens chat
        ↓
Status: "read" (✓✓ blue)
```

---

## Typing Indicator Flow

```
User starts typing
        ↓
Send typing indicator to other users
        ↓
Display "User is typing..." with animated dots
        ↓
User stops typing (3 second timeout)
        ↓
Clear typing indicator
```

---

## API Reference

### MessageStatusService

#### `createMessageStatus(messageId, status?)`
Creates a new message status object.

```typescript
const status = messageStatusService.createMessageStatus('msg_123', 'sending');
// { messageId: 'msg_123', status: 'sending', timestamp: 1234567890, readBy: [] }
```

#### `markAsDelivered(messageStatus)`
Marks a message as delivered.

```typescript
const delivered = messageStatusService.markAsDelivered(status);
// status.status === 'delivered'
```

#### `markAsRead(messageStatus, userId)`
Marks a message as read by a user.

```typescript
const read = messageStatusService.markAsRead(status, 'user_456');
// status.status === 'read', status.readBy includes 'user_456'
```

#### `getStatusIcon(status)`
Returns an icon for the status.

```typescript
messageStatusService.getStatusIcon('delivered'); // '✓✓'
messageStatusService.getStatusIcon('read'); // '✓✓'
```

#### `getStatusLabel(status)`
Returns a label for the status.

```typescript
messageStatusService.getStatusLabel('sending'); // 'Sending...'
messageStatusService.getStatusLabel('read'); // 'Read'
```

#### `createTypingIndicator(userId, userName, chatId)`
Creates a typing indicator.

```typescript
const indicator = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
```

#### `isTypingIndicatorValid(indicator)`
Checks if a typing indicator is still valid (< 3 seconds old).

```typescript
const isValid = messageStatusService.isTypingIndicatorValid(indicator);
```

#### `getTypingStatusText(typingUsers)`
Returns formatted typing status text.

```typescript
messageStatusService.getTypingStatusText([indicator1, indicator2]);
// 'John and Jane are typing...'
```

### MessageStatusProvider Hook

#### `useMessageStatus()`
Returns the message status context.

```typescript
const {
  messageStatuses,
  updateMessageStatus,
  markMessageAsDelivered,
  markMessageAsRead,
  getMessageStatus,
  typingIndicators,
  setUserTyping,
  setUserIdle,
  getTypingUsers,
  getTypingStatusText,
} = useMessageStatus();
```

---

## Components

### MessageStatusIndicator

Displays the delivery/read status of a message.

**Props:**
- `status: MessageStatus` - The message status (sending, sent, delivered, read)
- `readBy?: string[]` - Array of user IDs who read the message
- `isOwn?: boolean` - Whether this is the user's own message
- `size?: 'small' | 'medium' | 'large'` - Icon size

**Example:**
```typescript
<MessageStatusIndicator
  status="read"
  readBy={['user_456', 'user_789']}
  isOwn={true}
  size="small"
/>
```

### TypingIndicatorDisplay

Displays an animated typing indicator.

**Props:**
- `isTyping: boolean` - Whether someone is typing
- `userName?: string` - Name of the typing user
- `userCount?: number` - Number of users typing

**Example:**
```typescript
<TypingIndicatorDisplay
  isTyping={true}
  userName="John"
  userCount={1}
/>
```

---

## Firebase Integration

### Firestore Schema Updates

Update message documents to include status:

```
/chats/{chatId}/messages/{messageId}
  ├── content: string
  ├── senderId: string
  ├── senderName: string
  ├── createdAt: timestamp
  ├── status: string (sending | sent | delivered | read)
  ├── readBy: array (user IDs who read)
  └── readAt: timestamp (when message was read)
```

### Cloud Functions for Read Receipts

Create a Cloud Function to update message status:

```typescript
export const updateMessageReadStatus = functions.https.onCall(async (data, context) => {
  const { chatId, messageId, userId } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  try {
    const messageRef = admin.firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .doc(messageId);

    await messageRef.update({
      status: 'read',
      readBy: admin.firestore.FieldValue.arrayUnion(userId),
      readAt: admin.firestore.Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating message status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update message status');
  }
});
```

### Firestore Real-time Listeners

Listen for message status updates:

```typescript
const unsubscribe = db
  .collection('chats')
  .doc(chatId)
  .collection('messages')
  .where('senderId', '==', currentUserId)
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'modified') {
        const message = change.doc.data();
        updateMessageStatus(message.id, {
          messageId: message.id,
          status: message.status,
          readBy: message.readBy,
          timestamp: message.readAt?.toMillis() || Date.now(),
        });
      }
    });
  });
```

---

## Best Practices

1. **Typing Indicators**
   - Auto-clear after 3 seconds of inactivity
   - Don't send indicator for every keystroke (debounce)
   - Clear when user stops typing or sends message

2. **Read Receipts**
   - Mark as read when message enters viewport
   - Send read receipt to server
   - Show read count in group chats

3. **Performance**
   - Batch status updates
   - Clean up old typing indicators
   - Don't update status for every keystroke

4. **User Experience**
   - Show clear visual indicators
   - Use animations for typing indicator
   - Provide option to disable read receipts

5. **Privacy**
   - Allow users to disable read receipts
   - Don't show read receipts in group chats by default
   - Respect user privacy settings

---

## Testing

All 19 tests for message status service pass:

```bash
pnpm test __tests__/message-status-service.test.ts
```

**Test Coverage:**
- Message status creation and updates
- Delivery and read marking
- Status icons and labels
- Typing indicator creation and validation
- Typing status text generation
- Indicator filtering

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Typing indicator not showing | Check `isTyping` prop is true |
| Status not updating | Verify `updateMessageStatus` is called |
| Old typing indicators remain | Check auto-cleanup is working (3s timeout) |
| Read receipts not showing | Verify `markMessageAsRead` is called |
| Performance issues | Batch status updates, debounce input |

---

## Next Steps

1. ✅ Implement typing indicators
2. ✅ Add message read receipts
3. ✅ Create status components
4. ✅ Write comprehensive tests
5. [ ] Deploy to Firebase
6. [ ] Test on real devices
7. [ ] Monitor performance

**Your app now has typing indicators and read receipts!**
