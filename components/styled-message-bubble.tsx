/**
 * Styled Message Bubble Component
 * 
 * Displays messages with different styling for sent (right) and received (left)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface StyledMessageBubbleProps {
  content: string;
  isSent: boolean;
  senderName?: string;
  timestamp?: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  onPress?: () => void;
  onLongPress?: () => void;
}

export function StyledMessageBubble({
  content,
  isSent,
  senderName,
  timestamp,
  status,
  onPress,
  onLongPress,
}: StyledMessageBubbleProps) {
  const colors = useColors();

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (st?: string) => {
    switch (st) {
      case 'sending':
        return '⏱';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓'; // Blue checkmarks would be shown with different color
      default:
        return '';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.container,
        isSent ? styles.sentContainer : styles.receivedContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSent
            ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
        ]}
      >
        {!isSent && senderName && (
          <Text
            style={[
              styles.senderName,
              { color: colors.primary, fontSize: 12, fontWeight: '600' },
            ]}
          >
            {senderName}
          </Text>
        )}

        <Text
          style={[
            styles.content,
            { color: isSent ? '#fff' : colors.foreground },
          ]}
        >
          {content}
        </Text>

        <View style={styles.footer}>
          <Text
            style={[
              styles.timestamp,
              { color: isSent ? 'rgba(255,255,255,0.7)' : colors.muted },
              { fontSize: 11 },
            ]}
          >
            {formatTime(timestamp)}
          </Text>

          {isSent && (
            <Text
              style={[
                styles.status,
                { color: status === 'read' ? '#4FC3F7' : 'rgba(255,255,255,0.7)' },
                { fontSize: 11, marginLeft: 4 },
              ]}
            >
              {getStatusIcon(status)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    flexDirection: 'row',
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    marginTop: 4,
  },
  status: {
    marginTop: 4,
  },
});
