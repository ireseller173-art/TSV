import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, FlatList, Alert, Modal, Dimensions } from 'react-native';
import { ScreenContainer } from './screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface PhotoGalleryItem {
  id: string;
  uri: string;
  timestamp: number;
  caption?: string;
}

interface PhotoGalleryProps {
  userId: string;
  photos: PhotoGalleryItem[];
  onPhotoSelect?: (photo: PhotoGalleryItem) => void;
  onPhotoDelete?: (photoId: string) => void;
  isEditable?: boolean;
}

/**
 * Photo Gallery Component
 * Displays user's photo gallery with preview and management
 */
export function PhotoGallery({
  userId,
  photos,
  onPhotoSelect,
  onPhotoDelete,
  isEditable = false,
}: PhotoGalleryProps) {
  const { t } = useI18n();
  const colors = useColors();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoGalleryItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const photoSize = (screenWidth - 24) / 3; // 3 columns with 4px gap and 8px padding

  /**
   * Handle photo selection
   */
  const handlePhotoPress = (photo: PhotoGalleryItem) => {
    setSelectedPhoto(photo);
    setShowPreview(true);
    onPhotoSelect?.(photo);
  };

  /**
   * Handle photo deletion
   */
  const handlePhotoDelete = (photoId: string) => {
    Alert.alert(
      t('common.confirm') || 'Confirm',
      t('profile.deletePhotoConfirm') || 'Delete this photo?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.delete') || 'Delete',
          onPress: () => {
            onPhotoDelete?.(photoId);
            setShowPreview(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Render photo grid item
   */
  const renderPhotoItem = ({ item }: { item: PhotoGalleryItem }) => {
    return (
      <Pressable
        onPress={() => handlePhotoPress(item)}
        className="rounded-lg overflow-hidden"
        style={{ width: photoSize, height: photoSize }}
      >
        <Image
          source={{ uri: item.uri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {/* Overlay on press */}
        <View className="absolute inset-0 bg-black/20 opacity-0 active:opacity-100" />
      </Pressable>
    );
  };

  /**
   * Render photo preview modal
   */
  const renderPreviewModal = () => {
    if (!selectedPhoto) return null;

    return (
      <Modal
        visible={showPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          {/* Close button */}
          <Pressable
            onPress={() => setShowPreview(false)}
            className="absolute top-4 right-4 z-10 p-2"
          >
            <Text className="text-white text-2xl font-bold">×</Text>
          </Pressable>

          {/* Photo preview */}
          <View className="w-full h-3/4 justify-center items-center">
            <Image
              source={{ uri: selectedPhoto.uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          {/* Photo info */}
          <View className="w-full bg-surface p-4 gap-3">
            {selectedPhoto.caption && (
              <Text className="text-foreground text-sm">{selectedPhoto.caption}</Text>
            )}

            <Text className="text-muted text-xs">
              {new Date(selectedPhoto.timestamp).toLocaleDateString()}
            </Text>

            {/* Action buttons */}
            {isEditable && (
              <Pressable
                onPress={() => handlePhotoDelete(selectedPhoto.id)}
                className="py-2 px-4 rounded-lg bg-error items-center"
              >
                <Text className="text-white font-semibold">
                  {t('common.delete') || 'Delete'}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setShowPreview(false)}
              className="py-2 px-4 rounded-lg bg-primary items-center"
            >
              <Text className="text-background font-semibold">
                {t('common.close') || 'Close'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  /**
   * Render empty state
   */
  if (!photos || photos.length === 0) {
    return (
      <View className="flex-1 justify-center items-center gap-4 px-4">
        <Text className="text-lg font-semibold text-foreground">
          {t('profile.noPhotos') || 'No photos yet'}
        </Text>
        <Text className="text-sm text-muted text-center">
          {t('profile.noPhotosDescription') ||
            'Photos you share will appear here'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ gap: 4 }}
        contentContainerStyle={{ gap: 4, padding: 8 }}
        scrollEnabled={true}
      />

      {renderPreviewModal()}
    </View>
  );
}

export default PhotoGallery;
