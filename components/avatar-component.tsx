import React from 'react';
import { View, Image, Text, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarComponentProps {
  userId: string;
  name?: string;
  avatarUrl?: string;
  hasCustomAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  showInitials?: boolean;
  initials?: string;
}

/**
 * Default avatar URL (neutral gray/white profile icon)
 */
const DEFAULT_AVATAR_URL =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663517425800/T5ohxkoZGNmtr9hW5UiVR8/default-avatar-dhBoAcUs5kd5V5GomsKhdC.webp';

/**
 * Get size classes
 */
const getSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'w-8 h-8';
    case 'md':
      return 'w-12 h-12';
    case 'lg':
      return 'w-16 h-16';
    case 'xl':
      return 'w-20 h-20';
    default:
      return 'w-12 h-12';
  }
};

/**
 * Get text size classes
 */
const getTextSizeClasses = (size: string) => {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    case 'lg':
      return 'text-lg';
    case 'xl':
      return 'text-2xl';
    default:
      return 'text-sm';
  }
};

/**
 * Avatar Component
 * Displays user avatar with fallback to default neutral avatar
 */
export function AvatarComponent({
  userId,
  name = 'User',
  avatarUrl,
  hasCustomAvatar = false,
  size = 'md',
  onPress,
  showInitials = false,
  initials,
}: AvatarComponentProps) {
  const displayUrl = hasCustomAvatar && avatarUrl ? avatarUrl : DEFAULT_AVATAR_URL;
  const sizeClasses = getSizeClasses(size);
  const textSizeClasses = getTextSizeClasses(size);

  // Get initials from name
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayInitials = initials || getInitials(name);

  const content = (
    <View className={cn('rounded-full overflow-hidden bg-gray-200', sizeClasses)}>
      {showInitials && !hasCustomAvatar ? (
        <View className="flex-1 items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500">
          <Text className={cn('font-bold text-white', textSizeClasses)}>
            {displayInitials}
          </Text>
        </View>
      ) : (
        <Image
          source={{ uri: displayUrl }}
          className="w-full h-full"
          defaultSource={require('@/assets/images/default-avatar.png')}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}
