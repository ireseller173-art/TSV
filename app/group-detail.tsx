/**
 * Group Detail Screen - Экран деталей групповой чата
 * Показывает информацию о группе и управление членами
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-provider';
import * as GroupChatService from '@/lib/group-chat-service';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { GroupChat, GroupMember } from '@/lib/types/group-chat';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const { user } = useAuth();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [group, setGroup] = useState<GroupChat | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load group details
  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      if (!groupId) return;

      // Get group details
      const groupData = await GroupChatService.getGroupChat(groupId);
      if (groupData) {
        setGroup(groupData);
        setMembers(groupData.members);

        // Check if current user is admin
        const currentMember = groupData.members.find((m) => m.userId === user?.id);
        setIsAdmin(currentMember?.role === 'admin');
      }
    } catch (error) {
      console.error('Error loading group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId || !isAdmin) return;

    Alert.alert(
      t('confirmRemove') || 'Confirm',
      t('confirmRemoveMember') || 'Remove this member?',
      [
        { text: t('cancel') || 'Cancel', onPress: () => {} },
        {
          text: t('remove') || 'Remove',
          onPress: async () => {
            try {
              await GroupChatService.removeGroupMember(user?.id || '', {
                groupId,
                userId: memberId,
              });
              await loadGroupDetails();
            } catch (error) {
              console.error('Error removing member:', error);
            }
          },
        },
      ]
    );
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    if (!groupId || !isAdmin) return;

    try {
      await GroupChatService.promoteGroupMember(user?.id || '', {
        groupId,
        userId: memberId,
        role: 'admin',
      });
      await loadGroupDetails();
    } catch (error) {
      console.error('Error promoting member:', error);
    }
  };

  const handleDemoteToMember = async (memberId: string) => {
    if (!groupId || !isAdmin) return;

    try {
      // Demote member (no direct function, would need to add)
      console.log('Demote member not yet implemented');
      await loadGroupDetails();
    } catch (error) {
      console.error('Error demoting member:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || !user) return;

    Alert.alert(
      t('leaveGroup') || 'Leave Group',
      t('confirmLeaveGroup') || 'Are you sure you want to leave this group?',
      [
        { text: t('cancel') || 'Cancel', onPress: () => {} },
        {
          text: t('leave') || 'Leave',
          onPress: async () => {
            try {
              await GroupChatService.removeGroupMember(user?.id || '', {
                groupId,
                userId: user?.id || '',
              });
              router.back();
            } catch (error) {
              console.error('Error leaving group:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !isAdmin) return;

    Alert.alert(
      t('deleteGroup') || 'Delete Group',
      t('confirmDeleteGroup') || 'This action cannot be undone.',
      [
        { text: t('cancel') || 'Cancel', onPress: () => {} },
        {
          text: t('delete') || 'Delete',
          onPress: async () => {
            try {
              await GroupChatService.deleteGroupChat(groupId, user?.id || '');
              router.back();
            } catch (error) {
              console.error('Error deleting group:', error);
            }
          },
        },
      ]
    );
  };

  if (loading || !group) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">{t('loading') || 'Loading...'}</Text>
      </ScreenContainer>
    );
  }

  const renderMemberItem = ({ item }: { item: GroupMember }) => {
    const isCurrentUser = item.userId === user?.id;

    return (
      <View
        className="flex-row items-center justify-between p-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center flex-1">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full mr-3 bg-primary items-center justify-center">
              <Text className="text-white font-semibold text-sm">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-foreground font-semibold">
              {item.name}
              {isCurrentUser ? ` (${t('you') || 'You'})` : ''}
            </Text>
            <Text className="text-muted text-xs mt-1">
              {item.role === 'admin' ? t('admin') || 'Admin' : t('member') || 'Member'}
            </Text>
          </View>
        </View>

        {/* Action buttons for admin */}
        {isAdmin && !isCurrentUser && (
          <View className="flex-row gap-2">
            {item.role === 'member' ? (
              <Pressable
                onPress={() => handlePromoteToAdmin(item.userId)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="admin-panel-settings" size={20} color={colors.primary} />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleDemoteToMember(item.userId)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="person" size={20} color={colors.muted} />
              </Pressable>
            )}
            <Pressable
              onPress={() => handleRemoveMember(item.userId)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <MaterialIcons name="delete" size={20} color={colors.error} />
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* Group Header */}
        <View className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
            </Pressable>
            <Text className="text-xl font-bold text-foreground ml-4 flex-1">
              {t('groupInfo') || 'Group Info'}
            </Text>
          </View>

          {/* Group Avatar and Name */}
          <View className="items-center mb-4">
            {group.avatar ? (
              <Image
                source={{ uri: group.avatar }}
                className="w-20 h-20 rounded-full mb-3"
              />
            ) : (
              <View className="w-20 h-20 rounded-full mb-3 bg-primary items-center justify-center">
                <MaterialIcons name="group" size={40} color="white" />
              </View>
            )}
            <Text className="text-2xl font-bold text-foreground">{group.name}</Text>
            {group.description && (
              <Text className="text-sm text-muted mt-2">{group.description}</Text>
            )}
          </View>

          {/* Group Stats */}
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-lg font-semibold text-foreground">{members.length}</Text>
              <Text className="text-xs text-muted">{t('members') || 'Members'}</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-semibold text-foreground">
                {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
              <Text className="text-xs text-muted">{t('created') || 'Created'}</Text>
            </View>
          </View>
        </View>

        {/* Members Section */}
        <View className="mt-4">
          <Text className="text-lg font-semibold text-foreground px-4 mb-2">
            {t('members') || 'Members'} ({members.length})
          </Text>
          <FlatList
            scrollEnabled={false}
            data={members}
            renderItem={renderMemberItem}
            keyExtractor={(item) => item.userId}
          />
        </View>

        {/* Action Buttons */}
        <View className="p-4 gap-3">
          {isAdmin && (
            <Pressable
              onPress={handleDeleteGroup}
              className="bg-error p-3 rounded-lg items-center"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className="text-white font-semibold">
                {t('deleteGroup') || 'Delete Group'}
              </Text>
            </Pressable>
          )}

          {!isAdmin && (
            <Pressable
              onPress={handleLeaveGroup}
              className="bg-error p-3 rounded-lg items-center"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text className="text-white font-semibold">
                {t('leaveGroup') || 'Leave Group'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
