import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

interface PressableButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showGlow?: boolean;
  haptic?: boolean;
}

export function PressableButton({
  onPress,
  children,
  label,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  showGlow = true,
  haptic = true,
}: PressableButtonProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    
    // Scale animation
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });

    // Glow animation
    if (showGlow) {
      glowOpacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    }

    // Haptic feedback
    if (haptic) {
      try {
        require('expo-haptics').default.impactAsync(
          require('expo-haptics').ImpactFeedbackStyle.Light
        );
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale animation back
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });

    // Glow fade out
    if (showGlow) {
      glowOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Determine colors based on variant
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: colors.background,
          glow: colors.primary,
        };
      case 'secondary':
        return {
          bg: colors.surface,
          text: colors.foreground,
          glow: colors.primary,
        };
      case 'tertiary':
        return {
          bg: 'transparent',
          text: colors.primary,
          glow: colors.primary,
        };
      case 'danger':
        return {
          bg: colors.error,
          text: colors.background,
          glow: colors.error,
        };
      default:
        return {
          bg: colors.primary,
          text: colors.background,
          glow: colors.primary,
        };
    }
  };

  // Determine size
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 6,
          fontSize: 12,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 12,
          fontSize: 16,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          fontSize: 14,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Animated.View style={[animatedStyle]}>
        {/* Glow effect */}
        {showGlow && (
          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                inset: -4,
                backgroundColor: variantColors.glow,
                borderRadius: sizeStyles.borderRadius + 4,
                opacity: 0.15,
                zIndex: -1,
              },
            ]}
          />
        )}

        {/* Button content */}
        <View
          style={[
            {
              backgroundColor: variantColors.bg,
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              borderRadius: sizeStyles.borderRadius,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: variant === 'tertiary' ? 1 : 0,
              borderColor: variant === 'tertiary' ? variantColors.text : 'transparent',
              // Subtle shadow for depth
              shadowColor: variantColors.glow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isPressed ? 0.4 : 0.1,
              shadowRadius: 4,
              elevation: isPressed ? 8 : 2,
            },
            style,
          ]}
        >
          {children ? (
            children
          ) : (
            <Text
              style={[
                {
                  color: variantColors.text,
                  fontSize: sizeStyles.fontSize,
                  fontWeight: '600',
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
