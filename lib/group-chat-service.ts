/**
 * Group Chat Service
 * Manages group chat operations: creation, member management, messaging
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GroupChat,
  GroupChatMessage,
  GroupMember,
  GroupMemberRole,
  GroupChatCreateInput,
  GroupChatUpdateInput,
  GroupMemberAddInput,
  GroupMemberRemoveInput,
  GroupMemberPromoteInput,
  GroupChatSettings,
} from './types/group-chat';

const STORAGE_KEY = '@tsv_keeper_group_chats';
const MESSAGES_KEY = '@tsv_keeper_group_messages';

/**
 * Generate unique ID for groups and messages
 */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default group chat settings
 */
function getDefaultSettings(): GroupChatSettings {
  return {
    allowMembersToAdd: true,
    allowMembersToRemove: false,
    allowMembersToChangeInfo: false,
    requireApprovalToJoin: false,
    allowReactions: true,
    allowVoiceMessages: true,
  };
}

/**
 * Create a new group chat
 */
export async function createGroupChat(
  currentUserId: string,
  input: GroupChatCreateInput
): Promise<GroupChat> {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Group name is required');
  }

  if (!input.memberIds || input.memberIds.length === 0) {
    throw new Error('At least one member is required');
  }

  const groupId = generateId();
  const now = Date.now();

  // Create members array with current user as admin
  const members: GroupMember[] = [
    {
      id: generateId(),
      userId: currentUserId,
      name: 'You',
      role: 'admin',
      joinedAt: now,
      isActive: true,
    },
  ];

  // Add selected members as regular members
  for (const userId of input.memberIds) {
    if (userId !== currentUserId) {
      members.push({
        id: generateId(),
        userId,
        name: `User ${userId.slice(0, 4)}`,
        role: 'member',
        joinedAt: now,
        isActive: true,
      });
    }
  }

  const group: GroupChat = {
    id: groupId,
    name: input.name,
    description: input.description,
    avatar: input.avatar,
    createdBy: currentUserId,
    createdAt: now,
    updatedAt: now,
    members,
    memberCount: members.length,
    isArchived: false,
    isMuted: false,
    settings: getDefaultSettings(),
  };

  // Save to storage
  const groups = await getAllGroupChats();
  groups.push(group);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));

  return group;
}

/**
 * Get all group chats
 */
export async function getAllGroupChats(): Promise<GroupChat[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading group chats:', error);
    return [];
  }
}

/**
 * Get a specific group chat by ID
 */
export async function getGroupChat(groupId: string): Promise<GroupChat | null> {
  const groups = await getAllGroupChats();
  return groups.find((g) => g.id === groupId) || null;
}

/**
 * Update group chat info
 */
export async function updateGroupChat(
  groupId: string,
  currentUserId: string,
  input: GroupChatUpdateInput
): Promise<GroupChat> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is admin
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || userMember.role !== 'admin') {
    throw new Error('Only admins can update group info');
  }

  const updated: GroupChat = {
    ...group,
    name: input.name ?? group.name,
    description: input.description ?? group.description,
    avatar: input.avatar ?? group.avatar,
    settings: input.settings ? { ...group.settings, ...input.settings } : group.settings,
    updatedAt: Date.now(),
  };

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return updated;
}

/**
 * Add member to group
 */
export async function addGroupMember(
  currentUserId: string,
  input: GroupMemberAddInput
): Promise<GroupMember> {
  const group = await getGroupChat(input.groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is admin or has permission
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || (userMember.role !== 'admin' && !group.settings.allowMembersToAdd)) {
    throw new Error('You do not have permission to add members');
  }

  // Check if member already exists
  if (group.members.some((m) => m.userId === input.userId)) {
    throw new Error('Member already in group');
  }

  const newMember: GroupMember = {
    id: generateId(),
    userId: input.userId,
    name: `User ${input.userId.slice(0, 4)}`,
    role: input.role || 'member',
    joinedAt: Date.now(),
    isActive: true,
  };

  group.members.push(newMember);
  group.memberCount = group.members.length;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === input.groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return newMember;
}

/**
 * Remove member from group
 */
export async function removeGroupMember(
  currentUserId: string,
  input: GroupMemberRemoveInput
): Promise<void> {
  const group = await getGroupChat(input.groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check permissions
  const userMember = group.members.find((m) => m.userId === currentUserId);
  const targetMember = group.members.find((m) => m.userId === input.userId);

  if (!userMember || !targetMember) {
    throw new Error('Member not found');
  }

  // Can remove self, or admin can remove others
  const isRemovingSelf = currentUserId === input.userId;
  const isAdmin = userMember.role === 'admin';

  if (!isRemovingSelf && !isAdmin) {
    throw new Error('Only admins can remove other members');
  }

  // Cannot remove the group creator
  if (group.createdBy === input.userId && !isRemovingSelf) {
    throw new Error('Cannot remove group creator');
  }

  group.members = group.members.filter((m) => m.userId !== input.userId);
  group.memberCount = group.members.length;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === input.groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }
}

/**
 * Promote/demote member role
 */
/**
 * Promote/demote member role (including moderator role)
 */
export async function promoteGroupMember(
  currentUserId: string,
  input: GroupMemberPromoteInput
): Promise<GroupMember> {
  const group = await getGroupChat(input.groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if current user is admin
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || userMember.role !== 'admin') {
    throw new Error('Only admins can change member roles');
  }

  const targetMember = group.members.find((m) => m.userId === input.userId);
  if (!targetMember) {
    throw new Error('Member not found');
  }

  // Validate role (admin, moderator, member)
  const validRoles = ['admin', 'moderator', 'member'];
  if (!validRoles.includes(input.role)) {
    throw new Error('Invalid role');
  }

  targetMember.role = input.role as GroupMemberRole;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === input.groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return targetMember;
}

/**
 * Add message to group chat
 */
export async function addGroupMessage(
  groupId: string,
  senderId: string,
  content: string,
  type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text'
): Promise<GroupChatMessage> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  const message: GroupChatMessage = {
    id: generateId(),
    groupId,
    senderId,
    senderName: `User ${senderId.slice(0, 4)}`,
    content,
    type,
    reactions: {},
    mentions: [],
    status: 'sent',
    readBy: [senderId],
    createdAt: Date.now(),
    isDeleted: false,
  };

  // Update group's last message
  group.lastMessage = content;
  group.lastMessageTime = message.createdAt;
  group.lastMessageSender = senderId;
  group.updatedAt = Date.now();

  // Save message
  const messages = await getGroupMessages(groupId);
  messages.push(message);
  const allMessages = await getAllGroupMessages();
  allMessages.push(message);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

  // Update group
  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return message;
}

/**
 * Get messages for a group
 */
export async function getGroupMessages(groupId: string): Promise<GroupChatMessage[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_KEY);
    const allMessages: GroupChatMessage[] = data ? JSON.parse(data) : [];
    return allMessages.filter((m) => m.groupId === groupId);
  } catch (error) {
    console.error('Error loading group messages:', error);
    return [];
  }
}

/**
 * Archive a group chat
 */
export async function archiveGroupChat(
  currentUserId: string,
  groupId: string
): Promise<GroupChat> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is admin
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || userMember.role !== 'admin') {
    throw new Error('Only admins can archive groups');
  }

  const updated: GroupChat = {
    ...group,
    isArchived: true,
    updatedAt: Date.now(),
  };

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return updated;
}

/**
 * Unarchive a group chat
 */
export async function unarchiveGroupChat(
  currentUserId: string,
  groupId: string
): Promise<GroupChat> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is admin
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || userMember.role !== 'admin') {
    throw new Error('Only admins can unarchive groups');
  }

  const updated: GroupChat = {
    ...group,
    isArchived: false,
    updatedAt: Date.now(),
  };

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return updated;
}

/**
 * Export group chat history as JSON
 */
export async function exportGroupHistory(
  currentUserId: string,
  groupId: string
): Promise<string> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if user is member
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember) {
    throw new Error('You are not a member of this group');
  }

  const messages = await getGroupMessages(groupId);
  const exportData = {
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      memberCount: group.memberCount,
    },
    messages: messages.map((m) => ({
      id: m.id,
      senderName: m.senderName,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
      reactions: m.reactions,
    })),
    exportedAt: Date.now(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Restrict member permissions
 */
export async function restrictMemberPermissions(
  currentUserId: string,
  groupId: string,
  userId: string,
  restrictions: {
    canSendMessages?: boolean;
    canSendMedia?: boolean;
    canSendVoiceMessages?: boolean;
    canReact?: boolean;
  }
): Promise<GroupMember> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  // Check if current user is admin
  const userMember = group.members.find((m) => m.userId === currentUserId);
  if (!userMember || userMember.role !== 'admin') {
    throw new Error('Only admins can restrict member permissions');
  }

  const targetMember = group.members.find((m) => m.userId === userId);
  if (!targetMember) {
    throw new Error('Member not found');
  }

  // Add restrictions to member
  targetMember.restrictions = restrictions;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return targetMember;
}

/**
 * Get all group messages (for internal use)
 */
async function getAllGroupMessages(): Promise<GroupChatMessage[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading all group messages:', error);
    return [];
  }
}

/**
 * Add reaction to group message
 */
export async function addGroupMessageReaction(
  groupId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const allMessages = await getAllGroupMessages();
  const message = allMessages.find((m) => m.id === messageId && m.groupId === groupId);

  if (!message) {
    throw new Error('Message not found');
  }

  if (!message.reactions[emoji]) {
    message.reactions[emoji] = [];
  }

  if (!message.reactions[emoji].includes(userId)) {
    message.reactions[emoji].push(userId);
  }

  message.updatedAt = Date.now();
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
}

/**
 * Mark group messages as read
 */
export async function markGroupMessagesAsRead(
  groupId: string,
  userId: string,
  upToMessageId?: string
): Promise<void> {
  const allMessages = await getAllGroupMessages();
  const groupMessages = allMessages.filter((m) => m.groupId === groupId);

  for (const message of groupMessages) {
    if (upToMessageId && message.id === upToMessageId) {
      break;
    }

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      message.status = 'read';
    }
  }

  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
}

/**
 * Archive/unarchive group
 */
export async function toggleGroupArchive(groupId: string): Promise<GroupChat> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  group.isArchived = !group.isArchived;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return group;
}

/**
 * Mute/unmute group notifications
 */
export async function toggleGroupMute(groupId: string): Promise<GroupChat> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  group.isMuted = !group.isMuted;
  group.updatedAt = Date.now();

  const groups = await getAllGroupChats();
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    groups[index] = group;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  return group;
}

/**
 * Delete group (admin only)
 */
export async function deleteGroupChat(
  groupId: string,
  currentUserId: string
): Promise<void> {
  const group = await getGroupChat(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  if (group.createdBy !== currentUserId) {
    throw new Error('Only group creator can delete the group');
  }

  const groups = await getAllGroupChats();
  const filteredGroups = groups.filter((g) => g.id !== groupId);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGroups));

  // Also delete messages
  const allMessages = await getAllGroupMessages();
  const filteredMessages = allMessages.filter((m) => m.groupId !== groupId);
  await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
}

/**
 * Search group chats by name
 */
export async function searchGroupChats(query: string): Promise<GroupChat[]> {
  const groups = await getAllGroupChats();
  return groups.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );
}

/**
 * Get user's groups
 */
export async function getUserGroups(userId: string): Promise<GroupChat[]> {
  const groups = await getAllGroupChats();
  return groups.filter((g) =>
    g.members.some((m) => m.userId === userId)
  );
}
