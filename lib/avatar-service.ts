/**
 * Avatar Service
 * Manages user avatars and default profile pictures
 */

export interface Avatar {
  userId: string;
  url?: string;
  hasCustomAvatar: boolean;
  uploadedAt?: number;
  size?: number;
  mimeType?: string;
}

/**
 * Default avatar SVG (neutral gray/white profile icon)
 */
const DEFAULT_AVATAR_SVG = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="200" height="200" fill="#E5E7EB"/>
  
  <!-- Head circle -->
  <circle cx="100" cy="70" r="35" fill="#9CA3AF"/>
  
  <!-- Body -->
  <path d="M 65 110 Q 65 105 100 105 Q 135 105 135 110 L 135 160 Q 135 170 125 170 L 75 170 Q 65 170 65 160 Z" fill="#9CA3AF"/>
</svg>
`;

/**
 * Avatar Service
 */
export const avatarService = {
  /**
   * Get default avatar SVG
   */
  getDefaultAvatarSVG(): string {
    return DEFAULT_AVATAR_SVG;
  },

  /**
   * Generate default avatar as data URL
   */
  generateDefaultAvatarDataUrl(): string {
    const svg = this.getDefaultAvatarSVG();
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  },

  /**
   * Create avatar object
   */
  createAvatar(userId: string, hasCustomAvatar: boolean = false): Avatar {
    return {
      userId,
      hasCustomAvatar,
      uploadedAt: hasCustomAvatar ? Date.now() : undefined,
    };
  },

  /**
   * Update avatar with URL
   */
  updateAvatarUrl(avatar: Avatar, url: string, size?: number, mimeType?: string): Avatar {
    return {
      ...avatar,
      url,
      hasCustomAvatar: true,
      uploadedAt: Date.now(),
      size,
      mimeType,
    };
  },

  /**
   * Reset to default avatar
   */
  resetToDefault(avatar: Avatar): Avatar {
    return {
      userId: avatar.userId,
      hasCustomAvatar: false,
    };
  },

  /**
   * Get avatar URL (custom or default)
   */
  getAvatarUrl(avatar: Avatar | undefined): string {
    if (avatar?.hasCustomAvatar && avatar?.url) {
      return avatar.url;
    }
    return this.generateDefaultAvatarDataUrl();
  },

  /**
   * Validate avatar file
   */
  validateAvatarFile(
    file: {
      size?: number;
      mimeType?: string;
      name?: string;
    },
    maxSizeMB: number = 5
  ): { valid: boolean; error?: string } {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size && file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Размер файла не должен превышать ${maxSizeMB}MB`,
      };
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (file.mimeType && !allowedMimeTypes.includes(file.mimeType)) {
      return {
        valid: false,
        error: 'Поддерживаются только форматы: JPEG, PNG, WebP, GIF',
      };
    }

    return { valid: true };
  },

  /**
   * Compress image for avatar
   */
  async compressAvatarImage(
    imageData: string,
    maxWidth: number = 300,
    maxHeight: number = 300,
    quality: number = 0.8
  ): Promise<string> {
    // For web/browser environment
    if (typeof Image !== 'undefined') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageData;
      });
    }

    // For React Native environment, return as-is
    return imageData;
  },

  /**
   * Get avatar initials (fallback for text-based avatar)
   */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Generate color for initials avatar
   */
  getInitialsBackgroundColor(userId: string): string {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
      '#BB8FCE', // Purple
      '#85C1E2', // Light Blue
    ];

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  },

  /**
   * Format avatar size for display
   */
  formatFileSize(bytes?: number): string {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    // Implementation would delete from Firebase Storage
  },

  /**
   * Upload avatar to Firebase Storage
   */
  async uploadAvatarToFirebase(
    userId: string,
    imageData: string,
    fileName: string
  ): Promise<{ url: string; path: string }> {
    // This would be implemented with Firebase Storage
    // For now, return mock response
    const path = `avatars/${userId}/${fileName}`;
    const url = `https://storage.googleapis.com/your-bucket/${path}`;

    return { url, path };
  },

  /**
   * Get avatar from Firebase Storage
   */
  async getAvatarFromFirebase(userId: string): Promise<Avatar | null> {
    // This would fetch from Firebase
    return null;
  },
};
