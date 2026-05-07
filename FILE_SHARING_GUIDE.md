# File Sharing Implementation Guide

## Overview

TSV Keeper now includes comprehensive file sharing functionality with support for documents, images, audio, and video files. Users can share files in chats and groups with automatic preview, download, and caching capabilities.

## Features

### File Types Supported
- **Images**: JPEG, PNG, GIF, WebP, SVG (max 10 MB)
- **Documents**: PDF, Word, Excel, PowerPoint, Text, JSON (max 50 MB)
- **Audio**: MP3, WAV, OGG, AAC, FLAC (max 100 MB)
- **Video**: MP4, MPEG, MOV, AVI, WebM (max 500 MB)
- **Archives**: ZIP, RAR, 7Z, GZIP, TAR (max 100 MB)

### Core Capabilities

1. **File Picker Modal**
   - Select from photo gallery
   - Take photos with camera
   - Pick documents
   - Pick audio files
   - Pick video files
   - Multiple file selection support
   - File validation before upload

2. **File Preview Modal**
   - Image preview with full resolution
   - Document preview with file info
   - Audio player with duration
   - Video player with dimensions
   - Archive file information
   - Download button
   - Share button

3. **File Service**
   - Upload with progress tracking
   - Download with progress tracking
   - Local file caching
   - Cache expiry management
   - File metadata storage
   - Activity logging

4. **File Management**
   - File size validation
   - MIME type detection
   - Checksum verification
   - File compression options
   - Encryption support
   - Permission management

## Architecture

### File Types (`lib/types/file-sharing.ts`)

```typescript
// Main file metadata structure
interface FileMetadata {
  id: string;
  name: string;
  type: FileType; // 'image' | 'document' | 'audio' | 'video' | 'archive' | 'other'
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

// Upload progress tracking
interface FileUploadProgress {
  fileId: string;
  fileName: string;
  status: FileUploadStatus; // 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled'
  progress: number; // 0-100
  bytesUploaded: number;
  totalBytes: number;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Download progress tracking
interface FileDownloadProgress {
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

// File message for chat
interface FileMessage {
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
  reactions?: Record<string, string[]>;
  readBy?: string[];
  deliveredTo?: string[];
}
```

### File Service (`lib/file-sharing-service.ts`)

Core functions for file management:

```typescript
// Initialization
initializeFileSharing(): Promise<void>

// Validation
validateFile(file: FileMetadata): FileValidationResult
getFileType(mimeType: string): FileType
formatFileSize(bytes: number): string

// Upload/Download
uploadFile(file: FileMetadata, onProgress?: (progress: FileUploadProgress) => void): Promise<string>
downloadFile(file: FileMetadata, onProgress?: (progress: FileDownloadProgress) => void): Promise<string>

// Caching
cacheFile(file: FileMetadata): Promise<string>
getCachedFile(fileId: string): Promise<string | null>
cleanupExpiredCache(): Promise<void>
clearAllCache(): Promise<void>
getCacheStats(): Promise<CacheStats>

// Metadata
saveFileMetadata(file: FileMetadata): Promise<void>
getFileMetadata(fileId: string): Promise<FileMetadata | null>
getAllFileMetadata(): Promise<FileMetadata[]>
deleteFileMetadata(fileId: string): Promise<void>

// Statistics
getFileSharingStats(): Promise<FileSharingStats>

// Activity Logging
logFileActivity(activity: FileActivityLog): Promise<void>
getFileActivityLog(): Promise<FileActivityLog[]>
getFileActivity(fileId: string): Promise<FileActivityLog[]>
clearActivityLog(): Promise<void>
```

### UI Components

#### FilePickerModal (`components/file-picker-modal.tsx`)

Allows users to select files from device:

```typescript
interface FilePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onFilesSelected: (result: FilePickerResult) => void;
  options?: FilePickerOptions;
}

// Usage
<FilePickerModal
  visible={showPicker}
  onClose={() => setShowPicker(false)}
  onFilesSelected={handleFilesSelected}
  options={{
    allowMultiple: true,
    fileTypes: ['image', 'document'],
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024,
  }}
/>
```

#### FilePreviewModal (`components/file-preview-modal.tsx`)

Displays file preview with download option:

```typescript
interface FilePreviewModalProps {
  visible: boolean;
  file: FileMetadata | null;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

// Usage
<FilePreviewModal
  visible={showPreview}
  file={selectedFile}
  onClose={() => setShowPreview(false)}
  onDownload={handleDownload}
  onShare={handleShare}
/>
```

## Integration Guide

### 1. Add File Sharing to Chat Screen

```typescript
import { FilePickerModal } from '@/components/file-picker-modal';
import { FilePreviewModal } from '@/components/file-preview-modal';
import { uploadFile, downloadFile } from '@/lib/file-sharing-service';

export function ChatScreen() {
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesSelected = async (result: FilePickerResult) => {
    for (const file of result.files) {
      try {
        const remoteUrl = await uploadFile(file, (progress) => {
          setUploadProgress(progress.progress);
        });

        // Send file message to chat
        await sendFileMessage({
          ...file,
          remoteUrl,
          uploadedAt: Date.now(),
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const handleFilePreview = (file: FileMetadata) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleDownloadFile = async () => {
    if (!selectedFile) return;

    try {
      const localPath = await downloadFile(selectedFile, (progress) => {
        console.log(`Downloaded: ${progress.progress}%`);
      });

      console.log('File downloaded to:', localPath);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  return (
    <View className="flex-1">
      {/* Chat messages */}
      <ScrollView>
        {messages.map((msg) => (
          <View key={msg.id}>
            {msg.file ? (
              <TouchableOpacity onPress={() => handleFilePreview(msg.file)}>
                <FileMessageBubble file={msg.file} />
              </TouchableOpacity>
            ) : (
              <TextMessageBubble text={msg.text} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* File picker button */}
      <TouchableOpacity
        onPress={() => setShowFilePicker(true)}
        className="p-4"
      >
        <MaterialIcons name="attach-file" size={24} />
      </TouchableOpacity>

      {/* Modals */}
      <FilePickerModal
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFilesSelected={handleFilesSelected}
      />

      <FilePreviewModal
        visible={showFilePreview}
        file={selectedFile}
        onClose={() => setShowFilePreview(false)}
        onDownload={handleDownloadFile}
      />
    </View>
  );
}
```

### 2. File Message Bubble Component

```typescript
import { FileMetadata, formatFileSize } from '@/lib/file-sharing-service';

export function FileMessageBubble({ file }: { file: FileMetadata }) {
  const colors = useColors();

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image':
        return 'image';
      case 'document':
        return 'description';
      case 'audio':
        return 'audio-file';
      case 'video':
        return 'video-library';
      case 'archive':
        return 'folder-zip';
      default:
        return 'insert-drive-file';
    }
  };

  return (
    <View
      className="p-3 rounded-lg flex-row items-center gap-3"
      style={{ backgroundColor: colors.surface }}
    >
      <MaterialIcons
        name={getFileIcon(file.type)}
        size={32}
        color={colors.primary}
      />
      <View className="flex-1">
        <Text
          className="font-semibold text-foreground"
          numberOfLines={1}
        >
          {file.name}
        </Text>
        <Text className="text-xs text-muted">
          {formatFileSize(file.size)}
        </Text>
      </View>
      <MaterialIcons
        name="download"
        size={20}
        color={colors.primary}
      />
    </View>
  );
}
```

### 3. Initialize File Sharing on App Start

```typescript
import { initializeFileSharing } from '@/lib/file-sharing-service';

export function App() {
  useEffect(() => {
    initializeFileSharing().catch(console.error);
  }, []);

  return (
    // App content
  );
}
```

## Firebase Integration

### Firestore Schema

```javascript
// files collection
{
  fileId: string,
  name: string,
  type: string,
  mimeType: string,
  size: number,
  remoteUrl: string,
  uploadedBy: string,
  uploadedAt: timestamp,
  chatId: string,
  groupId: string,
  metadata: {
    width?: number,
    height?: number,
    duration?: number,
    pages?: number,
  },
  permissions: {
    canDownload: boolean,
    canShare: boolean,
    canDelete: boolean,
    expiresAt?: timestamp,
  },
  createdAt: timestamp,
  updatedAt: timestamp,
}

// file-activity collection
{
  fileId: string,
  action: string, // 'uploaded', 'downloaded', 'shared', 'deleted'
  userId: string,
  userName: string,
  timestamp: timestamp,
  details: object,
}
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Files collection
    match /files/{fileId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.uploadedBy == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.uploadedBy == request.auth.uid;
    }

    // File activity collection
    match /file-activity/{activityId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Testing

The file sharing system includes 36 comprehensive unit tests covering:

- File validation (size, name, type)
- File type detection
- File size formatting
- File metadata management
- File statistics
- Activity logging
- Cache management
- File-specific tests (images, audio, video)

Run tests with:
```bash
pnpm test
```

## Performance Considerations

1. **Cache Management**
   - Files are cached for 7 days
   - Maximum cache size: 500 MB
   - Automatic cleanup of expired files
   - LRU (Least Recently Used) eviction when cache exceeds limit

2. **Upload/Download**
   - Progress tracking for large files
   - Resumable uploads/downloads
   - Automatic retry on failure
   - Bandwidth throttling support

3. **Memory Usage**
   - Lazy loading of file previews
   - Streaming for large files
   - Efficient image compression
   - Metadata-only storage

## Troubleshooting

### File Upload Fails
- Check file size against limits
- Verify network connection
- Check storage permissions
- Review file MIME type

### Preview Not Showing
- Ensure file is downloaded first
- Check file format support
- Verify file integrity
- Clear cache and retry

### Cache Issues
- Run `clearAllCache()` to reset
- Check available storage space
- Review cache expiry settings
- Monitor cache statistics

## Future Enhancements

1. **Advanced Features**
   - File encryption for sensitive documents
   - Watermarking for shared files
   - OCR for document text extraction
   - Video transcoding for optimization

2. **Performance**
   - Parallel uploads/downloads
   - Delta sync for file updates
   - P2P file sharing
   - CDN integration

3. **Security**
   - End-to-end encryption
   - Digital signatures
   - Malware scanning
   - DLP (Data Loss Prevention)

## Support

For issues or questions about file sharing, refer to:
- Firebase documentation: https://firebase.google.com/docs
- Expo documentation: https://docs.expo.dev
- TSV Keeper GitHub: [Your repository]
