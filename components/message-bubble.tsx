import { View, Text, TouchableOpacity, Image } from "react-native";
import { Message } from "@/lib/chat-service";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReaction?: (emoji: string) => void;
  onDelete?: () => void;
  onReply?: () => void;
}

export function MessageBubble({
  message,
  isOwn,
  onReaction,
  onDelete,
  onReply,
}: MessageBubbleProps) {
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
        <Image source={{ uri: message.senderAvatar }} className="w-8 h-8 rounded-full" />
      )}

      <View className={`max-w-xs gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name for group chats */}
        {!isOwn && (
          <Text className="text-xs text-muted px-3 pt-1">{message.senderName}</Text>
        )}

        {/* Message bubble */}
        <TouchableOpacity
          onLongPress={() => {
            // Show action menu
          }}
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary"
              : "bg-surface border border-border"
          }`}
        >
          <Text
            className={`text-base ${
              isOwn ? "text-white" : "text-foreground"
            }`}
          >
            {message.text}
          </Text>
        </TouchableOpacity>

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

        {/* Reactions */}
        {Object.keys(message.reactions).length > 0 && (
          <View className="flex-row gap-1 mt-1 flex-wrap">
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <TouchableOpacity
                key={emoji}
                className="bg-surface border border-border rounded-full px-2 py-1 flex-row items-center gap-1"
              >
                <Text className="text-sm">{emoji}</Text>
                <Text className="text-xs text-muted">{users.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
