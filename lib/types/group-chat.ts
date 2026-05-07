/**
 * Group Chat Types and Interfaces
 * Defines data structures for group conversations
 */

export type GroupMemberRole = 'admin' | 'moderator' | 'member';

export interface GroupMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: GroupMemberRole;
  joinedAt: number;
  isActive: boolean;
  restrictions?: {
    canSendMessages?: boolean;
    canSendMedia?: boolean;
    canSendVoiceMessages?: boolean;
    canReact?: boolean;
  };
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  members: GroupMember[];
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
  lastMessageSender?: string;
  isArchived: boolean;
  isMuted: boolean;
  settings: GroupChatSettings;
}

export interface GroupChatSettings {
  allowMembersToAdd: boolean;
  allowMembersToRemove: boolean;
  allowMembersToChangeInfo: boolean;
  requireApprovalToJoin: boolean;
  allowReactions: boolean;
  allowVoiceMessages: boolean;
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  reactions: Record<string, string[]>; // emoji -> userIds
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
  mentions: string[]; // userIds
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readBy: string[]; // userIds
  createdAt: number;
  updatedAt?: number;
  isDeleted: boolean;
}

export interface GroupChatCreateInput {
  name: string;
  description?: string;
  memberIds: string[];
  avatar?: string;
}

export interface GroupChatUpdateInput {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: Partial<GroupChatSettings>;
}

export interface GroupMemberAddInput {
  groupId: string;
  userId: string;
  role?: GroupMemberRole;
}

export interface GroupMemberRemoveInput {
  groupId: string;
  userId: string;
}

export interface GroupMemberPromoteInput {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
}

export interface GroupChatSyncResult {
  imported: number;
  updated: number;
  failed: number;
  timestamp: number;
  errors?: string[];
}
