/**
 * Contact Item with Badge Counters
 * 
 * Displays contact with unread message and missed call counters
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface ContactItemWithBadgeProps {
  name: string;
  avatar?: string;
  unreadMessages?: number;
  missedCalls?: number;
  isOnline?: boolean;
  onPress?: () => void;
}

export function ContactItemWithBadge({
  name,
  avatar,
  unreadMessages = 0,
  missedCalls = 0,
  isOnline = false,
  onPress,
}: ContactItemWithBadgeProps) {
  const colors = useColors();

  const totalBadges = unreadMessages + missedCalls;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <Text style={{ fontSize: 24 }}>👤</Text>
          </View>
        )}
        {isOnline && <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        {totalBadges > 0 && (
          <View style={styles.badgeContainer}>
            {unreadMessages > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{unreadMessages}</Text>
              </View>
            )}
            {missedCalls > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{missedCalls}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {totalBadges > 0 && (
        <View style={[styles.totalBadge, { backgroundColor: colors.error }]}>
          <Text style={[styles.totalBadgeText, { color: '#fff' }]}>
            {totalBadges > 99 ? '99+' : totalBadges}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  totalBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
