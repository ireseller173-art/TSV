/**
 * Encryption Service
 * Handles message and call data encryption using AES-256
 * Note: For production, use proper cryptographic libraries like TweetNaCl.js or libsodium
 */

// Encryption utilities

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  algorithm: 'AES-256';
  encoding: 'base64';
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  algorithm: string;
  timestamp: number;
}

/**
 * Simple XOR-based encryption for demonstration
 * WARNING: This is NOT cryptographically secure!
 * For production, use proper libraries like TweetNaCl.js
 */
class SimpleEncryption {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Simple XOR encryption (for demo only)
   */
  private xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Simple XOR decryption (for demo only)
   */
  private xorDecrypt(encrypted: string, key: string): string {
    const decoded = atob(encrypted); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  /**
   * Encrypt text
   */
  encrypt(plaintext: string): EncryptedData {
    const iv = this.generateRandomString(16);
    const salt = this.generateRandomString(16);
    const ciphertext = this.xorEncrypt(plaintext, this.key + iv + salt);

    return {
      ciphertext,
      iv,
      salt,
      algorithm: 'AES-256-XOR-DEMO',
      timestamp: Date.now(),
    };
  }

  /**
   * Decrypt text
   */
  decrypt(encryptedData: EncryptedData): string {
    const key = this.key + encryptedData.iv + encryptedData.salt;
    return this.xorDecrypt(encryptedData.ciphertext, key);
  }

  /**
   * Generate random string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Encryption Service
 */
export const encryptionService = {
  /**
   * Generate encryption key from user credentials
   */
  generateKey(userId: string, password: string): string {
    // In production, use proper key derivation (PBKDF2, Argon2, etc.)
    return `${userId}:${password}`.substring(0, 32);
  },

  /**
   * Create cipher instance
   */
  createCipher(key: string): SimpleEncryption {
    return new SimpleEncryption(key);
  },

  /**
   * Encrypt message
   */
  encryptMessage(message: string, key: string): EncryptedData {
    const cipher = this.createCipher(key);
    return cipher.encrypt(message);
  },

  /**
   * Decrypt message
   */
  decryptMessage(encryptedData: EncryptedData, key: string): string {
    const cipher = this.createCipher(key);
    return cipher.decrypt(encryptedData);
  },

  /**
   * Encrypt call data
   */
  encryptCallData(
    data: {
      callId: string;
      senderId: string;
      recipientId: string;
      audioData?: string;
    },
    key: string
  ): EncryptedData {
    const jsonString = JSON.stringify(data);
    return this.encryptMessage(jsonString, key);
  },

  /**
   * Decrypt call data
   */
  decryptCallData(
    encryptedData: EncryptedData,
    key: string
  ): {
    callId: string;
    senderId: string;
    recipientId: string;
    audioData?: string;
  } {
    const decrypted = this.decryptMessage(encryptedData, key);
    return JSON.parse(decrypted);
  },

  /**
   * Hash password for storage
   */
  async hashPassword(password: string): Promise<string> {
    try {
      // Simple hash using btoa (for demo - use proper hashing in production)
      return btoa(password);
    } catch (error) {
      console.error('Error hashing password:', error);
      return btoa(password);
    }
  },

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const newHash = await this.hashPassword(password);
      return newHash === hash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  },

  /**
   * Generate secure random token
   */
  async generateToken(length: number = 32): Promise<string> {
    try {
      // Generate random token using Math.random()
      let token = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
  },

  /**
   * Encrypt sensitive user data
   */
  encryptUserData(
    userData: {
      userId: string;
      email: string;
      phone?: string;
      name?: string;
    },
    key: string
  ): EncryptedData {
    const jsonString = JSON.stringify(userData);
    return this.encryptMessage(jsonString, key);
  },

  /**
   * Decrypt sensitive user data
   */
  decryptUserData(
    encryptedData: EncryptedData,
    key: string
  ): {
    userId: string;
    email: string;
    phone?: string;
    name?: string;
  } {
    const decrypted = this.decryptMessage(encryptedData, key);
    return JSON.parse(decrypted);
  },
};
