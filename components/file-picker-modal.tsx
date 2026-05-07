/**
 * File Picker Modal Component
 * Allows users to select files from device storage or camera
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
// Document picker is available in expo-document-picker
// For now using alternative approach
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import { FileMetadata, FilePickerOptions, FilePickerResult } from '@/lib/types/file-sharing';
import { validateFile } from '@/lib/file-sharing-service';

interface FilePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFilesSelected: (result: FilePickerResult) => void;
  options?: FilePickerOptions;
}

export function FilePickerModal({
  visible,
  onClose,
  onFilesSelected,
  options = {},
}: FilePickerModalProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const {
    allowMultiple = false,
    fileTypes = ['image', 'document', 'audio', 'video'],
    maxSize = 50 * 1024 * 1024,
    maxFiles = 5,
    allowCamera = true,
    allowGallery = true,
  } = options;

  /**
   * Pick image from gallery
   */
  const pickImage = useCallback(async () => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultiple: allowMultiple as any,
        quality: 0.8,
      } as any);

      if (!result.canceled) {
          const files: FileMetadata[] = result.assets.map((asset: any, index: number) => ({
          id: `file-${Date.now()}-${index}`,
          name: asset.fileName || `image-${Date.now()}.jpg`,
          type: 'image' as const,
          mimeType: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          uri: asset.uri,
          localUri: asset.uri,
          width: asset.width,
          height: asset.height,
          createdAt: Date.now(),
          uploadedBy: 'current-user',
        } as FileMetadata));

        // Validate files
        const validFiles: FileMetadata[] = [];
        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            Alert.alert(t('filePicker.invalidFile'), validation.errors[0]);
          } else {
            validFiles.push(file);
          }
        }

        if (validFiles.length > 0) {
          onFilesSelected({
            files: validFiles,
            cancelled: false,
          });
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert(t('filePicker.error'), t('filePicker.failedImage'));
    } finally {
      setLoading(false);
    }
  }, [allowMultiple, onFilesSelected, onClose, t]);

  /**
   * Take photo with camera
   */
  const takePhoto = useCallback(async () => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const file: FileMetadata = {
          id: `file-${Date.now()}`,
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          type: 'image',
          mimeType: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          uri: asset.uri,
          localUri: asset.uri,
          width: asset.width,
          height: asset.height,
          createdAt: Date.now(),
          uploadedBy: 'current-user',
        };

        const validation = validateFile(file);
        if (!validation.valid) {
          Alert.alert(t('filePicker.invalidFile'), validation.errors[0]);
        } else {
          onFilesSelected({
            files: [file],
            cancelled: false,
          });
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert(t('filePicker.error'), t('filePicker.failedPhoto'));
    } finally {
      setLoading(false);
    }
  }, [onFilesSelected, onClose, t]);

  /**
   * Pick document
   */
  const pickDocument = useCallback(async () => {
    try {
      setLoading(true);

      // Document picker would be called here
      // For now, showing alert
      Alert.alert(t('filePicker.document'), t('filePicker.documentComingSoon'));
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert(t('filePicker.error'), t('filePicker.failedDocument'));
    } finally {
      setLoading(false);
    }
  }, [allowMultiple, onFilesSelected, onClose, t]);

  /**
   * Pick audio
   */
  const pickAudio = useCallback(async () => {
    try {
      setLoading(true);

      // Audio picker would be called here
      // For now, showing alert
      Alert.alert(t('filePicker.audio'), t('filePicker.audioComingSoon'));
    } catch (error) {
      console.error('Failed to pick audio:', error);
      Alert.alert(t('filePicker.error'), t('filePicker.failedAudio'));
    } finally {
      setLoading(false);
    }
  }, [allowMultiple, onFilesSelected, onClose, t]);

  /**
   * Pick video
   */
  const pickVideo = useCallback(async () => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultiple: allowMultiple as any,
        quality: 0.8,
      } as any);

      if (!result.canceled) {
        const files: FileMetadata[] = result.assets.map((asset: any, index: number) => ({
          id: `file-${Date.now()}-${index}`,
          name: asset.fileName || `video-${Date.now()}.mp4`,
          type: 'video' as const,
          mimeType: asset.type || 'video/mp4',
          size: asset.fileSize || 0,
          uri: asset.uri,
          localUri: asset.uri,
          width: asset.width,
          height: asset.height,
          duration: asset.duration || undefined,
          createdAt: Date.now(),
          uploadedBy: 'current-user',
        } as FileMetadata));

        // Validate files
        const validFiles: FileMetadata[] = [];
        for (const file of files) {
          const validation = validateFile(file);
          if (!validation.valid) {
            Alert.alert(t('filePicker.invalidFile'), validation.errors[0]);
          } else {
            validFiles.push(file);
          }
        }

        if (validFiles.length > 0) {
          onFilesSelected({
            files: validFiles,
            cancelled: false,
          });
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to pick video:', error);
      Alert.alert(t('filePicker.error'), t('filePicker.failedVideo'));
    } finally {
      setLoading(false);
    }
  }, [allowMultiple, onFilesSelected, onClose, t]);

  const options_list = [
    {
      id: 'gallery',
      label: t('filePicker.photoGallery'),
      icon: 'image',
      action: pickImage,
      visible: fileTypes.includes('image') && allowGallery,
    },
    {
      id: 'camera',
      label: t('filePicker.takePhoto'),
      icon: 'camera-alt',
      action: takePhoto,
      visible: fileTypes.includes('image') && allowCamera,
    },
    {
      id: 'document',
      label: t('filePicker.document'),
      icon: 'description',
      action: pickDocument,
      visible: fileTypes.includes('document'),
    },
    {
      id: 'audio',
      label: t('filePicker.audio'),
      icon: 'audio-file',
      action: pickAudio,
      visible: fileTypes.includes('audio'),
    },
    {
      id: 'video',
      label: t('filePicker.video'),
      icon: 'video-library',
      action: pickVideo,
      visible: fileTypes.includes('video'),
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        className="flex-1"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className="flex-1 rounded-t-3xl p-6"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-foreground">
              {t('filePicker.selectFile')}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <MaterialIcons
                name="close"
                size={28}
                color={colors.foreground}
              />
            </TouchableOpacity>
          </View>

          {/* File Type Options */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3">
              {options_list.map(
                (option) =>
                  option.visible && (
                    <TouchableOpacity
                      key={option.id}
                      onPress={option.action}
                      disabled={loading}
                      className={cn(
                        'flex-row items-center p-4 rounded-2xl border',
                        loading
                          ? 'opacity-50'
                          : ''
                      )}
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                          style={{ marginRight: 16 }}
                        />
                      ) : (
                        <MaterialIcons
                          name={option.icon as any}
                          size={24}
                          color={colors.primary}
                          style={{ marginRight: 16 }}
                        />
                      )}
                      <Text
                        className="text-lg font-semibold flex-1"
                        style={{ color: colors.foreground }}
                      >
                        {option.label}
                      </Text>
                      {!loading && (
                        <MaterialIcons
                          name="chevron-right"
                          size={24}
                          color={colors.muted}
                        />
                      )}
                    </TouchableOpacity>
                  )
              )}
            </View>
          </ScrollView>

          {/* Info Text */}
          <View className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <Text
              className="text-sm text-muted"
              style={{ color: colors.muted }}
            >
              {allowMultiple
                ? t('filePicker.selectMultiple').replace('{count}', String(maxFiles))
                : t('filePicker.selectOne')}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
