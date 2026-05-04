import { View, Text, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";

interface TypingIndicatorProps {
  userName: string;
}

export function TypingIndicator({ userName }: TypingIndicatorProps) {
  const colors = useColors();
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        ),
      ]);
    };

    Animated.parallel([
      createAnimation(anim1, 0),
      createAnimation(anim2, 150),
      createAnimation(anim3, 300),
    ]).start();
  }, [anim1, anim2, anim3]);

  const dotStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  });

  return (
    <View className="flex-row gap-2 items-center px-4 py-2">
      <Text className="text-xs text-muted">{userName} is typing</Text>
      <View className="flex-row gap-1">
        <Animated.View
          style={dotStyle(anim1)}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <Animated.View
          style={dotStyle(anim2)}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <Animated.View
          style={dotStyle(anim3)}
          className="w-2 h-2 rounded-full bg-primary"
        />
      </View>
    </View>
  );
}
