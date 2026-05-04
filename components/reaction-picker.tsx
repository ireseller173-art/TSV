import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export function ReactionPicker({ visible, onSelect, onClose }: ReactionPickerProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 items-center justify-center"
      >
        <View
          className="bg-surface rounded-2xl p-4 flex-row gap-2 flex-wrap justify-center"
          style={{ maxWidth: "80%" }}
        >
          {EMOJI_REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => {
                onSelect(emoji);
                onClose();
              }}
              className="w-12 h-12 items-center justify-center rounded-lg bg-background"
            >
              <Text className="text-2xl">{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
