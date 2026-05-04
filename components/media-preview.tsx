import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { VideoView } from "expo-video";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { MediaFile, mediaService } from "@/lib/media-service";
import { useState } from "react";

interface MediaPreviewProps {
  visible: boolean;
  media: MediaFile | null;
  caption: string;
  onCaptionChange: (text: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isSending?: boolean;
}

export function MediaPreview({
  visible,
  media,
  caption,
  onCaptionChange,
  onSend,
  onCancel,
  isSending,
}: MediaPreviewProps) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  if (!media) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={onCancel} disabled={isSending}>
            <Text className="text-base text-primary font-semibold">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Preview</Text>
          <TouchableOpacity onPress={onSend} disabled={isSending || !caption.trim()}>
            <Text
              className={`text-base font-semibold ${
                isSending || !caption.trim() ? "text-muted" : "text-primary"
              }`}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>

        {/* Media Preview */}
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center bg-black/5">
            {media.type === "image" ? (
              <Image
                source={{ uri: media.uri }}
                className="w-full h-96 rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-96 rounded-lg bg-black items-center justify-center gap-4">
                <IconSymbol name="play.circle.fill" size={64} color="white" />
                <Text className="text-white font-semibold">Video Preview</Text>
                <Text className="text-white/60 text-sm">{media.fileName}</Text>
              </View>
            )}
          </View>

          {/* Media Info */}
          <View className="px-4 py-3 gap-2 border-t border-border">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">File size</Text>
              <Text className="text-sm text-foreground font-semibold">
                {mediaService.formatFileSize(media.fileSize)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Type</Text>
              <Text className="text-sm text-foreground font-semibold capitalize">
                {media.type}
              </Text>
            </View>
            {media.width && media.height && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Dimensions</Text>
                <Text className="text-sm text-foreground font-semibold">
                  {media.width} × {media.height}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Caption Input */}
        <View className="px-4 py-3 gap-3 border-t border-border">
          <Text className="text-sm font-semibold text-foreground">Add a caption</Text>
          <View className="bg-surface border border-border rounded-lg px-4 py-3">
            <TextInput
              placeholder="Type a caption..."
              placeholderTextColor={colors.muted}
              value={caption}
              onChangeText={onCaptionChange}
              multiline
              maxLength={500}
              style={{
                color: colors.foreground,
                maxHeight: 100,
              }}
            />
          </View>
          <Text className="text-xs text-muted text-right">
            {caption.length}/500
          </Text>
        </View>

        {/* Send Button */}
        <View className="px-4 py-4 gap-3 border-t border-border">
          <TouchableOpacity
            onPress={onSend}
            disabled={isSending || !caption.trim()}
            className={`rounded-lg py-3 items-center justify-center flex-row gap-2 ${
              isSending || !caption.trim()
                ? "bg-muted/30"
                : "bg-primary"
            }`}
          >
            {isSending ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-semibold">Sending...</Text>
              </>
            ) : (
              <>
                <IconSymbol name="paperplane.fill" size={18} color="white" />
                <Text className="text-white font-semibold">Send Media</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


