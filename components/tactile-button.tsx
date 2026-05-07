import React from 'react';
import { Pressable, Animated, View, Text, type PressableProps } from 'react-native';
import { useTactileFeedback } from '@/hooks/use-tactile-feedback';
import { cn } from '@/lib/utils';

interface TactileButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  neonColor?: string;
}

export function TactileButton({
  label,
  variant = 'primary',
  size = 'medium',
  className,
  neonColor = '#0a7ea4',
  onPress,
  ...props
}: TactileButtonProps) {
  const { scaleValue, glowOpacity, onPressIn, onPressOut } = useTactileFeedback({
    scale: 0.92,
    duration: 100,
    hapticType: 'light',
  });

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-surface border border-border',
    danger: 'bg-error',
  };

  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-6 py-3',
    large: 'px-8 py-4',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        className={cn(
          'rounded-lg items-center justify-center',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Animated.View
          style={{
            opacity: glowOpacity,
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            backgroundColor: neonColor,
          }}
          pointerEvents="none"
        />
        <Text
          className={cn(
            'font-semibold text-foreground',
            textSizeClasses[size]
          )}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
