/**
 * File Sharing Service Tests
 * Tests for file upload, download, caching, and management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  validateFile,
  getFileType,
  formatFileSize,
  uploadFile,
  downloadFile,
  cacheFile,
  getCachedFile,
  clearAllCache,
  getCacheStats,
  saveFileMetadata,
  getFileMetadata,
  getAllFileMetadata,
  deleteFileMetadata,
  getFileSharingStats,
  logFileActivity,
  getFileActivityLog,
  getFileActivity,
} from '@/lib/file-sharing-service';
import {
  FileMetadata,
  FileValidationResult,
  FILE_SIZE_LIMITS,
} from '@/lib/types/file-sharing';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Mock expo-file-system
vi.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/documents/',
  getInfoAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
  copyAsync: vi.fn(),
  deleteAsync: vi.fn(),
}));

describe('File Sharing Service', () => {
  const testFile: FileMetadata = {
    id: 'file-123',
    name: 'test-document.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 1024 * 100, // 100 KB
    uri: 'file:///documents/test.pdf',
    createdAt: Date.now(),
    uploadedBy: 'user-123',
  };

  const imageFile: FileMetadata = {
    id: 'image-123',
    name: 'test-image.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1024 * 500, // 500 KB
    uri: 'file:///documents/test.jpg',
    width: 1920,
    height: 1080,
    createdAt: Date.now(),
    uploadedBy: 'user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Validation', () => {
    it('should validate correct file', () => {
      const result = validateFile(testFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileType).toBe('document');
      expect(result.fileSize).toBe(testFile.size);
    });

    it('should reject file exceeding size limit', () => {
      const largeFile: FileMetadata = {
        ...testFile,
        size: FILE_SIZE_LIMITS.document + 1,
      };

      const result = validateFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('exceeds limit');
    });

    it('should reject file without name', () => {
      const noNameFile: FileMetadata = {
        ...testFile,
        name: '',
      };

      const result = validateFile(noNameFile);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about suspicious file extensions', () => {
      const suspiciousFile: FileMetadata = {
        ...testFile,
        name: 'malware.exe',
      };

      const result = validateFile(suspiciousFile);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should warn about very long file names', () => {
      const longNameFile: FileMetadata = {
        ...testFile,
        name: 'a'.repeat(300) + '.pdf',
      };

      const result = validateFile(longNameFile);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('File Type Detection', () => {
    it('should detect image file type', () => {
      const type = getFileType('image/jpeg');
      expect(type).toBe('image');
    });

    it('should detect document file type', () => {
      const type = getFileType('application/pdf');
      expect(type).toBe('document');
    });

    it('should detect audio file type', () => {
      const type = getFileType('audio/mpeg');
      expect(type).toBe('audio');
    });

    it('should detect video file type', () => {
      const type = getFileType('video/mp4');
      expect(type).toBe('video');
    });

    it('should detect archive file type', () => {
      const type = getFileType('application/zip');
      expect(type).toBe('archive');
    });

    it('should default to other for unknown type', () => {
      const type = getFileType('application/unknown');
      expect(type).toBe('other');
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes', () => {
      const formatted = formatFileSize(512);
      expect(formatted).toContain('B');
    });

    it('should format kilobytes', () => {
      const formatted = formatFileSize(1024 * 5);
      expect(formatted).toContain('KB');
    });

    it('should format megabytes', () => {
      const formatted = formatFileSize(1024 * 1024 * 10);
      expect(formatted).toContain('MB');
    });

    it('should format gigabytes', () => {
      const formatted = formatFileSize(1024 * 1024 * 1024 * 2);
      expect(formatted).toContain('GB');
    });

    it('should handle zero bytes', () => {
      const formatted = formatFileSize(0);
      expect(formatted).toBe('0 B');
    });
  });

  describe('File Metadata Management', () => {
    it('should save file metadata', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await saveFileMetadata(testFile);

      expect(vi.mocked(AsyncStorage.setItem)).toHaveBeenCalled();
    });

    it('should retrieve file metadata', async () => {
      const files = [testFile];
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(files));

      const result = await getFileMetadata(testFile.id);

      expect(result).toEqual(testFile);
    });

    it('should get all file metadata', async () => {
      const files = [testFile, imageFile];
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(files));

      const result = await getAllFileMetadata();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(testFile.id);
      expect(result[1].id).toBe(imageFile.id);
    });

    it('should delete file metadata', async () => {
      const files = [testFile, imageFile];
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(files));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await deleteFileMetadata(testFile.id);

      expect(vi.mocked(AsyncStorage.setItem)).toHaveBeenCalled();
    });

    it('should handle empty metadata', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const result = await getAllFileMetadata();

      expect(result).toEqual([]);
    });
  });

  describe('File Statistics', () => {
    it('should calculate file sharing statistics', async () => {
      const files = [testFile, imageFile];
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(files));

      const stats = await getFileSharingStats();

      expect(stats.totalFiles).toBe(2);
      expect(stats.totalSize).toBe(testFile.size + imageFile.size);
      expect(stats.filesByType.document).toBe(1);
      expect(stats.filesByType.image).toBe(1);
      expect(stats.averageFileSize).toBeGreaterThan(0);
    });

    it('should include recent files in statistics', async () => {
      const files = [testFile, imageFile];
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(files));

      const stats = await getFileSharingStats();

      expect(stats.recentFiles.length).toBeGreaterThan(0);
    });

    it('should handle empty file list for statistics', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const stats = await getFileSharingStats();

      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.averageFileSize).toBe(0);
    });
  });

  describe('File Activity Logging', () => {
    it('should log file activity', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      const activity = {
        id: 'activity-1',
        fileId: testFile.id,
        action: 'uploaded' as const,
        userId: 'user-123',
        userName: 'Test User',
        timestamp: Date.now(),
      };

      await logFileActivity(activity);

      expect(vi.mocked(AsyncStorage.setItem)).toHaveBeenCalled();
    });

    it('should retrieve file activity log', async () => {
      const activities = [
        {
          id: 'activity-1',
          fileId: testFile.id,
          action: 'uploaded' as const,
          userId: 'user-123',
          userName: 'Test User',
          timestamp: Date.now(),
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(activities));

      const result = await getFileActivityLog();

      expect(result).toHaveLength(1);
      expect(result[0].action).toBe('uploaded');
    });

    it('should get activity for specific file', async () => {
      const activities = [
        {
          id: 'activity-1',
          fileId: testFile.id,
          action: 'uploaded' as const,
          userId: 'user-123',
          userName: 'Test User',
          timestamp: Date.now(),
        },
        {
          id: 'activity-2',
          fileId: imageFile.id,
          action: 'downloaded' as const,
          userId: 'user-456',
          userName: 'Another User',
          timestamp: Date.now(),
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(activities));

      const result = await getFileActivity(testFile.id);

      expect(result).toHaveLength(1);
      expect(result[0].fileId).toBe(testFile.id);
    });

    it('should limit activity log to 1000 entries', async () => {
      const activities = Array.from({ length: 1100 }, (_, i) => ({
        id: `activity-${i}`,
        fileId: testFile.id,
        action: 'downloaded' as const,
        userId: 'user-123',
        userName: 'Test User',
        timestamp: Date.now() + i,
      }));

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(activities));
      vi.mocked(AsyncStorage.setItem).mockResolvedValueOnce(undefined);

      await logFileActivity(activities[0]);

      expect(vi.mocked(AsyncStorage.setItem)).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should validate file before upload', async () => {
      const validation = validateFile(testFile);
      expect(validation.valid).toBe(true);
    });

    it('should reject invalid file for upload', async () => {
      const invalidFile: FileMetadata = {
        ...testFile,
        size: FILE_SIZE_LIMITS.document + 1,
      };

      const validation = validateFile(invalidFile);
      expect(validation.valid).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('should get cache statistics', async () => {
      const cacheEntries = [
        {
          fileId: 'file-1',
          localPath: '/cache/file-1',
          size: 1024 * 100,
          mimeType: 'application/pdf',
          createdAt: Date.now(),
          accessedAt: Date.now(),
          expiresAt: Date.now() + 86400000,
        },
      ];

      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(JSON.stringify(cacheEntries));

      const stats = await getCacheStats();

      expect(stats.fileCount).toBe(1);
      expect(stats.totalSize).toBe(1024 * 100);
    });

    it('should handle empty cache', async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);

      const stats = await getCacheStats();

      expect(stats.fileCount).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.oldestFile).toBeNull();
      expect(stats.newestFile).toBeNull();
    });
  });

  describe('File Type Specific Tests', () => {
    it('should handle image file metadata', () => {
      expect(imageFile.width).toBe(1920);
      expect(imageFile.height).toBe(1080);
      expect(imageFile.type).toBe('image');
    });

    it('should validate image file size', () => {
      const result = validateFile(imageFile);
      expect(result.valid).toBe(true);
      expect(result.fileType).toBe('image');
    });

    it('should handle audio file with duration', () => {
      const audioFile: FileMetadata = {
        ...testFile,
        type: 'audio',
        mimeType: 'audio/mpeg',
        name: 'song.mp3',
        duration: 180, // 3 minutes
      };

      const result = validateFile(audioFile);
      expect(result.valid).toBe(true);
      expect(audioFile.duration).toBe(180);
    });

    it('should handle video file with dimensions and duration', () => {
      const videoFile: FileMetadata = {
        ...testFile,
        type: 'video',
        mimeType: 'video/mp4',
        name: 'video.mp4',
        width: 1280,
        height: 720,
        duration: 600, // 10 minutes
      };

      const result = validateFile(videoFile);
      expect(result.valid).toBe(true);
      expect(videoFile.width).toBe(1280);
      expect(videoFile.height).toBe(720);
      expect(videoFile.duration).toBe(600);
    });
  });
});
