import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type MediaType = "image" | "video";

export interface MediaFile {
  id: string;
  uri: string;
  type: MediaType;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType: string;
  base64?: string;
  thumbnail?: string;
}

export interface MediaMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  media: MediaFile;
  caption?: string;
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const IMAGE_QUALITY = 0.8;

export const mediaService = {
  // Request permissions
  async requestMediaPermissions() {
    try {
      const cameraRoll = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const camera = await ImagePicker.requestCameraPermissionsAsync();
      return cameraRoll.granted && camera.granted;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  },

  // Pick image from library
  async pickImage(): Promise<MediaFile | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return this.createMediaFile(asset.uri, "image", asset.fileName || "image.jpg");
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      return null;
    }
  },

  // Pick video from library
  async pickVideo(): Promise<MediaFile | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return this.createMediaFile(asset.uri, "video", asset.fileName || "video.mp4");
      }
      return null;
    } catch (error) {
      console.error("Error picking video:", error);
      return null;
    }
  },

  // Take photo with camera
  async takePhoto(): Promise<MediaFile | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return this.createMediaFile(asset.uri, "image", `photo_${Date.now()}.jpg`);
      }
      return null;
    } catch (error) {
      console.error("Error taking photo:", error);
      return null;
    }
  },

  // Create media file object
  async createMediaFile(uri: string, type: MediaType, fileName: string): Promise<MediaFile> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileSize = (fileInfo as any).size || 0;

      // Validate file size
      if (type === "image" && fileSize > MAX_IMAGE_SIZE) {
        throw new Error("Image size exceeds 5MB limit");
      }
      if (type === "video" && fileSize > MAX_VIDEO_SIZE) {
        throw new Error("Video size exceeds 50MB limit");
      }

      const mimeType = this.getMimeType(fileName, type);

      return {
        id: `media_${Date.now()}`,
        uri,
        type,
        fileName,
        fileSize,
        mimeType,
      };
    } catch (error) {
      console.error("Error creating media file:", error);
      throw error;
    }
  },

  // Get MIME type from file name
  getMimeType(fileName: string, type: MediaType): string {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (type === "image") {
      switch (ext) {
        case "jpg":
        case "jpeg":
          return "image/jpeg";
        case "png":
          return "image/png";
        case "gif":
          return "image/gif";
        case "webp":
          return "image/webp";
        default:
          return "image/jpeg";
      }
    } else {
      switch (ext) {
        case "mp4":
          return "video/mp4";
        case "mov":
          return "video/quicktime";
        case "webm":
          return "video/webm";
        default:
          return "video/mp4";
      }
    }
  },

  // Convert file to base64
  async getBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error("Error converting to base64:", error);
      throw error;
    }
  },

  // Get file size in MB
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },

  // Delete media file
  async deleteMediaFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri);
    } catch (error) {
      console.error("Error deleting media file:", error);
    }
  },

  // Get video thumbnail (simplified - would need native module for production)
  async getVideoThumbnail(uri: string): Promise<string | null> {
    try {
      // In a production app, you'd use a library like react-native-video-thumbnail
      // For now, we'll return null
      return null;
    } catch (error) {
      console.error("Error getting video thumbnail:", error);
      return null;
    }
  },
};
