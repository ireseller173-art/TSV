import { View, Text, Image, TouchableOpacity } from "react-native";
import { MediaMessage } from "@/lib/media-service";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface MediaMessageBubbleProps {
  message: MediaMessage;
  isOwn: boolean;
  onPress?: () => void;
}

export function MediaMessageBubble({
  message,
  isOwn,
  onPress,
}: MediaMessageBubbleProps) {
  const colors = useColors();

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return "⏱";
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "";
    }
  };

  return (
    <View className={`flex-row gap-2 px-4 py-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <Image
          source={{ uri: message.senderAvatar }}
          className="w-8 h-8 rounded-full"
        />
      )}

      <View className={`max-w-xs gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name for group chats */}
        {!isOwn && (
          <Text className="text-xs text-muted px-3 pt-1">{message.senderName}</Text>
        )}

        {/* Media Container */}
        <TouchableOpacity
          onPress={onPress}
          className={`rounded-2xl overflow-hidden ${
            isOwn ? "bg-primary" : "bg-surface border border-border"
          }`}
        >
          {message.media.type === "image" ? (
            <Image
              source={{ uri: message.media.uri }}
              className="w-48 h-48"
              resizeMode="cover"
            />
          ) : (
            <View className="w-48 h-48 bg-black items-center justify-center gap-2">
              <IconSymbol name="play.circle.fill" size={48} color="white" />
              <Text className="text-white text-xs">{message.media.fileName}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        {message.caption && (
          <View
            className={`rounded-lg px-3 py-2 ${
              isOwn ? "bg-primary/80" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-sm ${isOwn ? "text-white" : "text-foreground"}`}
            >
              {message.caption}
            </Text>
          </View>
        )}

        {/* Message metadata */}
        <View className={`flex-row gap-1 items-center px-2 ${isOwn ? "flex-row-reverse" : ""}`}>
          <Text className="text-xs text-muted">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isOwn && (
            <Text
              className={`text-xs ${
                message.status === "read" ? "text-primary" : "text-muted"
              }`}
            >
              {getStatusIcon()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
