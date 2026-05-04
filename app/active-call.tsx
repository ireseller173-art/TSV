import { View, Text, TouchableOpacity, Image } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useCall } from "@/lib/call-provider";
import Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function ActiveCallScreen() {
  const router = useRouter();
  const colors = useColors();
  const { currentCall, endCall, toggleMute, toggleSpeaker } = useCall();
  const [callDuration, setCallDuration] = useState(0);

  // Update call duration
  useEffect(() => {
    if (!currentCall?.startTime) return;

    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - currentCall.startTime!) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCall?.startTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    endCall();
    router.back();
  };

  const handleToggleMute = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleMute();
  };

  const handleToggleSpeaker = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleSpeaker();
  };

  if (!currentCall) {
    return null;
  }

  return (
    <ScreenContainer
      className="flex-1 items-center justify-between py-8"
      edges={["top", "bottom", "left", "right"]}
    >
      {/* Header with back button */}
      <View className="w-full flex-row items-center px-4">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-foreground">
          Active Call
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Caller Info */}
      <View className="items-center gap-4">
        <Image
          source={{
            uri:
              currentCall.type === "incoming"
                ? currentCall.callerAvatar
                : currentCall.recipientAvatar,
          }}
          className="w-40 h-40 rounded-full border-4 border-primary"
        />
        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-foreground">
            {currentCall.type === "incoming"
              ? currentCall.callerName
              : currentCall.recipientName}
          </Text>
          <Text className="text-lg text-muted font-semibold">
            {formatDuration(callDuration)}
          </Text>
        </View>
      </View>

      {/* Call Controls */}
      <View className="gap-6">
        {/* Primary Controls */}
        <View className="flex-row gap-6 justify-center">
          {/* Mute Button */}
          <TouchableOpacity
            onPress={handleToggleMute}
            className={`rounded-full w-16 h-16 items-center justify-center ${
              currentCall.isMuted ? "bg-error" : "bg-surface border border-border"
            }`}
          >
            <IconSymbol
              name="mic.fill"
              size={24}
              color={currentCall.isMuted ? "white" : colors.foreground}
            />
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            onPress={handleToggleSpeaker}
            className={`rounded-full w-16 h-16 items-center justify-center ${
              currentCall.isSpeakerOn ? "bg-primary" : "bg-surface border border-border"
            }`}
          >
            <IconSymbol
              name="speaker.fill"
              size={24}
              color={currentCall.isSpeakerOn ? "white" : colors.foreground}
            />
          </TouchableOpacity>
        </View>

        {/* End Call Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="bg-error rounded-full w-20 h-20 items-center justify-center self-center"
        >
          <IconSymbol name="phone.fill" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Status Indicator */}
      <View className="flex-row gap-2 items-center">
        <View className="w-2 h-2 rounded-full bg-success" />
        <Text className="text-sm text-muted">Connected</Text>
      </View>
    </ScreenContainer>
  );
}
