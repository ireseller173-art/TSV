/**
 * File Sharing Service
 * Handles file upload, download, caching, and management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import {
  FileMetadata,
  FileUploadProgress,
  FileDownloadProgress,
  FileCacheEntry,
  FileType,
  FILE_MIME_TYPES,
  FILE_SIZE_LIMITS,
  FileValidationResult,
  FileSharingStats,
  FileActivityLog,
} from './types/file-sharing';

const CACHE_DIR = `${FileSystem.documentDirectory}file-sharing/`;
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB

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
    console.error('Failed to initialize file sharing:', error);
  }
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: FileMetadata
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Determine file type
  const fileType = getFileType(file.mimeType);

  // Check file size
  const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.other;
  if (file.size > maxSize) {
    errors.push(
      `File size exceeds limit of ${formatFileSize(maxSize)}`
    );
  }

  // Check file name
  if (!file.name || file.name.length === 0) {
    errors.push('File name is required');
  }

  if (file.name.length > 255) {
    warnings.push('File name is very long and may be truncated');
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs'];
  const fileName = file.name.toLowerCase();
  if (suspiciousExtensions.some((ext) => fileName.endsWith(ext))) {
    warnings.push('This file type may be blocked by some systems');
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
  const type = FILE_MIME_TYPES[mimeType as keyof typeof FILE_MIME_TYPES];
  return type || 'other';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Upload file to server
 */
export async function uploadFile(
  file: FileMetadata,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<string> {
  const uploadProgress: FileUploadProgress = {
    fileId: file.id,
    fileName: file.name,
    status: 'pending',
    progress: 0,
    bytesUploaded: 0,
    totalBytes: file.size,
    startedAt: Date.now(),
  };

  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      uploadProgress.status = 'failed';
      uploadProgress.error = validation.errors.join(', ');
      onProgress?.(uploadProgress);
      throw new Error(validation.errors[0]);
    }

    // Update status to uploading
    uploadProgress.status = 'uploading';
    onProgress?.(uploadProgress);

    // Simulate upload progress (in real app, would use actual upload)
    for (let i = 0; i <= 100; i += 10) {
      uploadProgress.progress = i;
      uploadProgress.bytesUploaded = Math.floor((file.size * i) / 100);
      onProgress?.(uploadProgress);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Mark as completed
    uploadProgress.status = 'completed';
    uploadProgress.progress = 100;
    uploadProgress.bytesUploaded = file.size;
    uploadProgress.completedAt = Date.now();
    onProgress?.(uploadProgress);

    // Generate remote URL (in real app, would be from server)
    const remoteUrl = `https://storage.example.com/files/${file.id}/${file.name}`;

    // Save file metadata
    await saveFileMetadata(file);

    // Log activity
    await logFileActivity({
      id: `activity-${Date.now()}`,
      fileId: file.id,
      action: 'uploaded',
      userId: file.uploadedBy,
      userName: 'Current User',
      timestamp: Date.now(),
    });

    return remoteUrl;
  } catch (error) {
    uploadProgress.status = 'failed';
    uploadProgress.error = error instanceof Error ? error.message : 'Upload failed';
    uploadProgress.completedAt = Date.now();
    onProgress?.(uploadProgress);
    throw error;
  }
}

/**
 * Download file from server
 */
export async function downloadFile(
  file: FileMetadata,
  onProgress?: (progress: FileDownloadProgress) => void
): Promise<string> {
  const downloadProgress: FileDownloadProgress = {
    fileId: file.id,
    fileName: file.name,
    status: 'pending',
    progress: 0,
    bytesDownloaded: 0,
    totalBytes: file.size,
    startedAt: Date.now(),
  };

  try {
    // Check cache first
    const cachedPath = await getCachedFile(file.id);
    if (cachedPath) {
      downloadProgress.status = 'completed';
      downloadProgress.progress = 100;
      downloadProgress.bytesDownloaded = file.size;
      downloadProgress.localPath = cachedPath;
      downloadProgress.completedAt = Date.now();
      onProgress?.(downloadProgress);

      // Log activity
      await logFileActivity({
        id: `activity-${Date.now()}`,
        fileId: file.id,
        action: 'downloaded',
        userId: 'current-user',
        userName: 'Current User',
        timestamp: Date.now(),
      });

      return cachedPath;
    }

    // Update status to downloading
    downloadProgress.status = 'downloading';
    onProgress?.(downloadProgress);

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      downloadProgress.progress = i;
      downloadProgress.bytesDownloaded = Math.floor((file.size * i) / 100);
      onProgress?.(downloadProgress);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Save to cache
    const localPath = await cacheFile(file);

    // Mark as completed
    downloadProgress.status = 'completed';
    downloadProgress.progress = 100;
    downloadProgress.bytesDownloaded = file.size;
    downloadProgress.localPath = localPath;
    downloadProgress.completedAt = Date.now();
    onProgress?.(downloadProgress);

    // Log activity
    await logFileActivity({
      id: `activity-${Date.now()}`,
      fileId: file.id,
      action: 'downloaded',
      userId: 'current-user',
      userName: 'Current User',
      timestamp: Date.now(),
    });

    return localPath;
  } catch (error) {
    downloadProgress.status = 'failed';
    downloadProgress.error = error instanceof Error ? error.message : 'Download failed';
    downloadProgress.completedAt = Date.now();
    onProgress?.(downloadProgress);
    throw error;
  }
}

/**
 * Cache file locally
 */
export async function cacheFile(file: FileMetadata): Promise<string> {
  try {
    const localPath = `${CACHE_DIR}${file.id}-${file.name}`;

    // In real app, would copy file from remote URL
    // For now, just create the path
    if (file.localUri) {
      await FileSystem.copyAsync({
        from: file.localUri,
        to: localPath,
      });
    }

    // Update cache entry
    const cacheEntry: FileCacheEntry = {
      fileId: file.id,
      localPath,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      expiresAt: Date.now() + CACHE_EXPIRY,
    };

    await saveCacheEntry(cacheEntry);

    return localPath;
  } catch (error) {
    console.error('Failed to cache file:', error);
    throw error;
  }
}

/**
 * Get cached file path
 */
export async function getCachedFile(fileId: string): Promise<string | null> {
  try {
    const cacheEntry = await getCacheEntry(fileId);

    if (!cacheEntry) {
      return null;
    }

    // Check if cache is expired
    if (cacheEntry.expiresAt < Date.now()) {
      await removeCacheEntry(fileId);
      return null;
    }

    // Check if file still exists
    const fileInfo = await FileSystem.getInfoAsync(cacheEntry.localPath);
    if (!fileInfo.exists) {
      await removeCacheEntry(fileId);
      return null;
    }

    // Update access time
    cacheEntry.accessedAt = Date.now();
    await saveCacheEntry(cacheEntry);

    return cacheEntry.localPath;
  } catch (error) {
    console.error('Failed to get cached file:', error);
    return null;
  }
}

/**
 * Save cache entry
 */
async function saveCacheEntry(entry: FileCacheEntry): Promise<void> {
  try {
    const cache = await getAllCacheEntries();
    const index = cache.findIndex((e) => e.fileId === entry.fileId);

    if (index >= 0) {
      cache[index] = entry;
    } else {
      cache.push(entry);
    }

    await AsyncStorage.setItem(
      'file-sharing-cache',
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error('Failed to save cache entry:', error);
  }
}

/**
 * Get cache entry
 */
async function getCacheEntry(fileId: string): Promise<FileCacheEntry | null> {
  try {
    const cache = await getAllCacheEntries();
    return cache.find((e) => e.fileId === fileId) || null;
  } catch (error) {
    console.error('Failed to get cache entry:', error);
    return null;
  }
}

/**
 * Remove cache entry
 */
async function removeCacheEntry(fileId: string): Promise<void> {
  try {
    const cache = await getAllCacheEntries();
    const filtered = cache.filter((e) => e.fileId !== fileId);

    await AsyncStorage.setItem(
      'file-sharing-cache',
      JSON.stringify(filtered)
    );

    // Delete file from disk
    const entry = cache.find((e) => e.fileId === fileId);
    if (entry) {
      const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(entry.localPath);
      }
    }
  } catch (error) {
    console.error('Failed to remove cache entry:', error);
  }
}

/**
 * Get all cache entries
 */
async function getAllCacheEntries(): Promise<FileCacheEntry[]> {
  try {
    const data = await AsyncStorage.getItem('file-sharing-cache');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get cache entries:', error);
    return [];
  }
}

/**
 * Clean up expired cache
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    const cache = await getAllCacheEntries();
    const now = Date.now();

    for (const entry of cache) {
      if (entry.expiresAt < now) {
        await removeCacheEntry(entry.fileId);
      }
    }

    // Check total cache size
    const totalSize = cache.reduce((sum, e) => sum + e.size, 0);
    if (totalSize > MAX_CACHE_SIZE) {
      // Remove oldest files first
      const sorted = cache.sort((a, b) => a.accessedAt - b.accessedAt);
      let currentSize = totalSize;

      for (const entry of sorted) {
        if (currentSize <= MAX_CACHE_SIZE * 0.8) {
          break;
        }

        await removeCacheEntry(entry.fileId);
        currentSize -= entry.size;
      }
    }
  } catch (error) {
    console.error('Failed to cleanup cache:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const cache = await getAllCacheEntries();

    for (const entry of cache) {
      await removeCacheEntry(entry.fileId);
    }

    await AsyncStorage.removeItem('file-sharing-cache');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  fileCount: number;
  oldestFile: FileCacheEntry | null;
  newestFile: FileCacheEntry | null;
}> {
  try {
    const cache = await getAllCacheEntries();

    const totalSize = cache.reduce((sum, e) => sum + e.size, 0);
    const sorted = cache.sort((a, b) => a.createdAt - b.createdAt);

    return {
      totalSize,
      fileCount: cache.length,
      oldestFile: sorted[0] || null,
      newestFile: sorted[sorted.length - 1] || null,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      totalSize: 0,
      fileCount: 0,
      oldestFile: null,
      newestFile: null,
    };
  }
}

/**
 * Save file metadata
 */
export async function saveFileMetadata(file: FileMetadata): Promise<void> {
  try {
    const files = await getAllFileMetadata();
    const index = files.findIndex((f) => f.id === file.id);

    if (index >= 0) {
      files[index] = file;
    } else {
      files.push(file);
    }

    await AsyncStorage.setItem(
      'file-sharing-metadata',
      JSON.stringify(files)
    );
  } catch (error) {
    console.error('Failed to save file metadata:', error);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  try {
    const files = await getAllFileMetadata();
    return files.find((f) => f.id === fileId) || null;
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}

/**
 * Get all file metadata
 */
export async function getAllFileMetadata(): Promise<FileMetadata[]> {
  try {
    const data = await AsyncStorage.getItem('file-sharing-metadata');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return [];
  }
}

/**
 * Delete file metadata
 */
export async function deleteFileMetadata(fileId: string): Promise<void> {
  try {
    const files = await getAllFileMetadata();
    const filtered = files.filter((f) => f.id !== fileId);

    await AsyncStorage.setItem(
      'file-sharing-metadata',
      JSON.stringify(filtered)
    );

    // Also remove from cache
    await removeCacheEntry(fileId);
  } catch (error) {
    console.error('Failed to delete file metadata:', error);
  }
}

/**
 * Get file sharing statistics
 */
export async function getFileSharingStats(): Promise<FileSharingStats> {
  try {
    const files = await getAllFileMetadata();

    const stats: FileSharingStats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      filesByType: {
        image: 0,
        document: 0,
        audio: 0,
        video: 0,
        archive: 0,
        other: 0,
      },
      sizeByType: {
        image: 0,
        document: 0,
        audio: 0,
        video: 0,
        archive: 0,
        other: 0,
      },
      mostSharedFiles: [],
      recentFiles: [],
      averageFileSize: 0,
    };

    for (const file of files) {
      const type = getFileType(file.mimeType);
      stats.filesByType[type]++;
      stats.sizeByType[type] += file.size;
    }

    stats.averageFileSize = stats.totalFiles > 0
      ? Math.round(stats.totalSize / stats.totalFiles)
      : 0;

    stats.recentFiles = files
      .sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0))
      .slice(0, 10);

    return stats;
  } catch (error) {
    console.error('Failed to get file sharing stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      filesByType: {
        image: 0,
        document: 0,
        audio: 0,
        video: 0,
        archive: 0,
        other: 0,
      },
      sizeByType: {
        image: 0,
        document: 0,
        audio: 0,
        video: 0,
        archive: 0,
        other: 0,
      },
      mostSharedFiles: [],
      recentFiles: [],
      averageFileSize: 0,
    };
  }
}

/**
 * Log file activity
 */
export async function logFileActivity(activity: FileActivityLog): Promise<void> {
  try {
    const activities = await getFileActivityLog();
    activities.push(activity);

    // Keep only last 1000 activities
    const limited = activities.slice(-1000);

    await AsyncStorage.setItem(
      'file-sharing-activity',
      JSON.stringify(limited)
    );
  } catch (error) {
    console.error('Failed to log file activity:', error);
  }
}

/**
 * Get file activity log
 */
export async function getFileActivityLog(): Promise<FileActivityLog[]> {
  try {
    const data = await AsyncStorage.getItem('file-sharing-activity');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get file activity log:', error);
    return [];
  }
}

/**
 * Get activity for specific file
 */
export async function getFileActivity(fileId: string): Promise<FileActivityLog[]> {
  try {
    const activities = await getFileActivityLog();
    return activities.filter((a) => a.fileId === fileId);
  } catch (error) {
    console.error('Failed to get file activity:', error);
    return [];
  }
}

/**
 * Clear activity log
 */
export async function clearActivityLog(): Promise<void> {
  try {
    await AsyncStorage.removeItem('file-sharing-activity');
  } catch (error) {
    console.error('Failed to clear activity log:', error);
  }
}
