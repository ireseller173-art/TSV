import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
// import { WebRTCService } from "@/lib/webrtc-service";
// Используем встроенный WebRTC через React Native
import * as Haptics from "expo-haptics";

export default function CallScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const { contactId, contactName } = params as { contactId: string; contactName: string };

  const [callState, setCallState] = useState<"connecting" | "ringing" | "active" | "ended">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const webrtcServiceRef = useRef<any>(null);

  useEffect(() => {
    initializeCall();
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      endCall();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Инициализируем WebRTC
      // В реальном приложении здесь будет интеграция с WebRTC сервисом
      
      // Имитируем инициализацию
      
      // Отправляем предложение контакту (через Firebase)
      setCallState("ringing");
      
      // Имитируем ответ (в реальном приложении это будет через Firebase)
      setTimeout(async () => {
        setCallState("active");
        startCallTimer();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 3000);
    } catch (error) {
      console.error("Error initializing call:", error);
      Alert.alert("Ошибка", "Не удалось инициализировать звонок");
      router.back();
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const formatCallDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleMute = async () => {
    setIsMuted(!isMuted);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSpeaker = async () => {
    setIsSpeakerOn(!isSpeakerOn);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const endCall = async () => {
    try {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (webrtcServiceRef.current) {
        await webrtcServiceRef.current.closeConnection();
      }
      setCallState("ended");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      // Сохраняем в историю звонков
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error("Error ending call:", error);
      router.back();
    }
  };

  return (
    <ScreenContainer
      className="flex-1 justify-between items-center py-8"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Contact Info */}
      <View className="items-center gap-4">
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <IconSymbol name="person.fill" size={48} color="white" />
        </View>
        
        <Text className="text-3xl font-bold text-foreground">{contactName}</Text>
        
        {callState === "connecting" && (
          <Text className="text-base text-muted">Подключение...</Text>
        )}
        {callState === "ringing" && (
          <Text className="text-base text-muted">Звонит...</Text>
        )}
        {callState === "active" && (
          <Text className="text-2xl font-semibold text-primary">
            {formatCallDuration(callDuration)}
          </Text>
        )}
      </View>

      {/* Call Controls */}
      {callState === "active" && (
        <View className="flex-row gap-6 items-center justify-center">
          {/* Mute Button */}
          <TouchableOpacity
            onPress={toggleMute}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{
              backgroundColor: isMuted ? colors.error : colors.surface,
            }}
          >
            <IconSymbol
              name={isMuted ? "mic.slash.fill" : "mic.fill"}
              size={24}
              color={isMuted ? "white" : colors.foreground}
            />
          </TouchableOpacity>

          {/* Speaker Button */}
          <TouchableOpacity
            onPress={toggleSpeaker}
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{
              backgroundColor: isSpeakerOn ? colors.primary : colors.surface,
            }}
          >
            <IconSymbol
              name={isSpeakerOn ? "speaker.wave.2.fill" : "speaker.fill"}
              size={24}
              color={isSpeakerOn ? "white" : colors.foreground}
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={endCall}
            className="w-16 h-16 rounded-full items-center justify-center bg-error"
          >
            <IconSymbol name="phone.down.fill" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Connecting State */}
      {(callState === "connecting" || callState === "ringing") && (
        <View className="flex-row gap-6 items-center justify-center">
          <TouchableOpacity
            onPress={endCall}
            className="w-16 h-16 rounded-full items-center justify-center bg-error"
          >
            <IconSymbol name="phone.down.fill" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Status Indicator */}
      {callState === "connecting" && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}
    </ScreenContainer>
  );
}
