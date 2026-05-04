import { View, TouchableOpacity, Text, Modal, ActivityIndicator } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { mediaService, MediaFile } from "@/lib/media-service";
import { useState } from "react";
import Haptics from "expo-haptics";
import { Platform } from "react-native";

interface MediaPickerProps {
  visible: boolean;
  onMediaSelected: (media: MediaFile) => void;
  onCancel: () => void;
}

export function MediaPicker({ visible, onMediaSelected, onCancel }: MediaPickerProps) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const media = await mediaService.pickImage();
      if (media) {
        onMediaSelected(media);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickVideo = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const media = await mediaService.pickVideo();
      if (media) {
        onMediaSelected(media);
      }
    } catch (error) {
      console.error("Error picking video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const media = await mediaService.takePhoto();
      if (media) {
        onMediaSelected(media);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 items-end justify-end">
        <View className="w-full bg-surface rounded-t-3xl gap-4 p-6 pb-8">
          {/* Header */}
          <View className="items-center gap-2 pb-4 border-b border-border">
            <View className="w-12 h-1 bg-border rounded-full" />
            <Text className="text-lg font-semibold text-foreground">Share Media</Text>
          </View>

          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-4">Loading...</Text>
            </View>
          ) : (
            <>
              {/* Take Photo */}
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center gap-4 bg-background rounded-lg p-4"
              >
                <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                  <IconSymbol name="camera.fill" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Take Photo</Text>
                  <Text className="text-sm text-muted">Use your camera</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              {/* Pick Image */}
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center gap-4 bg-background rounded-lg p-4"
              >
                <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                  <IconSymbol name="photo.fill" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Pick Image</Text>
                  <Text className="text-sm text-muted">From your library</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              {/* Pick Video */}
              <TouchableOpacity
                onPress={handlePickVideo}
                className="flex-row items-center gap-4 bg-background rounded-lg p-4"
              >
                <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                  <IconSymbol name="play.circle.fill" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">Pick Video</Text>
                  <Text className="text-sm text-muted">From your library</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onCancel}
                className="bg-error/10 rounded-lg py-3 items-center justify-center mt-2"
              >
                <Text className="text-error font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
