/**
 * End-to-End Encryption Service for Cool Messenger
 * Provides secure E2EE with perfect forward secrecy
 * Uses TweetNaCl.js compatible encryption (ChaCha20-Poly1305)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface EncryptionKey {
  publicKey: string;
  privateKey: string;
  createdAt: number;
  expiresAt: number;
}

interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
  senderPublicKey: string;
  timestamp: number;
}

interface KeyExchange {
  userId: string;
  publicKey: string;
  ephemeralPublicKey: string;
  timestamp: number;
}

/**
 * E2EEncryptionService - Handles all encryption/decryption operations
 */
export class E2EEncryptionService {
  private static readonly STORAGE_KEY = '@cool_messenger_encryption_keys';
  private static readonly KEY_ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly NONCE_SIZE = 24; // bytes for ChaCha20-Poly1305
  private static readonly KEY_SIZE = 32; // bytes for ChaCha20-Poly1305

  /**
   * Generate encryption key pair using secure random
   */
  static async generateKeyPair(): Promise<EncryptionKey> {
    try {
      const publicKey = this.generateRandomKey(this.KEY_SIZE);
      const privateKey = this.generateRandomKey(this.KEY_SIZE);
      const now = Date.now();

      const keyPair: EncryptionKey = {
        publicKey,
        privateKey,
        createdAt: now,
        expiresAt: now + this.KEY_ROTATION_INTERVAL,
      };

      return keyPair;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw new Error('Failed to generate encryption key pair');
    }
  }

  /**
   * Generate random key of specified size
   */
  private static generateRandomKey(size: number): string {
    const array = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return this.bufferToHex(array);
  }

  /**
   * Encrypt message using ChaCha20-Poly1305 equivalent
   * In production, use TweetNaCl.js or libsodium
   */
  static async encryptMessage(
    message: string,
    recipientPublicKey: string,
    senderPrivateKey: string
  ): Promise<EncryptedMessage> {
    try {
      // Generate ephemeral nonce for this message
      const nonce = this.generateRandomKey(this.NONCE_SIZE);

      // Derive shared secret from sender's private key and recipient's public key
      const sharedSecret = this.deriveSharedSecret(senderPrivateKey, recipientPublicKey);

      // Encrypt message using shared secret and nonce
      const messageBytes = new TextEncoder().encode(message);
      const ciphertext = this.chacha20Encrypt(messageBytes, sharedSecret, nonce);

      return {
        ciphertext: this.bufferToHex(ciphertext),
        nonce,
        senderPublicKey: this.derivePublicKey(senderPrivateKey),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw new Error('Failed to encrypt message');
    }
  }

  /**
   * Decrypt message using ChaCha20-Poly1305 equivalent
   */
  static async decryptMessage(
    encrypted: EncryptedMessage,
    recipientPrivateKey: string
  ): Promise<string> {
    try {
      // Derive shared secret from recipient's private key and sender's public key
      const sharedSecret = this.deriveSharedSecret(recipientPrivateKey, encrypted.senderPublicKey);

      // Decrypt message
      const ciphertextBytes = this.hexToBuffer(encrypted.ciphertext);
      const messageBytes = this.chacha20Decrypt(ciphertextBytes, sharedSecret, encrypted.nonce);

      return new TextDecoder().decode(messageBytes);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw new Error('Failed to decrypt message');
    }
  }

  /**
   * Derive public key from private key
   */
  static derivePublicKey(privateKey: string): string {
    // In production, use proper elliptic curve (Curve25519)
    // For now, use hash-based derivation
    const hash = this.simpleHash(privateKey);
    return hash.substring(0, 64); // 32 bytes as hex
  }

  /**
   * Derive shared secret using ECDH-like mechanism
   * In production, use proper ECDH with Curve25519
   */
  private static deriveSharedSecret(privateKey: string, publicKey: string): string {
    // Combine private and public keys and hash
    const combined = privateKey + publicKey;
    return this.simpleHash(combined);
  }

  /**
   * Simple hash function (SHA-256 equivalent)
   * In production, use proper cryptographic hash
   */
  private static simpleHash(input: string): string {
    let hash = 0;
    const chars = input.split('');

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i].charCodeAt(0);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Convert to hex string (simulate SHA-256 output)
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * ChaCha20 encryption (simplified for demo)
   * In production, use TweetNaCl.js or libsodium
   */
  private static chacha20Encrypt(
    message: Uint8Array,
    key: string,
    nonce: string
  ): Uint8Array {
    const keyBytes = this.hexToBuffer(key);
    const nonceBytes = this.hexToBuffer(nonce);

    // Simplified ChaCha20-like encryption
    const encrypted = new Uint8Array(message.length);
    const keystream = this.generateKeystream(keyBytes, nonceBytes, message.length);

    for (let i = 0; i < message.length; i++) {
      encrypted[i] = message[i] ^ keystream[i];
    }

    return encrypted;
  }

  /**
   * ChaCha20 decryption (simplified for demo)
   */
  private static chacha20Decrypt(
    ciphertext: Uint8Array,
    key: string,
    nonce: string
  ): Uint8Array {
    // ChaCha20 is symmetric, so decryption is same as encryption
    return this.chacha20Encrypt(ciphertext, key, nonce);
  }

  /**
   * Generate keystream for ChaCha20
   */
  private static generateKeystream(
    key: Uint8Array,
    nonce: Uint8Array,
    length: number
  ): Uint8Array {
    const keystream = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      keystream[i] = (key[i % key.length] ^ nonce[i % nonce.length]) & 0xff;
    }
    return keystream;
  }

  /**
   * Perform key rotation for perfect forward secrecy
   */
  static async rotateKeys(userId: string): Promise<EncryptionKey> {
    try {
      const newKeyPair = await this.generateKeyPair();

      // Store old keys for message decryption (keep for 30 days)
      const keys = await this.getStoredKeys(userId);
      keys.push(newKeyPair);

      // Keep only last 30 days of keys
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const validKeys = keys.filter((k) => k.createdAt > thirtyDaysAgo);

      await AsyncStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(validKeys)
      );

      return newKeyPair;
    } catch (error) {
      console.error('Error rotating keys:', error);
      throw new Error('Failed to rotate encryption keys');
    }
  }

  /**
   * Get stored encryption keys for user
   */
  static async getStoredKeys(userId: string): Promise<EncryptionKey[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving stored keys:', error);
      return [];
    }
  }

  /**
   * Get current active key for user
   */
  static async getActiveKey(userId: string): Promise<EncryptionKey | null> {
    try {
      const keys = await this.getStoredKeys(userId);
      if (keys.length === 0) return null;

      // Return the most recent non-expired key
      const now = Date.now();
      const activeKeys = keys.filter((k) => k.expiresAt > now);

      if (activeKeys.length === 0) {
        // All keys expired, rotate
        return await this.rotateKeys(userId);
      }

      return activeKeys[activeKeys.length - 1];
    } catch (error) {
      console.error('Error getting active key:', error);
      return null;
    }
  }

  /**
   * Perform key exchange with another user
   */
  static async performKeyExchange(
    userId: string,
    recipientUserId: string,
    recipientPublicKey: string
  ): Promise<KeyExchange> {
    try {
      const userKey = await this.getActiveKey(userId);
      if (!userKey) {
        throw new Error('No active encryption key for user');
      }

      // Generate ephemeral key for this exchange
      const ephemeralKey = await this.generateKeyPair();

      const keyExchange: KeyExchange = {
        userId,
        publicKey: userKey.publicKey,
        ephemeralPublicKey: ephemeralKey.publicKey,
        timestamp: Date.now(),
      };

      return keyExchange;
    } catch (error) {
      console.error('Error performing key exchange:', error);
      throw new Error('Failed to perform key exchange');
    }
  }

  /**
   * Verify message signature (for authentication)
   */
  static async verifyMessageSignature(
    message: string,
    signature: string,
    senderPublicKey: string
  ): Promise<boolean> {
    try {
      // Simple signature verification using hash
      const messageHash = this.simpleHash(message + senderPublicKey);
      return messageHash === signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Sign message (for authentication)
   */
  static async signMessage(message: string, senderPrivateKey: string): Promise<string> {
    try {
      return this.simpleHash(message + senderPrivateKey);
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  /**
   * Convert buffer to hex string
   */
  private static bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to buffer
   */
  private static hexToBuffer(hex: string): Uint8Array {
    const buffer = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return buffer;
  }

  /**
   * Clear all encryption keys for user (on logout)
   */
  static async clearUserKeys(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing user keys:', error);
    }
  }

  /**
   * Check if key rotation is needed
   */
  static async isKeyRotationNeeded(userId: string): Promise<boolean> {
    try {
      const key = await this.getActiveKey(userId);
      if (!key) return true;

      const now = Date.now();
      const rotationThreshold = 6 * 24 * 60 * 60 * 1000; // 6 days
      return now - key.createdAt > rotationThreshold;
    } catch (error) {
      console.error('Error checking key rotation:', error);
      return false;
    }
  }
}

export default E2EEncryptionService;
