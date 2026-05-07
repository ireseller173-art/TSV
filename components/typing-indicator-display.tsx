import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface TypingIndicatorDisplayProps {
  isTyping: boolean;
  userName?: string;
  userCount?: number;
}

/**
 * Typing Indicator Display Component
 * Shows animated dots when user is typing
 */
export function TypingIndicatorDisplay({
  isTyping,
  userName = 'User',
  userCount = 1,
}: TypingIndicatorDisplayProps) {
  const colors = useColors();
  const [dot1Opacity] = useState(new Animated.Value(0.3));
  const [dot2Opacity] = useState(new Animated.Value(0.3));
  const [dot3Opacity] = useState(new Animated.Value(0.3));

  useEffect(() => {
    if (!isTyping) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(dot1Opacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isTyping, dot1Opacity, dot2Opacity, dot3Opacity]);

  if (!isTyping) {
    return null;
  }

  const typingText =
    userCount === 1
      ? `${userName} is typing`
      : `${userCount} people are typing`;

  return (
    <View className="flex-row items-center gap-2 py-2 px-4">
      <Text className="text-sm text-muted flex-1">{typingText}</Text>
      <View className="flex-row gap-1">
        <Animated.Text
          style={{
            opacity: dot1Opacity,
            fontSize: 12,
            color: colors.primary,
          }}
        >
          •
        </Animated.Text>
        <Animated.Text
          style={{
            opacity: dot2Opacity,
            fontSize: 12,
            color: colors.primary,
          }}
        >
          •
        </Animated.Text>
        <Animated.Text
          style={{
            opacity: dot3Opacity,
            fontSize: 12,
            color: colors.primary,
          }}
        >
          •
        </Animated.Text>
      </View>
    </View>
  );
}
