/**
 * Missed Call Item Component
 * 
 * Displays a missed call in the chat history
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface MissedCallItemProps {
  callerName: string;
  timestamp: number;
  duration?: number;
}

export function MissedCallItem({ callerName, timestamp, duration }: MissedCallItemProps) {
  const colors = useColors();

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.error }]}>
          📞 Пропущенный звонок
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {callerName}
        </Text>
      </View>
      <Text style={[styles.time, { color: colors.muted }]}>
        {formatTime(timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
});
