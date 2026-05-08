/**
 * Group Members List Component
 * Displays and manages group members with role indicators
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useGroupChat } from '@/lib/group-chat-provider';
import { useFirebaseAuth as useAuth } from '@/lib/firebase-auth-provider';
import { useColors } from '@/hooks/use-colors';
import { GroupMember, GroupMemberRole } from '@/lib/types/group-chat';
import * as Haptics from 'expo-haptics';

interface GroupMembersListProps {
  groupId: string;
  members: GroupMember[];
  isAdmin?: boolean;
  onMemberRemoved?: () => void;
}

export function GroupMembersList({
  groupId,
  members,
  isAdmin = false,
  onMemberRemoved,
}: GroupMembersListProps) {
  const colors = useColors();
  const { user } = useAuth();
  const { removeMember, promoteMember, isLoading } = useGroupChat();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleRemoveMember = useCallback(
    (member: GroupMember) => {
      if (member.userId === String(user?.id)) {
        Alert.alert('Confirm', 'Leave this group?', [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Leave',
            onPress: async () => {
              try {
                await removeMember(String(user?.id), {
                  groupId,
                  userId: member.userId,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onMemberRemoved?.();
              } catch (error) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Failed to leave group');
              }
            },
            style: 'destructive',
          },
        ]);
      } else if (isAdmin) {
        Alert.alert('Confirm', `Remove ${member.name} from group?`, [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Remove',
            onPress: async () => {
              try {
                await removeMember(String(user?.id), {
                  groupId,
                  userId: member.userId,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onMemberRemoved?.();
              } catch (error) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Failed to remove member');
              }
            },
            style: 'destructive',
          },
        ]);
      }
    },
    [groupId, user?.id, isAdmin, removeMember, onMemberRemoved]
  );

  const handlePromoteMember = useCallback(
    (member: GroupMember, newRole: GroupMemberRole) => {
      if (!isAdmin) return;

      const roleLabel = newRole === 'admin' ? 'Admin' : newRole === 'moderator' ? 'Moderator' : 'Member';
      Alert.alert('Confirm', `Promote ${member.name} to ${roleLabel}?`, [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Promote',
          onPress: async () => {
            try {
              await promoteMember(String(user?.id), {
                groupId,
                userId: member.userId,
                role: newRole,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to promote member');
            }
          },
        },
      ]);
    },
    [groupId, user?.id, isAdmin, promoteMember]
  );

  const renderMemberItem = ({ item }: { item: GroupMember }) => {
    const isCurrentUser = item.userId === String(user?.id);
    const showActions = isAdmin || isCurrentUser;

    return (
      <View
        className="px-4 py-3 border-b flex-row items-center justify-between"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center flex-1">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-semibold text-xs">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="ml-3 flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className="font-semibold flex-1"
                style={{ color: colors.foreground }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {isCurrentUser && (
                <Text className="text-xs px-2 py-1 rounded" style={{ backgroundColor: colors.primary, color: 'white' }}>
                  You
                </Text>
              )}
            </View>

            <Text className="text-xs mt-1" style={{ color: colors.muted }}>
              {item.role === 'admin' ? 'Admin' : item.role === 'moderator' ? 'Moderator' : 'Member'} • Joined{' '}
              {new Date(item.joinedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {showActions && (
          <TouchableOpacity
            onPress={() => setSelectedMemberId(selectedMemberId === item.id ? null : item.id)}
            className="ml-2 p-2"
          >
            <Text style={{ color: colors.muted }}>⋯</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMemberActions = ({ item }: { item: GroupMember }) => {
    if (selectedMemberId !== item.id) return null;

    const isCurrentUser = item.userId === String(user?.id);
    const showActions = isAdmin || isCurrentUser;

    if (!showActions) return null;

    return (
      <View
        className="px-4 py-2 flex-row gap-2 bg-gray-100"
        style={{ backgroundColor: colors.surface }}
      >
        {isAdmin && !isCurrentUser && (
          <>
            {item.role !== 'admin' && (
              <TouchableOpacity
                onPress={() => handlePromoteMember(item, 'admin')}
                className="flex-1 py-2 px-3 rounded items-center"
                style={{ backgroundColor: colors.primary }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-xs font-semibold">Make Admin</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleRemoveMember(item)}
              className="flex-1 py-2 px-3 rounded items-center"
              style={{ backgroundColor: '#ef4444' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-xs font-semibold">Remove</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {isCurrentUser && (
          <TouchableOpacity
            onPress={() => handleRemoveMember(item)}
            className="flex-1 py-2 px-3 rounded items-center"
            style={{ backgroundColor: '#ef4444' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-xs font-semibold">Leave</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text style={{ color: colors.muted }}>No members</Text>
          </View>
        }
      />
    </View>
  );
}
