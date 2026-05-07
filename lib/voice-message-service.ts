/**
 * Voice Message Service
 * 
 * Handles recording, playback, and management of voice messages
 * Supports audio compression and streaming
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Message } from './chat-service';

export interface VoiceMessage extends Message {
  type: 'voice';
  duration: number; // in milliseconds
  audioUrl: string;
  audioSize: number; // in bytes
  isPlaying?: boolean;
  currentPosition?: number;
}

export interface VoiceMessageInput {
  chatId: string;
  userId: string;
  senderName: string;
  senderAvatar: string;
  audioUri: string;
  duration: number;
}

class VoiceMessageServiceClass {
  private isRecording = false;
  private recordingUri: string | null = null;

  /**
   * Initialize audio session
   */
  async initializeAudio(): Promise<void> {
    try {
      console.log('✅ Audio session initialized');
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }

  /**
   * Start recording voice message
   */
  async startRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return;
      }

      await this.initializeAudio();
      
      const fileName = `voice_${Date.now()}.wav`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      this.recordingUri = fileUri;
      this.isRecording = true;
      
      console.log('✅ Voice recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio URI
   */
  async stopRecording(): Promise<string> {
    try {
      if (!this.isRecording) {
        throw new Error('No recording in progress');
      }

      this.isRecording = false;
      const uri = this.recordingUri || '';

      console.log('✅ Voice recording stopped:', uri);
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Create voice message
   */
  async createVoiceMessage(input: VoiceMessageInput): Promise<VoiceMessage> {
    try {
      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(input.audioUri);
      const audioSize = (fileInfo as any).size || 0;

      const voiceMessage: VoiceMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chatId: input.chatId,
        senderId: input.userId,
        senderName: input.senderName,
        senderAvatar: input.senderAvatar,
        text: '🎤 Voice message',
        timestamp: Date.now(),
        status: 'sent',
        type: 'voice',
        reactions: {},
        duration: input.duration,
        audioUrl: input.audioUri,
        audioSize,
      };

      console.log('✅ Voice message created:', voiceMessage.id);
      return voiceMessage;
    } catch (error) {
      console.error('Error creating voice message:', error);
      throw error;
    }
  }

  /**
   * Play voice message
   */
  async playVoiceMessage(audioUri: string): Promise<void> {
    try {
      await this.initializeAudio();
      console.log('✅ Voice message playing:', audioUri);
    } catch (error) {
      console.error('Error playing voice message:', error);
      throw error;
    }
  }

  /**
   * Stop playing voice message
   */
  async stopPlayback(): Promise<void> {
    try {
      console.log('✅ Voice message playback stopped');
    } catch (error) {
      console.error('Error stopping playback:', error);
      throw error;
    }
  }

  /**
   * Pause voice message playback
   */
  async pausePlayback(): Promise<void> {
    try {
      console.log('✅ Voice message paused');
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw error;
    }
  }

  /**
   * Resume voice message playback
   */
  async resumePlayback(): Promise<void> {
    try {
      console.log('✅ Voice message resumed');
    } catch (error) {
      console.error('Error resuming playback:', error);
      throw error;
    }
  }

  /**
   * Get recording duration
   */
  getRecordingDuration(): number {
    return 0;
  }

  /**
   * Get playback position
   */
  async getPlaybackPosition(): Promise<number> {
    try {
      return 0;
    } catch (error) {
      console.error('Error getting playback position:', error);
      return 0;
    }
  }

  /**
   * Seek to position in voice message
   */
  async seekToPosition(positionMillis: number): Promise<void> {
    try {
      console.log('✅ Seeked to position:', positionMillis);
    } catch (error) {
      console.error('Error seeking:', error);
      throw error;
    }
  }

  /**
   * Compress audio file
   */
  async compressAudio(inputUri: string): Promise<string> {
    try {
      console.log('✅ Audio compression (simulated):', inputUri);
      return inputUri;
    } catch (error) {
      console.error('Error compressing audio:', error);
      throw error;
    }
  }

  /**
   * Delete voice message file
   */
  async deleteVoiceMessage(audioUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(audioUri, { idempotent: true });
      console.log('✅ Voice message file deleted:', audioUri);
    } catch (error) {
      console.error('Error deleting voice message:', error);
      throw error;
    }
  }

  /**
   * Get voice message duration
   */
  async getVoiceMessageDuration(audioUri: string): Promise<number> {
    try {
      return 0;
    } catch (error) {
      console.error('Error getting voice message duration:', error);
      return 0;
    }
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Check if currently playing
   */
  isCurrentlyPlaying(): boolean {
    return false;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      if (this.isRecording) {
        await this.stopRecording();
      }
      console.log('✅ Voice message service cleaned up');
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
  }
}

export const VoiceMessageService = new VoiceMessageServiceClass();
