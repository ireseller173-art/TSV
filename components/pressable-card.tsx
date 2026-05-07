import React, { useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface PressableCardProps {
  onPress?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  showGlow?: boolean;
  glowColor?: string;
}

export function PressableCard({
  onPress,
  children,
  disabled = false,
  style,
  showGlow = true,
  glowColor,
}: PressableCardProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.1);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);

    // Scale animation
    scale.value = withTiming(0.97, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });

    // Shadow increase
    shadowOpacity.value = withTiming(0.3, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });

    // Glow effect
    if (showGlow) {
      glowOpacity.value = withTiming(1, {
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

    // Shadow back
    shadowOpacity.value = withTiming(0.1, {
      duration: 150,
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowOpacity: shadowOpacity.value,
  }));

  const effectiveGlowColor = glowColor || colors.primary;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animatedStyle, shadowStyle]}>
        {/* Glow effect */}
        {showGlow && (
          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                inset: -4,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: effectiveGlowColor,
                opacity: 0.4,
              },
            ]}
          />
        )}

        {/* Card content */}
        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              shadowColor: effectiveGlowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowRadius: 8,
              elevation: 4,
            },
            style,
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}
