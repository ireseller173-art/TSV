/**
 * File Sharing Types and Interfaces
 * Defines types for file sharing functionality in TSV Keeper
 */

/**
 * Supported file types for sharing
 */
export type FileType = 'image' | 'document' | 'audio' | 'video' | 'archive' | 'other';

/**
 * File mime types mapping
 */
export const FILE_MIME_TYPES = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',

  // Documents
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'text/csv': 'document',
  'application/json': 'document',

  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/aac': 'audio',
  'audio/flac': 'audio',

  // Video
  'video/mp4': 'video',
  'video/mpeg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/webm': 'video',

  // Archives
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-tar': 'archive',
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  document: 50 * 1024 * 1024, // 50 MB
  audio: 100 * 1024 * 1024, // 100 MB
  video: 500 * 1024 * 1024, // 500 MB
  archive: 100 * 1024 * 1024, // 100 MB
  other: 50 * 1024 * 1024, // 50 MB
};

/**
 * File upload status
 */
export type FileUploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';

/**
 * File metadata
 */
export interface FileMetadata {
  id: string;
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  uri: string;
  localUri?: string;
  remoteUrl?: string;
  thumbnail?: string;
  createdAt: number;
  uploadedAt?: number;
  uploadedBy: string;
  chatId?: string;
  groupId?: string;
  messageId?: string;
  duration?: number; // For audio/video
  width?: number; // For images/video
  height?: number; // For images/video
  pages?: number; // For documents
  checksum?: string; // For integrity verification
}

/**
 * File upload progress
 */
export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  status: FileUploadStatus;
  progress: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

/**
 * File download progress
 */
export interface FileDownloadProgress {
  fileId: string;
  fileName: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
  localPath?: string;
  startedAt: number;
  completedAt?: number;
}

/**
 * File cache entry
 */
export interface FileCacheEntry {
  fileId: string;
  localPath: string;
  size: number;
  mimeType: string;
  createdAt: number;
  accessedAt: number;
  expiresAt: number;
}

/**
 * File sharing message
 */
export interface FileMessage {
  id: string;
  chatId: string;
  groupId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  file: FileMetadata;
  caption?: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  readBy?: string[];
  deliveredTo?: string[];
}

/**
 * File picker options
 */
export interface FilePickerOptions {
  allowMultiple?: boolean;
  fileTypes?: FileType[];
  maxSize?: number;
  maxFiles?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
}

/**
 * File picker result
 */
export interface FilePickerResult {
  files: FileMetadata[];
  cancelled: boolean;
}

/**
 * File preview data
 */
export interface FilePreviewData {
  fileId: string;
  type: FileType;
  uri: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  previewUrl?: string;
}

/**
 * File sharing statistics
 */
export interface FileSharingStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<FileType, number>;
  sizeByType: Record<FileType, number>;
  mostSharedFiles: FileMetadata[];
  recentFiles: FileMetadata[];
  averageFileSize: number;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fileType: FileType;
  fileSize: number;
  fileName: string;
}

/**
 * File compression options
 */
export interface CompressionOptions {
  quality?: number; // 0-1 for images
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * File encryption options
 */
export interface EncryptionOptions {
  enabled: boolean;
  algorithm?: 'AES-256' | 'AES-128';
  password?: string;
}

/**
 * File sharing permissions
 */
export interface FileSharingPermissions {
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
  canPreview: boolean;
  expiresAt?: number;
  maxDownloads?: number;
  downloadCount?: number;
}

/**
 * File activity log entry
 */
export interface FileActivityLog {
  id: string;
  fileId: string;
  action: 'uploaded' | 'downloaded' | 'shared' | 'deleted' | 'previewed';
  userId: string;
  userName: string;
  timestamp: number;
  details?: Record<string, any>;
}
