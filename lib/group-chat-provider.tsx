/**
 * Group Chat Provider
 * Manages group chat state and operations across the app
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  GroupChat,
  GroupChatMessage,
  GroupMember,
  GroupChatCreateInput,
  GroupChatUpdateInput,
  GroupMemberAddInput,
  GroupMemberRemoveInput,
  GroupMemberPromoteInput,
} from './types/group-chat';
import * as groupChatService from './group-chat-service';

interface GroupChatContextType {
  groups: GroupChat[];
  currentGroupId: string | null;
  currentMessages: GroupChatMessage[];
  isLoading: boolean;
  error: string | null;

  // Group operations
  createGroup: (currentUserId: string, input: GroupChatCreateInput) => Promise<GroupChat>;
  loadGroups: (userId: string) => Promise<void>;
  loadGroupMessages: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, currentUserId: string, input: GroupChatUpdateInput) => Promise<void>;
  deleteGroup: (groupId: string, currentUserId: string) => Promise<void>;
  setCurrentGroup: (groupId: string | null) => void;

  // Member operations
  addMember: (currentUserId: string, input: GroupMemberAddInput) => Promise<void>;
  removeMember: (currentUserId: string, input: GroupMemberRemoveInput) => Promise<void>;
  promoteMember: (currentUserId: string, input: GroupMemberPromoteInput) => Promise<void>;

  // Message operations
  sendMessage: (groupId: string, senderId: string, content: string) => Promise<void>;
  addReaction: (groupId: string, messageId: string, userId: string, emoji: string) => Promise<void>;
  markMessagesAsRead: (groupId: string, userId: string) => Promise<void>;

  // Group settings
  toggleArchive: (groupId: string) => Promise<void>;
  toggleMute: (groupId: string) => Promise<void>;
}

const GroupChatContext = createContext<GroupChatContextType | undefined>(undefined);

export function GroupChatProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<GroupChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = useCallback(
    async (currentUserId: string, input: GroupChatCreateInput) => {
      try {
        setIsLoading(true);
        setError(null);
        const group = await groupChatService.createGroupChat(currentUserId, input);
        setGroups((prev) => [...prev, group]);
        return group;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create group';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadGroups = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userGroups = await groupChatService.getUserGroups(userId);
      setGroups(userGroups);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load groups';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadGroupMessages = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const messages = await groupChatService.getGroupMessages(groupId);
      setCurrentMessages(messages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGroup = useCallback(
    async (groupId: string, currentUserId: string, input: GroupChatUpdateInput) => {
      try {
        setIsLoading(true);
        setError(null);
        const updated = await groupChatService.updateGroupChat(groupId, currentUserId, input);
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? updated : g))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update group';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteGroup = useCallback(
    async (groupId: string, currentUserId: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await groupChatService.deleteGroupChat(groupId, currentUserId);
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
        if (currentGroupId === groupId) {
          setCurrentGroupId(null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete group';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentGroupId]
  );

  const addMember = useCallback(
    async (currentUserId: string, input: GroupMemberAddInput) => {
      try {
        setIsLoading(true);
        setError(null);
        await groupChatService.addGroupMember(currentUserId, input);
        const updated = await groupChatService.getGroupChat(input.groupId);
        if (updated) {
          setGroups((prev) =>
            prev.map((g) => (g.id === input.groupId ? updated : g))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add member';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeMember = useCallback(
    async (currentUserId: string, input: GroupMemberRemoveInput) => {
      try {
        setIsLoading(true);
        setError(null);
        await groupChatService.removeGroupMember(currentUserId, input);
        const updated = await groupChatService.getGroupChat(input.groupId);
        if (updated) {
          setGroups((prev) =>
            prev.map((g) => (g.id === input.groupId ? updated : g))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove member';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const promoteMember = useCallback(
    async (currentUserId: string, input: GroupMemberPromoteInput) => {
      try {
        setIsLoading(true);
        setError(null);
        await groupChatService.promoteGroupMember(currentUserId, input);
        const updated = await groupChatService.getGroupChat(input.groupId);
        if (updated) {
          setGroups((prev) =>
            prev.map((g) => (g.id === input.groupId ? updated : g))
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to promote member';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (groupId: string, senderId: string, content: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const message = await groupChatService.addGroupMessage(groupId, senderId, content);
        setCurrentMessages((prev) => [...prev, message]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addReaction = useCallback(
    async (groupId: string, messageId: string, userId: string, emoji: string) => {
      try {
        setIsLoading(true);
        setError(null);
        await groupChatService.addGroupMessageReaction(groupId, messageId, userId, emoji);
        setCurrentMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  reactions: {
                    ...m.reactions,
                    [emoji]: [...(m.reactions[emoji] || []), userId],
                  },
                }
              : m
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add reaction';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const markMessagesAsRead = useCallback(
    async (groupId: string, userId: string) => {
      try {
        await groupChatService.markGroupMessagesAsRead(groupId, userId);
      } catch (err) {
      }
    },
    []
  );

  const toggleArchive = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await groupChatService.toggleGroupArchive(groupId);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? updated : g))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle archive';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleMute = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await groupChatService.toggleGroupMute(groupId);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? updated : g))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle mute';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: GroupChatContextType = {
    groups,
    currentGroupId,
    currentMessages,
    isLoading,
    error,
    createGroup,
    loadGroups,
    loadGroupMessages,
    updateGroup,
    deleteGroup,
    setCurrentGroup: setCurrentGroupId,
    addMember,
    removeMember,
    promoteMember,
    sendMessage,
    addReaction,
    markMessagesAsRead,
    toggleArchive,
    toggleMute,
  };

  return (
    <GroupChatContext.Provider value={value}>
      {children}
    </GroupChatContext.Provider>
  );
}

export function useGroupChat() {
  const context = useContext(GroupChatContext);
  if (!context) {
    throw new Error('useGroupChat must be used within GroupChatProvider');
  }
  return context;
}
