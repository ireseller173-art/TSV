/**
 * File Preview Modal Component
 * Displays preview for documents, images, and media files
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { FileMetadata, FileType } from '@/lib/file-sharing-service';
import { formatFileSize } from '@/lib/file-sharing-service';

interface FilePreviewModalProps {
  visible: boolean;
  file: FileMetadata | null;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function FilePreviewModal({
  visible,
  file,
  onClose,
  onDownload,
  onShare,
}: FilePreviewModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible && file) {
      setLoading(false);
    }
  }, [visible, file]);

  if (!file) return null;

  /**
   * Render preview based on file type
   */
  const renderPreview = () => {
    switch (file.type) {
      case 'image':
        return (
          <View className="flex-1 items-center justify-center bg-black">
            <Image
              source={{ uri: file.localUri || file.uri }}
              style={{
                width: screenWidth,
                height: Math.min(file.height || 500, 500),
                resizeMode: 'contain',
              }}
            />
          </View>
        );

      case 'document':
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View
              className="items-center gap-4 p-8 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons
                name="description"
                size={64}
                color={colors.primary}
              />
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: colors.foreground }}
              >
                {file.name}
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.muted }}
              >
                {formatFileSize(file.size)}
              </Text>
              <Text
                className="text-xs text-center mt-4"
                style={{ color: colors.muted }}
              >
                Document preview not available
              </Text>
            </View>
          </View>
        );

      case 'audio':
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View
              className="items-center gap-4 p-8 rounded-2xl w-full"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons
                name="audio-file"
                size={64}
                color={colors.primary}
              />
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: colors.foreground }}
              >
                {file.name}
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.muted }}
              >
                {formatFileSize(file.size)}
              </Text>
              {file.duration && (
                <Text
                  className="text-xs text-center"
                  style={{ color: colors.muted }}
                >
                  Duration: {formatDuration(file.duration)}
                </Text>
              )}
            </View>
          </View>
        );

      case 'video':
        return (
          <View className="flex-1 items-center justify-center bg-black">
            <View className="items-center gap-4">
              <MaterialIcons
                name="video-library"
                size={64}
                color={colors.primary}
              />
              <Text
                className="text-lg font-semibold text-center text-white"
              >
                {file.name}
              </Text>
              <Text
                className="text-sm text-center text-gray-400"
              >
                {formatFileSize(file.size)}
              </Text>
              {file.duration && (
                <Text
                  className="text-xs text-center text-gray-400"
                >
                  Duration: {formatDuration(file.duration)}
                </Text>
              )}
            </View>
          </View>
        );

      case 'archive':
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View
              className="items-center gap-4 p-8 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons
                name="folder-zip"
                size={64}
                color={colors.primary}
              />
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: colors.foreground }}
              >
                {file.name}
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.muted }}
              >
                {formatFileSize(file.size)}
              </Text>
            </View>
          </View>
        );

      default:
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View
              className="items-center gap-4 p-8 rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons
                name="insert-drive-file"
                size={64}
                color={colors.primary}
              />
              <Text
                className="text-lg font-semibold text-center"
                style={{ color: colors.foreground }}
              >
                {file.name}
              </Text>
              <Text
                className="text-sm text-center"
                style={{ color: colors.muted }}
              >
                {formatFileSize(file.size)}
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between p-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={colors.foreground}
            />
          </TouchableOpacity>

          <Text
            className="text-lg font-semibold flex-1 ml-4 truncate"
            style={{ color: colors.foreground }}
          >
            {file.name}
          </Text>

          <TouchableOpacity onPress={onShare} disabled={!onShare}>
            <MaterialIcons
              name="share"
              size={24}
              color={onShare ? colors.primary : colors.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />
          </View>
        ) : (
          renderPreview()
        )}

        {/* File Info */}
        <View
          className="p-4 border-t gap-3"
          style={{ borderColor: colors.border }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              File Size
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              {formatFileSize(file.size)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              File Type
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.foreground }}
            >
              {file.mimeType}
            </Text>
          </View>

          {file.width && file.height && (
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm"
                style={{ color: colors.muted }}
              >
                Dimensions
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.foreground }}
              >
                {file.width} × {file.height}
              </Text>
            </View>
          )}

          {file.duration && (
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm"
                style={{ color: colors.muted }}
              >
                Duration
              </Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.foreground }}
              >
                {formatDuration(file.duration)}
              </Text>
            </View>
          )}

          {/* Download Button */}
          {onDownload && (
            <TouchableOpacity
              onPress={onDownload}
              className="mt-4 p-3 rounded-lg items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <View className="flex-row items-center gap-2">
                <MaterialIcons
                  name="download"
                  size={20}
                  color={colors.background}
                />
                <Text
                  className="font-semibold"
                  style={{ color: colors.background }}
                >
                  Download
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Format duration in seconds to HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
