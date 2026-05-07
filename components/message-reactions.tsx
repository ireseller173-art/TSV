import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
}

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const colors = useColors();

  const handleReactionPress = (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji);
    if (reaction?.userReacted) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  if (!reactions || reactions.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-2 mb-2"
      contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}
    >
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction.emoji}
          onPress={() => handleReactionPress(reaction.emoji)}
          className={cn(
            "px-2 py-1 rounded-full flex-row items-center gap-1",
            reaction.userReacted
              ? "bg-primary"
              : "bg-surface border border-border"
          )}
        >
          <Text className="text-base">{reaction.emoji}</Text>
          <Text
            className={cn(
              "text-xs font-semibold",
              reaction.userReacted ? "text-background" : "text-foreground"
            )}
          >
            {reaction.count}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Add Reaction Button */}
      {onAddReaction && (
        <TouchableOpacity
          onPress={() => {
            // В реальном приложении здесь будет меню выбора эмодзи
            onAddReaction("👍");
          }}
          className="px-2 py-1 rounded-full bg-surface border border-border items-center justify-center"
        >
          <Text className="text-base">➕</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
