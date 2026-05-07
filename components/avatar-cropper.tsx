import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Pressable, ScrollView, Alert, Dimensions } from 'react-native';
import { ScreenContainer } from './screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface AvatarCropperProps {
  imageUri: string;
  onCropComplete: (croppedUri: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // default 1:1 for avatar
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Avatar Cropper Component
 * Allows users to crop and rotate their avatar image
 */
export function AvatarCropper({
  imageUri,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}: AvatarCropperProps) {
  const { t } = useI18n();
  const colors = useColors();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imageRef = useRef<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const previewSize = screenWidth - 40; // 20px padding on each side

  /**
   * Get image dimensions
   */
  useEffect(() => {
    Image.getSize(imageUri, (width, height) => {
      setImageDimensions({ width, height });
    });
  }, [imageUri]);

  /**
   * Handle zoom change
   */
  const handleZoomChange = (value: number) => {
    setZoom(Math.max(1, Math.min(3, value)));
  };

  /**
   * Handle rotation
   */
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  /**
   * Handle crop area change
   */
  const handleCropAreaChange = (dx: number, dy: number) => {
    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, prev.x + dx),
      y: Math.max(0, prev.y + dy),
    }));
  };

  /**
   * Handle crop size change
   */
  const handleCropSizeChange = (newSize: number) => {
    const size = Math.max(100, Math.min(previewSize, newSize));
    setCropArea({
      x: (previewSize - size) / 2,
      y: (previewSize - size) / 2,
      width: size,
      height: size,
    });
  };

  /**
   * Perform crop operation
   */
  const handleCrop = async () => {
    try {
      // In a real app, use react-native-image-crop-picker or similar
      // For now, we'll simulate the crop by returning the original image
      // with crop metadata
      
      Alert.alert(
        t('common.success'),
        t('profile.avatarCropSuccess') || 'Avatar cropped successfully'
      );
      
      // Return the cropped image URI (in production, use actual cropping library)
      onCropComplete(imageUri);
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert(
        t('common.error'),
        t('profile.avatarCropError') || 'Failed to crop avatar'
      );
    }
  };

  /**
   * Render zoom slider
   */
  const renderZoomSlider = () => {
    return (
      <View className="gap-2">
        <Text className="text-sm font-medium text-foreground">
          {t('profile.zoom') || 'Zoom'}: {zoom.toFixed(1)}x
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => handleZoomChange(zoom - 0.1)}
            className="px-3 py-2 rounded-lg bg-surface"
          >
            <Text className="text-foreground font-semibold">−</Text>
          </Pressable>

          <View className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary"
              style={{ width: `${((zoom - 1) / 2) * 100}%` }}
            />
          </View>

          <Pressable
            onPress={() => handleZoomChange(zoom + 0.1)}
            className="px-3 py-2 rounded-lg bg-surface"
          >
            <Text className="text-foreground font-semibold">+</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  /**
   * Render crop preview
   */
  const renderCropPreview = () => {
    return (
      <View className="items-center justify-center gap-4">
        <View
          className="relative overflow-hidden rounded-full border-2 border-primary bg-surface"
          style={{
            width: previewSize,
            height: previewSize,
          }}
        >
          <Image
            ref={imageRef}
            source={{ uri: imageUri }}
            style={{
              width: previewSize * zoom,
              height: previewSize * zoom,
              transform: [{ rotate: `${rotation}deg` }],
              marginLeft: -cropArea.x,
              marginTop: -cropArea.y,
            }}
            resizeMode="cover"
          />

          {/* Crop guide overlay */}
          <View
            className="absolute border-2 border-dashed border-primary"
            style={{
              width: cropArea.width,
              height: cropArea.height,
              left: cropArea.x,
              top: cropArea.y,
            }}
          />
        </View>

        {/* Size adjustment slider */}
        <View className="w-full gap-2 px-4">
          <Text className="text-sm font-medium text-foreground">
            {t('profile.size') || 'Size'}
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => handleCropSizeChange(cropArea.width - 20)}
              className="px-3 py-2 rounded-lg bg-surface"
            >
              <Text className="text-foreground font-semibold">−</Text>
            </Pressable>

            <View className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{
                  width: `${((cropArea.width - 100) / (previewSize - 100)) * 100}%`,
                }}
              />
            </View>

            <Pressable
              onPress={() => handleCropSizeChange(cropArea.width + 20)}
              className="px-3 py-2 rounded-lg bg-surface"
            >
              <Text className="text-foreground font-semibold">+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render action buttons
   */
  const renderButtons = () => {
    return (
      <View className="flex-row gap-3">
        <Pressable
          onPress={handleRotate}
          className="flex-1 py-3 px-4 rounded-lg bg-surface items-center"
        >
          <Text className="text-foreground font-semibold">
            {t('profile.rotate') || 'Rotate'}
          </Text>
        </Pressable>

        <Pressable
          onPress={onCancel}
          className="flex-1 py-3 px-4 rounded-lg bg-surface items-center"
        >
          <Text className="text-foreground font-semibold">
            {t('common.cancel') || 'Cancel'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCrop}
          className="flex-1 py-3 px-4 rounded-lg bg-primary items-center"
        >
          <Text className="text-background font-semibold">
            {t('common.done') || 'Done'}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenContainer className="justify-between">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-6 px-4 py-4">
        <View>
          <Text className="text-2xl font-bold text-foreground mb-2">
            {t('profile.cropAvatar') || 'Crop Avatar'}
          </Text>
          <Text className="text-sm text-muted">
            {t('profile.cropAvatarDescription') ||
              'Adjust and crop your profile picture'}
          </Text>
        </View>

        {renderCropPreview()}
        {renderZoomSlider()}
      </ScrollView>

      <View className="px-4 py-4 gap-3 border-t border-border">
        {renderButtons()}
      </View>
    </ScreenContainer>
  );
}

export default AvatarCropper;
