import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface PressableListItemProps {
  onPress?: () => void;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  showGlow?: boolean;
}

export function PressableListItem({
  onPress,
  children,
  title,
  subtitle,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  showGlow = true,
}: PressableListItemProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);

    // Slight scale
    scale.value = withTiming(0.98, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });

    // Background highlight
    bgOpacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });

    // Glow effect
    if (showGlow) {
      glowOpacity.value = withTiming(0.8, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    }

    // Haptic feedback
    try {
      require('expo-haptics').default.impactAsync(
        require('expo-haptics').ImpactFeedbackStyle.Light
      );
    } catch (e) {
      // Haptics not available
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);

    // Scale back
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });

    // Background fade
    bgOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });

    // Glow fade
    if (showGlow) {
      glowOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle]}>
        {/* Background highlight */}
        <Animated.View
          style={[
            bgStyle,
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: colors.primary,
              borderRadius: 8,
              opacity: 0.1,
            },
          ]}
        />

        {/* Glow effect */}
        {showGlow && (
          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                inset: -2,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.primary,
                opacity: 0.3,
              },
            ]}
          />
        )}

        {/* Content */}
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.surface,
              marginVertical: 4,
              marginHorizontal: 8,
            },
            style,
          ]}
        >
          {/* Left icon */}
          {leftIcon && (
            <View style={{ marginRight: 12 }}>
              {leftIcon}
            </View>
          )}

          {/* Text content */}
          {children ? (
            children
          ) : (
            <View style={{ flex: 1 }}>
              {title && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.foreground,
                  }}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginTop: 2,
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {/* Right icon */}
          {rightIcon && (
            <View style={{ marginLeft: 12 }}>
              {rightIcon}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
