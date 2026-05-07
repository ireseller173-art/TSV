import * as Crypto from 'expo-crypto';

/**
 * E2E Encryption Service for TSV Keeper
 * Provides end-to-end encryption for messages
 */
export class E2EEncryptionService {
  /**
   * Generate encryption key pair
   */
  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const publicKey = await Crypto.generateRandomAsync(32);
      const privateKey = await Crypto.generateRandomAsync(32);
      
      return {
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString(),
      };
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }

  /**
   * Encrypt message with shared key
   */
  static async encryptMessage(message: string, sharedKey: string): Promise<string> {
    try {
      const encoded = new TextEncoder().encode(message);
      const keyBytes = Buffer.from(sharedKey, 'hex');
      
      // Simple XOR encryption (for demo purposes)
      // In production, use proper encryption like libsodium
      const encrypted = Buffer.alloc(encoded.length);
      for (let i = 0; i < encoded.length; i++) {
        encrypted[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return encrypted.toString('hex');
    } catch (error) {
      console.error('Error encrypting message:', error);
      throw error;
    }
  }

  /**
   * Decrypt message with shared key
   */
  static async decryptMessage(encryptedMessage: string, sharedKey: string): Promise<string> {
    try {
      const encrypted = Buffer.from(encryptedMessage, 'hex');
      const keyBytes = Buffer.from(sharedKey, 'hex');
      
      // Simple XOR decryption (for demo purposes)
      const decrypted = Buffer.alloc(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Error decrypting message:', error);
      throw error;
    }
  }

  /**
   * Generate shared key from two public keys
   */
  static async generateSharedKey(publicKey1: string, publicKey2: string): Promise<string> {
    try {
      const combined = publicKey1 + publicKey2;
      const hash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, combined);
      return hash;
    } catch (error) {
      console.error('Error generating shared key:', error);
      throw error;
    }
  }

  /**
   * Hash password for storage
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, password);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const passwordHash = await this.hashPassword(password);
      return passwordHash === hash;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Generate random token
   */
  static async generateToken(length: number = 32): Promise<string> {
    try {
      const randomBytes = await Crypto.generateRandomAsync(length);
      return randomBytes.toString();
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }
}
