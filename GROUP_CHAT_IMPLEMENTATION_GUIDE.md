# Group Chat Implementation Guide

## Overview

TSV Keeper now includes comprehensive group chat functionality, allowing users to create multi-user conversations, manage members, and handle group-specific features like admin controls and group settings.

## Architecture

### Data Structures

The group chat system is built on three main data structures:

| Structure | Purpose |
|-----------|---------|
| **GroupChat** | Represents a group conversation with metadata, members, and settings |
| **GroupMember** | Represents a user in a group with role and join information |
| **GroupChatMessage** | Represents a message in a group with reactions and read receipts |

### Services

The implementation includes the following services:

| Service | Location | Purpose |
|---------|----------|---------|
| **Group Chat Service** | `lib/group-chat-service.ts` | Core CRUD operations for groups, members, and messages |
| **Group Chat Provider** | `lib/group-chat-provider.tsx` | React Context for app-wide state management |

### Components

UI components for group chat functionality:

| Component | Location | Purpose |
|-----------|----------|---------|
| **GroupCreationScreen** | `components/group-creation-screen.tsx` | Create new groups with member selection |
| **GroupInfoScreen** | `components/group-info-screen.tsx` | View and edit group information |
| **GroupMembersList** | `components/group-members-list.tsx` | Display and manage group members |
| **GroupChatItem** | `components/group-chat-item.tsx` | List item for group chats |
| **GroupMessageBubble** | `components/group-message-bubble.tsx` | Message display with reactions |

## Features

### Group Management

**Create Groups**
- Users can create new groups by selecting members from contacts
- Group creator becomes admin automatically
- Groups can have name, description, and avatar

**Edit Groups**
- Admins can edit group name, description, and settings
- Changes are reflected in real-time for all members

**Archive/Mute Groups**
- Users can archive groups to hide them from chat list
- Users can mute group notifications

**Delete Groups**
- Only group creator can delete the group
- Deletes all associated messages

### Member Management

**Add Members**
- Admins can add new members to existing groups
- Members can add others if group settings allow

**Remove Members**
- Admins can remove members
- Members can leave groups
- Removed members lose access to group

**Promote Members**
- Admins can promote members to moderator or admin roles
- Moderators have limited admin capabilities

### Messaging

**Send Messages**
- Text messages with sender information
- Message status tracking (sending, sent, delivered, read)
- Timestamps for all messages

**Reactions**
- Users can react to messages with emoji
- Reaction counts displayed on messages
- Quick emoji picker for common reactions

**Read Receipts**
- Track which members have read messages
- Display read status with checkmarks

### Admin Controls

**Group Settings**
- Allow/disallow members to add others
- Allow/disallow members to remove others
- Allow/disallow members to change group info
- Enable/disable reactions
- Enable/disable voice messages

**Member Roles**
- **Admin**: Full control over group, can manage members and settings
- **Moderator**: Can manage members but limited settings access
- **Member**: Regular member with basic permissions

## Usage

### Setup

1. **Add GroupChatProvider to app layout**

```tsx
import { GroupChatProvider } from '@/lib/group-chat-provider';

export default function RootLayout() {
  return (
    <GroupChatProvider>
      {/* Your app content */}
    </GroupChatProvider>
  );
}
```

2. **Use the group chat hook in components**

```tsx
import { useGroupChat } from '@/lib/group-chat-provider';

function MyComponent() {
  const {
    groups,
    currentMessages,
    createGroup,
    sendMessage,
    addMember,
  } = useGroupChat();

  // Use the hook methods
}
```

### Creating a Group

```tsx
const { createGroup } = useGroupChat();

const newGroup = await createGroup(userId, {
  name: 'Project Team',
  description: 'Team working on Project X',
  memberIds: ['user-123', 'user-456'],
});
```

### Sending a Message

```tsx
const { sendMessage } = useGroupChat();

await sendMessage(groupId, userId, 'Hello, team!');
```

### Adding a Member

```tsx
const { addMember } = useGroupChat();

await addMember(currentUserId, {
  groupId: 'group-123',
  userId: 'new-user-id',
  role: 'member',
});
```

### Managing Group Settings

```tsx
const { updateGroup, toggleArchive, toggleMute } = useGroupChat();

// Update settings
await updateGroup(groupId, userId, {
  name: 'Updated Name',
  settings: {
    allowMembersToAdd: false,
    allowReactions: true,
  },
});

// Archive group
await toggleArchive(groupId);

// Mute notifications
await toggleMute(groupId);
```

## Database Schema (Firebase)

### Collections

**groups**
```
{
  id: string
  name: string
  description: string
  avatar: string
  createdBy: string
  createdAt: timestamp
  updatedAt: timestamp
  memberCount: number
  isArchived: boolean
  isMuted: boolean
  settings: {
    allowMembersToAdd: boolean
    allowMembersToRemove: boolean
    allowMembersToChangeInfo: boolean
    requireApprovalToJoin: boolean
    allowReactions: boolean
    allowVoiceMessages: boolean
  }
}
```

**groups/{groupId}/members**
```
{
  id: string
  userId: string
  name: string
  avatar: string
  role: 'admin' | 'moderator' | 'member'
  joinedAt: timestamp
  isActive: boolean
}
```

**groups/{groupId}/messages**
```
{
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file'
  mediaUrl: string
  reactions: { emoji: string[] }
  replyTo: { messageId, senderName, content }
  mentions: string[]
  status: 'sending' | 'sent' | 'delivered' | 'read'
  readBy: string[]
  createdAt: timestamp
  updatedAt: timestamp
  isDeleted: boolean
}
```

## Testing

The group chat service includes 18 comprehensive unit tests covering:

- Group creation and validation
- Member management (add, remove, promote)
- Message operations
- Group settings and preferences
- Search and filtering
- Error handling

Run tests with:
```bash
pnpm test __tests__/group-chat-service.test.ts
```

All 75 tests passing (18 group chat + 14 contact sync + 19 message status + 15 badge + 9 call).

## Localization

All group chat UI strings support Russian and English localization through the i18n system:

- Group creation labels
- Member management dialogs
- Settings descriptions
- Error messages
- Success notifications

## Security Considerations

1. **Permission Checks**: All operations verify user permissions (admin/member)
2. **Member Validation**: Prevents duplicate members and invalid operations
3. **Data Encryption**: Messages can be encrypted using the encryption service
4. **Rate Limiting**: Implement rate limiting for message sending
5. **Content Moderation**: Filter inappropriate content in messages

## Performance Optimization

1. **Lazy Loading**: Messages loaded in batches as user scrolls
2. **Caching**: Group data cached locally with AsyncStorage
3. **Pagination**: Message history paginated for large groups
4. **Debouncing**: Typing indicators debounced to reduce updates

## Future Enhancements

- Voice message recording and playback
- File sharing and document management
- Video call integration for groups
- Message search and filtering
- Message forwarding between groups
- Group announcements/pinned messages
- Member invitations and join requests
- Group roles and permissions matrix
- Message reactions analytics
- Group activity logs

## Troubleshooting

### Groups not loading
- Check AsyncStorage permissions
- Verify user authentication
- Clear app cache and reload

### Members not appearing
- Verify member IDs are correct
- Check member join status
- Ensure user has permission to view members

### Messages not sending
- Check network connectivity
- Verify group exists and user is member
- Check message content validation

### Permission denied errors
- Verify user role (admin/member)
- Check group settings
- Ensure user is group member

## Support

For issues or questions about group chat functionality, refer to:
- `lib/group-chat-service.ts` - Service implementation
- `__tests__/group-chat-service.test.ts` - Test examples
- Component files for UI implementation examples
