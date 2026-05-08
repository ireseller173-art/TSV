/**
 * Group Creation Screen
 * Allows users to create a new group chat with member selection
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useGroupChat } from '@/lib/group-chat-provider';
import { useFirebaseAuth as useAuth } from '@/lib/firebase-auth-provider';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Haptics from 'expo-haptics';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface GroupCreationScreenProps {
  contacts: Contact[];
  onGroupCreated?: () => void;
  onClose?: () => void;
}

export function GroupCreationScreen({
  contacts,
  onGroupCreated,
  onClose,
}: GroupCreationScreenProps) {
  const colors = useColors();
  const { user } = useAuth();
  const { createGroup, isLoading } = useGroupChat();

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = useCallback((contactId: string) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedMembers.size === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      await createGroup(String(user.id), {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        memberIds: Array.from(selectedMembers),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Group created successfully');
      setGroupName('');
      setGroupDescription('');
      setSelectedMembers(new Set());
      onGroupCreated?.();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create group');
    }
  }, [groupName, groupDescription, selectedMembers, user, createGroup, onGroupCreated]);

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isSelected = selectedMembers.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => toggleMember(item.id)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
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
            <Text
              className="ml-3 flex-1 font-medium"
              style={{ color: colors.foreground }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>

          {/* Checkbox */}
          <View
            className={cn(
              'w-6 h-6 rounded border-2 items-center justify-center',
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300'
            )}
            style={
              isSelected
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { borderColor: colors.border }
            }
          >
            {isSelected && (
              <Text className="text-white font-bold">✓</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
            New Group
          </Text>
          {isLoading && <ActivityIndicator color={colors.primary} />}
        </View>

        {/* Group Name Input */}
        <TextInput
          placeholder="Group name"
          value={groupName}
          onChangeText={setGroupName}
          placeholderTextColor={colors.muted}
          className="border rounded-lg px-3 py-2 mb-2"
          style={{
            borderColor: colors.border,
            color: colors.foreground,
          }}
          editable={!isLoading}
        />

        {/* Group Description Input */}
        <TextInput
          placeholder="Group description (optional)"
          value={groupDescription}
          onChangeText={setGroupDescription}
          placeholderTextColor={colors.muted}
          className="border rounded-lg px-3 py-2"
          style={{
            borderColor: colors.border,
            color: colors.foreground,
          }}
          editable={!isLoading}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
        <TextInput
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.muted}
          className="border rounded-lg px-3 py-2"
          style={{
            borderColor: colors.border,
            color: colors.foreground,
          }}
          editable={!isLoading}
        />
        <Text className="text-sm mt-2" style={{ color: colors.muted }}>
          Selected: {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text style={{ color: colors.muted }}>
              {searchQuery ? 'No contacts found' : 'No contacts available'}
            </Text>
          </View>
        }
      />

      {/* Footer Buttons */}
      <View
        className="px-4 py-4 border-t flex-row gap-3"
        style={{ borderTopColor: colors.border }}
      >
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-3 rounded-lg items-center justify-center border"
          style={{ borderColor: colors.border }}
          disabled={isLoading}
        >
          <Text style={{ color: colors.foreground }} className="font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateGroup}
          className="flex-1 py-3 rounded-lg items-center justify-center"
          style={{ backgroundColor: colors.primary }}
          disabled={isLoading || groupName.trim().length === 0 || selectedMembers.size === 0}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
