/**
 * Notification Preferences Screen
 * Allows users to customize notification settings
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNotifications } from '@/lib/notification-provider';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

export function NotificationPreferencesScreen() {
  const colors = useColors();
  const { preferences, updatePreferences } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleToggle = useCallback((key: string, value: boolean | string) => {
    if (localPrefs) {
      setLocalPrefs({ ...localPrefs, [key]: value } as any);
    }
  }, [localPrefs]);

  const handleSave = useCallback(async () => {
    if (!localPrefs) return;

    try {
      setIsLoading(true);
      await updatePreferences(localPrefs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Notification preferences updated');
      setIsEditing(false);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  }, [localPrefs, updatePreferences]);

  const handleCancel = useCallback(() => {
    setLocalPrefs(preferences);
    setIsEditing(false);
  }, [preferences]);

  if (!localPrefs) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View
        className="px-4 py-4 border-b flex-row items-center justify-between"
        style={{ borderBottomColor: colors.border }}
      >
        <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
          Notifications
        </Text>
        {isLoading && <ActivityIndicator color={colors.primary} />}
      </View>

      {/* Global Enable/Disable */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              Enable Notifications
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.muted }}>
              Turn off to disable all notifications
            </Text>
          </View>
          <Switch
            value={isEditing ? localPrefs.enabled : preferences?.enabled || false}
            onValueChange={(value) => handleToggle('enabled', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Message Notifications */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Messages
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Direct Messages</Text>
          <Switch
            value={isEditing ? localPrefs.messageNotifications : preferences?.messageNotifications || false}
            onValueChange={(value) => handleToggle('messageNotifications', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }}>Group Messages</Text>
          <Switch
            value={isEditing ? localPrefs.groupMessageNotifications : preferences?.groupMessageNotifications || false}
            onValueChange={(value) => handleToggle('groupMessageNotifications', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Group Notifications */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Groups
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Group Invitations</Text>
          <Switch
            value={isEditing ? localPrefs.groupInviteNotifications : preferences?.groupInviteNotifications || false}
            onValueChange={(value) => handleToggle('groupInviteNotifications', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Group Updates</Text>
          <Switch
            value={isEditing ? localPrefs.groupUpdateNotifications : preferences?.groupUpdateNotifications || false}
            onValueChange={(value) => handleToggle('groupUpdateNotifications', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }}>Member Joined/Left</Text>
          <Switch
            value={isEditing ? localPrefs.memberJoinedNotifications : preferences?.memberJoinedNotifications || false}
            onValueChange={(value) => {
              handleToggle('memberJoinedNotifications', value);
              handleToggle('memberLeftNotifications', value);
            }}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Call Notifications */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Calls
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Incoming Calls</Text>
          <Switch
            value={isEditing ? localPrefs.callNotifications : preferences?.callNotifications || false}
            onValueChange={(value) => handleToggle('callNotifications', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }}>Missed Calls</Text>
          <Switch
            value={isEditing ? localPrefs.missedCallNotifications : preferences?.missedCallNotifications || false}
            onValueChange={(value) => handleToggle('missedCallNotifications', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Interaction Notifications */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Interactions
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Message Reactions</Text>
          <Switch
            value={isEditing ? localPrefs.reactionNotifications : preferences?.reactionNotifications || false}
            onValueChange={(value) => handleToggle('reactionNotifications', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }}>Mentions</Text>
          <Switch
            value={isEditing ? localPrefs.mentionNotifications : preferences?.mentionNotifications || false}
            onValueChange={(value) => handleToggle('mentionNotifications', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Sound and Vibration */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Sound & Vibration
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ color: colors.foreground }}>Sound</Text>
          <Switch
            value={isEditing ? localPrefs.soundEnabled : preferences?.soundEnabled || false}
            onValueChange={(value) => handleToggle('soundEnabled', value)}
            disabled={!isEditing}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text style={{ color: colors.foreground }}>Vibration</Text>
          <Switch
            value={isEditing ? localPrefs.vibrationEnabled : preferences?.vibrationEnabled || false}
            onValueChange={(value) => handleToggle('vibrationEnabled', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Quiet Hours */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            Quiet Hours
          </Text>
          <Switch
            value={isEditing ? localPrefs.quietHoursEnabled : preferences?.quietHoursEnabled || false}
            onValueChange={(value) => handleToggle('quietHoursEnabled', value)}
            disabled={!isEditing}
          />
        </View>

        {(isEditing ? localPrefs.quietHoursEnabled : preferences?.quietHoursEnabled) && (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                From
              </Text>
              <TextInput
                value={isEditing ? localPrefs.quietHoursStart : preferences?.quietHoursStart || ''}
            onChangeText={(value) => {
              if (localPrefs) {
                setLocalPrefs({ ...localPrefs, quietHoursStart: value } as any);
              }
            }}
                placeholder="22:00"
                placeholderTextColor={colors.muted}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: colors.border, color: colors.foreground }}
                editable={isEditing}
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                To
              </Text>
              <TextInput
                value={isEditing ? localPrefs.quietHoursEnd : preferences?.quietHoursEnd || ''}
            onChangeText={(value) => {
              if (localPrefs) {
                setLocalPrefs({ ...localPrefs, quietHoursEnd: value } as any);
              }
            }}
                placeholder="08:00"
                placeholderTextColor={colors.muted}
                className="border rounded-lg px-3 py-2"
                style={{ borderColor: colors.border, color: colors.foreground }}
                editable={isEditing}
              />
            </View>
          </View>
        )}
      </View>

      {/* Badge Count */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              Badge Count
            </Text>
            <Text className="text-sm mt-1" style={{ color: colors.muted }}>
              Show unread count on app icon
            </Text>
          </View>
          <Switch
            value={isEditing ? localPrefs.badgeCountEnabled : preferences?.badgeCountEnabled || false}
            onValueChange={(value) => handleToggle('badgeCountEnabled', value)}
            disabled={!isEditing}
          />
        </View>
      </View>

      {/* Edit/Save Buttons */}
      <View className="px-4 py-4 flex-row gap-3">
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="flex-1 py-3 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold">Edit</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 rounded-lg items-center justify-center border"
              style={{ borderColor: colors.border }}
            >
              <Text style={{ color: colors.foreground }} className="font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              className="flex-1 py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Save</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
