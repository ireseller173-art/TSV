import { useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export interface TactileFeedbackOptions {
  scale?: number;
  duration?: number;
  hapticType?: 'light' | 'medium' | 'heavy';
  enableHaptic?: boolean;
  enableNeon?: boolean;
}

export function useTactileFeedback(options: TactileFeedbackOptions = {}) {
  const {
    scale = 0.95,
    duration = 100,
    hapticType = 'light',
    enableHaptic = true,
    enableNeon = true,
  } = options;

  const [scaleValue] = useState(new Animated.Value(1));
  const [glowOpacity] = useState(new Animated.Value(0));
  const [isPressed, setIsPressed] = useState(false);

  const triggerHaptic = useCallback(async () => {
    if (!enableHaptic || Platform.OS === 'web') return;

    try {
      switch (hapticType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.warn('Haptic feedback error:', error);
    }
  }, [enableHaptic, hapticType]);

  const onPressIn = useCallback(async () => {
    setIsPressed(true);
    await triggerHaptic();

    // Scale animation
    Animated.timing(scaleValue, {
      toValue: scale,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Neon glow animation
    if (enableNeon) {
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [scale, duration, triggerHaptic, scaleValue, glowOpacity, enableNeon]);

  const onPressOut = useCallback(() => {
    setIsPressed(false);

    // Scale back to normal
    Animated.timing(scaleValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Fade neon glow
    if (enableNeon) {
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: duration * 2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [duration, scaleValue, glowOpacity, enableNeon]);

  return {
    scaleValue,
    glowOpacity,
    isPressed,
    onPressIn,
    onPressOut,
  };
}
