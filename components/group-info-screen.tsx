/**
 * Group Info & Settings Screen
 * Displays group information and allows admins to manage settings
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useGroupChat } from '@/lib/group-chat-provider';
import { useFirebaseAuth as useAuth } from '@/lib/firebase-auth-provider';
import { useColors } from '@/hooks/use-colors';
import { GroupChat } from '@/lib/types/group-chat';
import * as Haptics from 'expo-haptics';

interface GroupInfoScreenProps {
  group: GroupChat;
  onClose?: () => void;
  onGroupUpdated?: () => void;
}

export function GroupInfoScreen({
  group,
  onClose,
  onGroupUpdated,
}: GroupInfoScreenProps) {
  const colors = useColors();
  const { user } = useAuth();
  const { updateGroup, toggleArchive, toggleMute, isLoading } = useGroupChat();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.name);
  const [editedDescription, setEditedDescription] = useState(group.description || '');
  const [settings, setSettings] = useState(group.settings);

  const isAdmin = group.members.some(
    (m) => m.userId === String(user?.id) && m.role === 'admin'
  );

  const handleSaveChanges = useCallback(async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Group name cannot be empty');
      return;
    }

    try {
      await updateGroup(group.id, String(user?.id), {
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
        settings,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Group updated successfully');
      setIsEditing(false);
      onGroupUpdated?.();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update group');
    }
  }, [editedName, editedDescription, settings, group.id, user?.id, updateGroup, onGroupUpdated]);

  const handleToggleArchive = useCallback(async () => {
    try {
      await toggleArchive(group.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', group.isArchived ? 'Group unarchived' : 'Group archived');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to toggle archive');
    }
  }, [group.id, group.isArchived, toggleArchive]);

  const handleToggleMute = useCallback(async () => {
    try {
      await toggleMute(group.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', group.isMuted ? 'Notifications unmuted' : 'Notifications muted');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to toggle mute');
    }
  }, [group.id, group.isMuted, toggleMute]);

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
          Group Info
        </Text>
        {isLoading && <ActivityIndicator color={colors.primary} />}
      </View>

      {/* Group Name Section */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
          Group Name
        </Text>
        {isEditing && isAdmin ? (
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Group name"
            placeholderTextColor={colors.muted}
            className="border rounded-lg px-3 py-2"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
            }}
          />
        ) : (
          <Text className="text-lg font-medium" style={{ color: colors.foreground }}>
            {group.name}
          </Text>
        )}
      </View>

      {/* Group Description Section */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-sm font-semibold mb-2" style={{ color: colors.muted }}>
          Description
        </Text>
        {isEditing && isAdmin ? (
          <TextInput
            value={editedDescription}
            onChangeText={setEditedDescription}
            placeholder="Group description"
            placeholderTextColor={colors.muted}
            className="border rounded-lg px-3 py-2"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
            }}
            multiline
            numberOfLines={3}
          />
        ) : (
          <Text
            className="text-base"
            style={{ color: group.description ? colors.foreground : colors.muted }}
          >
            {group.description || 'No description'}
          </Text>
        )}
      </View>

      {/* Group Stats */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
              {group.memberCount}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Members
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
              {new Date(group.createdAt).toLocaleDateString()}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Created
            </Text>
          </View>
        </View>
      </View>

      {/* Settings (Admin Only) */}
      {isAdmin && (
        <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
            Settings
          </Text>

          {/* Allow Members to Add */}
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Allow members to add others</Text>
            <Switch
              value={isEditing ? settings.allowMembersToAdd : group.settings.allowMembersToAdd}
              onValueChange={(value) => {
                if (isEditing) {
                  setSettings({ ...settings, allowMembersToAdd: value });
                }
              }}
              disabled={!isEditing}
            />
          </View>

          {/* Allow Reactions */}
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.foreground }}>Allow reactions</Text>
            <Switch
              value={isEditing ? settings.allowReactions : group.settings.allowReactions}
              onValueChange={(value) => {
                if (isEditing) {
                  setSettings({ ...settings, allowReactions: value });
                }
              }}
              disabled={!isEditing}
            />
          </View>

          {/* Allow Voice Messages */}
          <View className="flex-row items-center justify-between">
            <Text style={{ color: colors.foreground }}>Allow voice messages</Text>
            <Switch
              value={isEditing ? settings.allowVoiceMessages : group.settings.allowVoiceMessages}
              onValueChange={(value) => {
                if (isEditing) {
                  setSettings({ ...settings, allowVoiceMessages: value });
                }
              }}
              disabled={!isEditing}
            />
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
          Actions
        </Text>

        {/* Mute Notifications */}
        <TouchableOpacity
          onPress={handleToggleMute}
          className="py-3 px-3 rounded-lg mb-2 flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface }}
          disabled={isLoading}
        >
          <Text style={{ color: colors.foreground }}>
            {group.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
          </Text>
          <Text style={{ color: colors.muted }}>→</Text>
        </TouchableOpacity>

        {/* Archive Group */}
        <TouchableOpacity
          onPress={handleToggleArchive}
          className="py-3 px-3 rounded-lg flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface }}
          disabled={isLoading}
        >
          <Text style={{ color: colors.foreground }}>
            {group.isArchived ? 'Unarchive Group' : 'Archive Group'}
          </Text>
          <Text style={{ color: colors.muted }}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Edit/Save Buttons */}
      <View className="px-4 py-4 flex-row gap-3">
        {isAdmin && (
          <>
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
                  onPress={() => {
                    setIsEditing(false);
                    setEditedName(group.name);
                    setEditedDescription(group.description || '');
                    setSettings(group.settings);
                  }}
                  className="flex-1 py-3 rounded-lg items-center justify-center border"
                  style={{ borderColor: colors.border }}
                >
                  <Text style={{ color: colors.foreground }} className="font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveChanges}
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
          </>
        )}

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-3 rounded-lg items-center justify-center border"
            style={{ borderColor: colors.border }}
          >
            <Text style={{ color: colors.foreground }} className="font-semibold">
              Close
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
