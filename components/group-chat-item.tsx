/**
 * Group Chat Item Component
 * Displays a group chat in the chat list with group info and last message
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { GroupChat } from '@/lib/types/group-chat';
import * as Haptics from 'expo-haptics';

interface GroupChatItemProps {
  group: GroupChat;
  onPress?: () => void;
  onLongPress?: () => void;
  unreadCount?: number;
}

export function GroupChatItem({
  group,
  onPress,
  onLongPress,
  unreadCount = 0,
}: GroupChatItemProps) {
  const colors = useColors();

  const lastMessageTime = group.lastMessageTime
    ? new Date(group.lastMessageTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      className="px-4 py-3 border-b flex-row items-center"
      style={{ borderBottomColor: colors.border }}
    >
      {/* Group Avatar */}
      <View className="relative">
        {group.avatar ? (
          <Image
            source={{ uri: group.avatar }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
          />
        ) : (
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg">
              {group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Group Badge */}
        <View
          className="absolute bottom-0 right-0 w-5 h-5 rounded-full items-center justify-center border-2"
          style={{ backgroundColor: colors.background, borderColor: colors.primary }}
        >
          <Text className="text-xs font-bold" style={{ color: colors.primary }}>
            👥
          </Text>
        </View>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <View
            className="absolute -top-1 -right-1 rounded-full items-center justify-center min-w-5 px-1"
            style={{ backgroundColor: '#ef4444' }}
          >
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Group Info */}
      <View className="ml-3 flex-1">
        {/* Group Name and Time */}
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="font-bold text-base flex-1"
            style={{ color: colors.foreground }}
            numberOfLines={1}
          >
            {group.name}
          </Text>
          <Text
            className="text-xs ml-2"
            style={{ color: group.isMuted ? colors.muted : colors.foreground }}
          >
            {lastMessageTime}
          </Text>
        </View>

        {/* Last Message Preview */}
        <View className="flex-row items-center">
          <Text
            className="text-sm flex-1"
            style={{
              color: unreadCount > 0 ? colors.foreground : colors.muted,
              fontWeight: unreadCount > 0 ? '600' : '400',
            }}
            numberOfLines={1}
          >
            {group.lastMessageSender && `${group.lastMessageSender}: `}
            {group.lastMessage || 'No messages yet'}
          </Text>

          {/* Muted Icon */}
          {group.isMuted && (
            <Text className="ml-2 text-sm">🔇</Text>
          )}

          {/* Archived Icon */}
          {group.isArchived && (
            <Text className="ml-2 text-sm">📦</Text>
          )}
        </View>

        {/* Member Count */}
        <Text className="text-xs mt-1" style={{ color: colors.muted }}>
          {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
