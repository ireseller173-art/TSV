/**
 * File Sharing Service
 * Handles file upload to Firebase Storage, download, caching, and management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from 'firebase/storage';
import { storage, db } from './firebase-config';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  uploadedBy: string;
  url?: string;
  chatId?: string;
}

export interface FileUploadProgress {
  fileId: string;
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
}

export interface FileDownloadProgress {
  fileId: string;
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
}

export interface FileCacheEntry {
  fileId: string;
  localPath: string;
  cachedAt: number;
  expiresAt: number;
}

export type FileType = 'image' | 'video' | 'audio' | 'document' | 'other';

export const FILE_MIME_TYPES: Record<string, FileType> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

export const FILE_SIZE_LIMITS: Record<FileType | 'other', number> = {
  image: 50 * 1024 * 1024, // 50 MB
  video: 500 * 1024 * 1024, // 500 MB
  audio: 100 * 1024 * 1024, // 100 MB
  document: 100 * 1024 * 1024, // 100 MB
  other: 50 * 1024 * 1024, // 50 MB
};

const CACHE_DIR = `${FileSystem.documentDirectory}file-sharing/`;
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB
const CACHE_INDEX_KEY = 'file_cache_index';

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileType: FileType;
  fileSize: number;
  fileName: string;
}

export interface FileSharingStats {
  totalUploaded: number;
  totalDownloaded: number;
  cacheSize: number;
  fileCount: number;
}

export interface FileActivityLog {
  fileId: string;
  action: 'upload' | 'download' | 'delete' | 'share';
  timestamp: number;
  userId: string;
  details?: Record<string, any>;
}

/**
 * Initialize file sharing service
 */
export async function initializeFileSharing(): Promise<void> {
  try {
    // Create cache directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true } as any);
    }

    // Clean up expired cache
    await cleanupExpiredCache();
  } catch (error) {
  }
}

/**
 * Upload file to Firebase Storage with progress tracking
 */
export async function uploadFile(
  file: FileMetadata,
  fileData: ArrayBuffer | Uint8Array,
  onProgress?: (progress: FileUploadProgress) => void,
  chatId?: string
): Promise<string> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create Firebase Storage reference
    const timestamp = Date.now();
    const storagePath = `files/${file.uploadedBy}/${timestamp}_${file.name}`;
    const fileRef = ref(storage, storagePath);

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(fileRef, fileData);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            fileId: file.id,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
          });
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(fileRef);

            // Save file metadata to Firestore
            const fileMetadataRef = doc(db, 'files', file.id);
            await setDoc(fileMetadataRef, {
              ...file,
              url: downloadURL,
              chatId: chatId || null,
              uploadedAt: timestamp,
            });

            // Cache the download URL locally
            await cacheFile(file.id, downloadURL);

            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Download file from Firebase Storage
 */
export async function downloadFile(
  fileId: string,
  onProgress?: (progress: FileDownloadProgress) => void
): Promise<string> {
  try {
    // Check cache first
    const cachedPath = await getCachedFile(fileId);
    if (cachedPath) {
      return cachedPath;
    }

    // Get file metadata from Firestore
    const fileMetadataRef = doc(db, 'files', fileId);
    const fileMetadataSnap = await getDoc(fileMetadataRef);

    if (!fileMetadataSnap.exists()) {
      throw new Error('File not found');
    }

    const fileMetadata = fileMetadataSnap.data() as FileMetadata;
    const downloadURL = fileMetadata.url;

    if (!downloadURL) {
      throw new Error('Download URL not available');
    }

    // Download file
    const localPath = `${CACHE_DIR}${fileId}`;
    const downloadResumable = FileSystem.createDownloadResumable(
      downloadURL,
      localPath,
      {},
      (downloadProgress) => {
        const progress = (downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100;
        onProgress?.({
          fileId,
          bytesTransferred: downloadProgress.totalBytesWritten,
          totalBytes: downloadProgress.totalBytesExpectedToWrite,
          progress,
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (result?.uri) {
      // Cache the file
      await cacheFile(fileId, result.uri);
      return result.uri;
    }

    throw new Error('Download failed');
  } catch (error) {
    throw error;
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    // Get file metadata
    const fileMetadataRef = doc(db, 'files', fileId);
    const fileMetadataSnap = await getDoc(fileMetadataRef);

    if (fileMetadataSnap.exists()) {
      const fileMetadata = fileMetadataSnap.data() as FileMetadata;

      // Delete from Firebase Storage
      if (fileMetadata.url) {
        const fileRef = ref(storage, fileMetadata.url);
        await deleteObject(fileRef);
      }

      // Delete metadata from Firestore
      await deleteDoc(fileMetadataRef);
    }

    // Delete from cache
    const localPath = `${CACHE_DIR}${fileId}`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localPath);
    }
  } catch (error) {
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: FileMetadata): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const fileType = getFileType(file.mimeType);
  const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.other;

  if (file.size > maxSize) {
    errors.push(`File size exceeds limit of ${formatFileSize(maxSize)}`);
  }

  if (!file.name || file.name.length === 0) {
    errors.push('File name is required');
  }

  if (file.name.length > 255) {
    warnings.push('File name is very long and may be truncated');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fileType,
    fileSize: file.size,
    fileName: file.name,
  };
}

/**
 * Get file type from MIME type
 */
export function getFileType(mimeType: string): FileType {
  return FILE_MIME_TYPES[mimeType] || 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Cache file locally
 */
async function cacheFile(fileId: string, filePath: string): Promise<void> {
  try {
    const cacheIndex = await getCacheIndex();
    const cacheEntry: FileCacheEntry = {
      fileId,
      localPath: filePath,
      cachedAt: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY,
    };

    cacheIndex[fileId] = cacheEntry;
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  } catch (error) {
  }
}

/**
 * Get cached file
 */
async function getCachedFile(fileId: string): Promise<string | null> {
  try {
    const cacheIndex = await getCacheIndex();
    const cacheEntry = cacheIndex[fileId];

    if (cacheEntry && Date.now() < cacheEntry.expiresAt) {
      return cacheEntry.localPath;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get cache index
 */
async function getCacheIndex(): Promise<Record<string, FileCacheEntry>> {
  try {
    const data = await AsyncStorage.getItem(CACHE_INDEX_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
}

/**
 * Clean up expired cache
 */
async function cleanupExpiredCache(): Promise<void> {
  try {
    const cacheIndex = await getCacheIndex();
    const now = Date.now();
    let totalCacheSize = 0;

    for (const [fileId, entry] of Object.entries(cacheIndex)) {
      if (now > entry.expiresAt) {
        // Delete expired file
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(entry.localPath);
        }
        delete cacheIndex[fileId];
      } else {
        // Calculate cache size
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists && fileInfo.size) {
          totalCacheSize += fileInfo.size;
        }
      }
    }

    // If cache exceeds max size, delete oldest files
    if (totalCacheSize > MAX_CACHE_SIZE) {
      const sortedEntries = Object.entries(cacheIndex).sort(
        (a, b) => a[1].cachedAt - b[1].cachedAt
      );

      for (const [fileId, entry] of sortedEntries) {
        if (totalCacheSize <= MAX_CACHE_SIZE) break;

        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (fileInfo.exists && fileInfo.size) {
          await FileSystem.deleteAsync(entry.localPath);
          totalCacheSize -= fileInfo.size;
          delete cacheIndex[fileId];
        }
      }
    }

    // Save updated cache index
    await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(cacheIndex));
  } catch (error) {
  }
}

/**
 * Get file sharing statistics
 */
export async function getFileSharingStats(): Promise<FileSharingStats> {
  try {
    const cacheIndex = await getCacheIndex();
    let cacheSize = 0;

    for (const entry of Object.values(cacheIndex)) {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists && fileInfo.size) {
        cacheSize += fileInfo.size;
      }
    }

    return {
      totalUploaded: 0, // Would need to query Firestore
      totalDownloaded: 0, // Would need to query Firestore
      cacheSize,
      fileCount: Object.keys(cacheIndex).length,
    };
  } catch (error) {
    return {
      totalUploaded: 0,
      totalDownloaded: 0,
      cacheSize: 0,
      fileCount: 0,
    };
  }
}
