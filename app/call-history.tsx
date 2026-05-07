import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { callService, CallHistory } from "@/lib/call-service";

export default function CallHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setIsLoading(true);
      const history = await callService.getCallHistory();
      // Sort by most recent first
      const sorted = history.sort((a, b) => b.startTime - a.startTime);
      setCallHistory(sorted);
    } catch (error) {
      console.error("Failed to load call history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case "incoming":
        return "arrow.down.left";
      case "outgoing":
        return "arrow.up.right";
      case "missed":
        return "phone.fill";
      default:
        return "phone.fill";
    }
  };

  const getCallColor = (type: string) => {
    switch (type) {
      case "incoming":
        return colors.success;
      case "outgoing":
        return colors.primary;
      case "missed":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const renderCallItem = ({ item }: { item: CallHistory }) => (
    <TouchableOpacity
      onPress={() => {
        // Could navigate to contact or start new call
      }}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
    >
      {/* Call Type Icon */}
      <View
        className="rounded-full w-12 h-12 items-center justify-center"
        style={{ backgroundColor: getCallColor(item.type) + "20" }}
      >
        <IconSymbol name={getCallIcon(item.type)} size={20} color={getCallColor(item.type)} />
      </View>

      {/* Call Info */}
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground">
          {item.type === "incoming" ? item.callerName : item.recipientName}
        </Text>
        <Text className="text-xs text-muted">
          {item.type === "missed"
            ? "Missed call"
            : `${formatDuration(item.duration)}`}
        </Text>
      </View>

      {/* Time */}
      <View className="items-end gap-2">
        <Text className="text-xs text-muted">{formatTime(item.startTime)}</Text>
        <TouchableOpacity
          onPress={() => {
            // Start a new call with this contact
          }}
          className="bg-primary rounded-full w-8 h-8 items-center justify-center"
        >
          <IconSymbol name="phone.fill" size={14} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-4 pt-4 gap-4">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Call History</Text>
        </View>
      </View>

      {/* Call List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : callHistory.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <IconSymbol name="phone.fill" size={48} color={colors.muted} />
          <Text className="text-lg text-muted">No calls yet</Text>
          <Text className="text-sm text-muted">Start calling your contacts</Text>
        </View>
      ) : (
        <FlatList
          data={callHistory}
          renderItem={renderCallItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
