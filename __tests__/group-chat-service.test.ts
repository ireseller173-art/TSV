import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createGroupChat,
  getAllGroupChats,
  getGroupChat,
  updateGroupChat,
  addGroupMember,
  removeGroupMember,
  promoteGroupMember,
  addGroupMessage,
  getGroupMessages,
  addGroupMessageReaction,
  markGroupMessagesAsRead,
  toggleGroupArchive,
  toggleGroupMute,
  deleteGroupChat,
  searchGroupChats,
  getUserGroups,
} from '@/lib/group-chat-service';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage');

describe('Group Chat Service', () => {
  const mockUserId = 'user-123';
  const mockMemberId = 'user-456';

  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  describe('createGroupChat', () => {
    it('should create a new group chat', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([]));

      const group = await createGroupChat(mockUserId, {
        name: 'Test Group',
        description: 'A test group',
        memberIds: [mockMemberId],
      });

      expect(group.name).toBe('Test Group');
      expect(group.description).toBe('A test group');
      expect(group.createdBy).toBe(mockUserId);
      expect(group.memberCount).toBe(2); // creator + 1 member
      expect(group.members[0].role).toBe('admin');
    });

    it('should throw error if group name is empty', async () => {
      await expect(
        createGroupChat(mockUserId, {
          name: '',
          memberIds: [mockMemberId],
        })
      ).rejects.toThrow('Group name is required');
    });

    it('should throw error if no members selected', async () => {
      await expect(
        createGroupChat(mockUserId, {
          name: 'Test Group',
          memberIds: [],
        })
      ).rejects.toThrow('At least one member is required');
    });
  });

  describe('getGroupChat', () => {
    it('should retrieve a group by ID', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const group = await getGroupChat('group-123');
      expect(group?.id).toBe('group-123');
      expect(group?.name).toBe('Test Group');
    });

    it('should return null if group not found', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([]));

      const group = await getGroupChat('nonexistent');
      expect(group).toBeNull();
    });
  });

  describe('updateGroupChat', () => {
    it('should update group info if user is admin', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Old Name',
        description: 'Old description',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Admin User',
            role: 'admin' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const updated = await updateGroupChat(
        'group-123',
        mockUserId,
        {
          name: 'New Name',
          description: 'New description',
        }
      );

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New description');
    });

    it('should throw error if user is not admin', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: 'other-user',
            name: 'Regular User',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      await expect(
        updateGroupChat('group-123', 'other-user', { name: 'New Name' })
      ).rejects.toThrow('Only admins can update group info');
    });
  });

  describe('addGroupMember', () => {
    it('should add a new member to group', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Admin User',
            role: 'admin' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const member = await addGroupMember(mockUserId, {
        groupId: 'group-123',
        userId: mockMemberId,
      });

      expect(member.userId).toBe(mockMemberId);
      expect(member.role).toBe('member');
    });

    it('should throw error if member already exists', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Admin User',
            role: 'admin' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
          {
            id: 'member-2',
            userId: mockMemberId,
            name: 'Existing Member',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 2,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      await expect(
        addGroupMember(mockUserId, {
          groupId: 'group-123',
          userId: mockMemberId,
        })
      ).rejects.toThrow('Member already in group');
    });
  });

  describe('removeGroupMember', () => {
    it('should remove a member from group', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Admin User',
            role: 'admin' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
          {
            id: 'member-2',
            userId: mockMemberId,
            name: 'Regular Member',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 2,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      await removeGroupMember(mockUserId, {
        groupId: 'group-123',
        userId: mockMemberId,
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should allow user to remove themselves', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: 'other-user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Regular User',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      await removeGroupMember(mockUserId, {
        groupId: 'group-123',
        userId: mockUserId,
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('promoteGroupMember', () => {
    it('should promote member to admin', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Admin User',
            role: 'admin' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
          {
            id: 'member-2',
            userId: mockMemberId,
            name: 'Regular Member',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 2,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const promoted = await promoteGroupMember(mockUserId, {
        groupId: 'group-123',
        userId: mockMemberId,
        role: 'admin',
      });

      expect(promoted.role).toBe('admin');
    });

    it('should throw error if user is not admin', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: 'other-user',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'Regular User',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      await expect(
        promoteGroupMember(mockUserId, {
          groupId: 'group-123',
          userId: mockMemberId,
          role: 'admin',
        })
      ).rejects.toThrow('Only admins can change member roles');
    });
  });

  describe('addGroupMessage', () => {
    it('should add a message to group', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [
          {
            id: 'member-1',
            userId: mockUserId,
            name: 'User',
            role: 'member' as const,
            joinedAt: Date.now(),
            isActive: true,
          },
        ],
        memberCount: 1,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const message = await addGroupMessage(
        'group-123',
        mockUserId,
        'Hello, group!'
      );

      expect(message.content).toBe('Hello, group!');
      expect(message.senderId).toBe(mockUserId);
      expect(message.groupId).toBe('group-123');
      expect(message.status).toBe('sent');
    });
  });

  describe('toggleGroupArchive', () => {
    it('should toggle group archive status', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [],
        memberCount: 0,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const archived = await toggleGroupArchive('group-123');
      expect(archived.isArchived).toBe(true);
    });
  });

  describe('toggleGroupMute', () => {
    it('should toggle group mute status', async () => {
      const mockGroup = {
        id: 'group-123',
        name: 'Test Group',
        createdBy: mockUserId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        members: [],
        memberCount: 0,
        isArchived: false,
        isMuted: false,
        settings: {
          allowMembersToAdd: true,
          allowMembersToRemove: false,
          allowMembersToChangeInfo: false,
          requireApprovalToJoin: false,
          allowReactions: true,
          allowVoiceMessages: true,
        },
      };

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([mockGroup]));

      const muted = await toggleGroupMute('group-123');
      expect(muted.isMuted).toBe(true);
    });
  });

  describe('searchGroupChats', () => {
    it('should search groups by name', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          name: 'Work Team',
          createdBy: mockUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          members: [],
          memberCount: 0,
          isArchived: false,
          isMuted: false,
          settings: {
            allowMembersToAdd: true,
            allowMembersToRemove: false,
            allowMembersToChangeInfo: false,
            requireApprovalToJoin: false,
            allowReactions: true,
            allowVoiceMessages: true,
          },
        },
        {
          id: 'group-2',
          name: 'Friends',
          createdBy: mockUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          members: [],
          memberCount: 0,
          isArchived: false,
          isMuted: false,
          settings: {
            allowMembersToAdd: true,
            allowMembersToRemove: false,
            allowMembersToChangeInfo: false,
            requireApprovalToJoin: false,
            allowReactions: true,
            allowVoiceMessages: true,
          },
        },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockGroups));

      const results = await searchGroupChats('work');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Work Team');
    });
  });

  describe('getUserGroups', () => {
    it('should get all groups for a user', async () => {
      const mockGroups = [
        {
          id: 'group-1',
          name: 'Group 1',
          createdBy: mockUserId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          members: [
            {
              id: 'member-1',
              userId: mockUserId,
              name: 'User',
              role: 'member' as const,
              joinedAt: Date.now(),
              isActive: true,
            },
          ],
          memberCount: 1,
          isArchived: false,
          isMuted: false,
          settings: {
            allowMembersToAdd: true,
            allowMembersToRemove: false,
            allowMembersToChangeInfo: false,
            requireApprovalToJoin: false,
            allowReactions: true,
            allowVoiceMessages: true,
          },
        },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockGroups));

      const userGroups = await getUserGroups(mockUserId);
      expect(userGroups).toHaveLength(1);
      expect(userGroups[0].id).toBe('group-1');
    });
  });
});
