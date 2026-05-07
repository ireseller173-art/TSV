import React from 'react';
import { View, Text } from 'react-native';
import { messageStatusService, MessageStatus } from '@/lib/message-status-service';
import { useColors } from '@/hooks/use-colors';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  readBy?: string[];
  isOwn?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Message Status Indicator Component
 * Shows delivery and read status of messages
 */
export function MessageStatusIndicator({
  status,
  readBy = [],
  isOwn = false,
  size = 'small',
}: MessageStatusIndicatorProps) {
  const colors = useColors();

  if (!isOwn) {
    return null; // Only show status for own messages
  }

  const sizeMap = {
    small: { fontSize: 12, marginLeft: 4 },
    medium: { fontSize: 14, marginLeft: 6 },
    large: { fontSize: 16, marginLeft: 8 },
  };

  const statusColors = {
    sending: colors.muted,
    sent: colors.muted,
    delivered: colors.primary,
    read: colors.primary,
  };

  const icon = messageStatusService.getStatusIcon(status);
  const label = messageStatusService.getStatusLabel(status);
  const color = statusColors[status];

  return (
    <View className="flex-row items-center gap-1">
      <Text
        style={{
          fontSize: sizeMap[size].fontSize,
          color,
          marginLeft: sizeMap[size].marginLeft,
        }}
      >
        {icon}
      </Text>
      {size !== 'small' && (
        <Text
          style={{
            fontSize: sizeMap[size].fontSize,
            color,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      {status === 'read' && readBy && readBy.length > 0 && size === 'large' && (
        <Text
          style={{
            fontSize: sizeMap[size].fontSize - 2,
            color: colors.muted,
          }}
          numberOfLines={1}
        >
          ({readBy.length})
        </Text>
      )}
    </View>
  );
}
