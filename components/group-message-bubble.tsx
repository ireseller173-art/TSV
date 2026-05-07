/**
 * Group Message Bubble Component
 * Displays a message in a group chat with sender info and reactions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { GroupChatMessage } from '@/lib/types/group-chat';
import * as Haptics from 'expo-haptics';

interface GroupMessageBubbleProps {
  message: GroupChatMessage;
  isCurrentUser: boolean;
  onReactionPress?: (emoji: string) => void;
  onLongPress?: () => void;
}

export function GroupMessageBubble({
  message,
  isCurrentUser,
  onReactionPress,
  onLongPress,
}: GroupMessageBubbleProps) {
  const colors = useColors();
  const [showReactions, setShowReactions] = useState(false);

  const messageTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const reactionEmojis = Object.entries(message.reactions).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
  }));

  const handleReactionPress = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReactionPress?.(emoji);
    setShowReactions(false);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  return (
    <View
      className={`px-4 py-2 flex-row ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <TouchableOpacity
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        className={`max-w-xs ${isCurrentUser ? 'items-end' : 'items-start'}`}
      >
        {/* Sender Name (for received messages) */}
        {!isCurrentUser && (
          <Text
            className="text-xs font-semibold mb-1"
            style={{ color: colors.primary }}
          >
            {message.senderName}
          </Text>
        )}

        {/* Message Bubble */}
        <View
          className={`rounded-2xl px-4 py-2 ${
            isCurrentUser
              ? 'rounded-br-none'
              : 'rounded-bl-none'
          }`}
          style={{
            backgroundColor: isCurrentUser
              ? colors.primary
              : colors.surface,
          }}
        >
          {/* Reply Quote (if applicable) */}
          {message.replyTo && (
            <View
              className="mb-2 pl-2 border-l-2 py-1"
              style={{ borderLeftColor: isCurrentUser ? 'rgba(255,255,255,0.5)' : colors.primary }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.primary,
                }}
              >
                {message.replyTo.senderName}
              </Text>
              <Text
                className="text-xs"
                style={{
                  color: isCurrentUser ? 'rgba(255,255,255,0.8)' : colors.muted,
                }}
                numberOfLines={1}
              >
                {message.replyTo.content}
              </Text>
            </View>
          )}

          {/* Message Content */}
          <Text
            className="text-base"
            style={{
              color: isCurrentUser ? 'white' : colors.foreground,
            }}
          >
            {message.content}
          </Text>

          {/* Message Time and Status */}
          <View className="flex-row items-center justify-end mt-1 gap-1">
            <Text
              className="text-xs"
              style={{
                color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.muted,
              }}
            >
              {messageTime}
            </Text>

            {/* Status Indicator */}
            {isCurrentUser && (
              <Text
                className="text-xs"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {message.status === 'sending'
                  ? '⏱'
                  : message.status === 'sent'
                    ? '✓'
                    : message.status === 'delivered'
                      ? '✓✓'
                      : '✓✓'}
              </Text>
            )}
          </View>
        </View>

        {/* Reactions */}
        {reactionEmojis.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-1 flex-row gap-1"
          >
            {reactionEmojis.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleReactionPress(reaction.emoji)}
                className="px-2 py-1 rounded-full flex-row items-center gap-1"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm">{reaction.emoji}</Text>
                {reaction.count > 1 && (
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: colors.muted }}
                  >
                    {reaction.count}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Add Reaction Button */}
        <TouchableOpacity
          onPress={() => setShowReactions(!showReactions)}
          className="mt-1 px-2 py-1"
        >
          <Text className="text-lg">😊</Text>
        </TouchableOpacity>

        {/* Reaction Picker */}
        {showReactions && (
          <View
            className="mt-2 p-2 rounded-lg flex-row flex-wrap gap-2"
            style={{ backgroundColor: colors.surface }}
          >
            {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '✨'].map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReactionPress(emoji)}
                className="w-8 h-8 items-center justify-center"
              >
                <Text className="text-lg">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
