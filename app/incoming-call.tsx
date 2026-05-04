import { View, Text, TouchableOpacity, Image, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCall } from "@/lib/call-provider";
import Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function IncomingCallScreen() {
  const colors = useColors();
  const { currentCall, acceptCall, rejectCall } = useCall();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for accept button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  // Haptic feedback
  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  if (!currentCall) {
    return null;
  }

  const handleAccept = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    acceptCall();
  };

  const handleReject = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    rejectCall();
  };

  return (
    <ScreenContainer
      className="flex-1 items-center justify-center gap-8"
      edges={["top", "bottom", "left", "right"]}
    >
      {/* Caller Info */}
      <View className="items-center gap-4">
        <Image
          source={{ uri: currentCall.callerAvatar }}
          className="w-32 h-32 rounded-full border-4 border-primary"
        />
        <View className="items-center gap-2">
          <Text className="text-3xl font-bold text-foreground">
            {currentCall.callerName}
          </Text>
          <Text className="text-base text-muted">Calling...</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-8">
        {/* Reject Button */}
        <TouchableOpacity
          onPress={handleReject}
          className="bg-error rounded-full w-20 h-20 items-center justify-center"
        >
          <IconSymbol name="phone.fill" size={32} color="white" />
        </TouchableOpacity>

        {/* Accept Button */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <TouchableOpacity
            onPress={handleAccept}
            className="bg-success rounded-full w-20 h-20 items-center justify-center"
          >
            <IconSymbol name="phone.fill" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Ringing indicator */}
      <View className="flex-row gap-2">
        <View className="w-2 h-2 rounded-full bg-accent" />
        <View className="w-2 h-2 rounded-full bg-accent" />
        <View className="w-2 h-2 rounded-full bg-accent" />
      </View>
    </ScreenContainer>
  );
}
