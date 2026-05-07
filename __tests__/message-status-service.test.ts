import { describe, it, expect } from 'vitest';
import { messageStatusService, MessageStatus } from '@/lib/message-status-service';

describe('Message Status Service', () => {
  describe('createMessageStatus', () => {
    it('should create message status with default sending status', () => {
      const status = messageStatusService.createMessageStatus('msg_123');
      expect(status.messageId).toBe('msg_123');
      expect(status.status).toBe('sending');
      expect(status.readBy).toEqual([]);
    });

    it('should create message status with custom status', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'delivered');
      expect(status.status).toBe('delivered');
    });
  });

  describe('updateMessageStatus', () => {
    it('should update message status', () => {
      const initial = messageStatusService.createMessageStatus('msg_123', 'sending');
      const updated = messageStatusService.updateMessageStatus(initial, 'delivered');
      expect(updated.status).toBe('delivered');
      expect(updated.messageId).toBe('msg_123');
    });
  });

  describe('markAsDelivered', () => {
    it('should mark sending message as delivered', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'sending');
      const delivered = messageStatusService.markAsDelivered(status);
      expect(delivered.status).toBe('delivered');
    });

    it('should not change already delivered message', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'delivered');
      const result = messageStatusService.markAsDelivered(status);
      expect(result.status).toBe('delivered');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read and add user to readBy', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'delivered');
      const read = messageStatusService.markAsRead(status, 'user_456');
      expect(read.status).toBe('read');
      expect(read.readBy).toContain('user_456');
    });

    it('should not add duplicate readers', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'delivered');
      let read = messageStatusService.markAsRead(status, 'user_456');
      read = messageStatusService.markAsRead(read, 'user_456');
      expect(read.readBy?.filter((id) => id === 'user_456').length).toBe(1);
    });

    it('should add multiple readers', () => {
      const status = messageStatusService.createMessageStatus('msg_123', 'delivered');
      let read = messageStatusService.markAsRead(status, 'user_456');
      read = messageStatusService.markAsRead(read, 'user_789');
      expect(read.readBy?.length).toBe(2);
      expect(read.readBy).toContain('user_456');
      expect(read.readBy).toContain('user_789');
    });
  });

  describe('getStatusIcon', () => {
    it('should return correct icons for each status', () => {
      expect(messageStatusService.getStatusIcon('sending')).toBe('⏱️');
      expect(messageStatusService.getStatusIcon('sent')).toBe('✓');
      expect(messageStatusService.getStatusIcon('delivered')).toBe('✓✓');
      expect(messageStatusService.getStatusIcon('read')).toBe('✓✓');
    });
  });

  describe('getStatusLabel', () => {
    it('should return correct labels for each status', () => {
      expect(messageStatusService.getStatusLabel('sending')).toBe('Sending...');
      expect(messageStatusService.getStatusLabel('sent')).toBe('Sent');
      expect(messageStatusService.getStatusLabel('delivered')).toBe('Delivered');
      expect(messageStatusService.getStatusLabel('read')).toBe('Read');
    });
  });

  describe('createTypingIndicator', () => {
    it('should create typing indicator', () => {
      const indicator = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      expect(indicator.userId).toBe('user_123');
      expect(indicator.userName).toBe('John');
      expect(indicator.chatId).toBe('chat_456');
      expect(indicator.status).toBe('typing');
    });
  });

  describe('isTypingIndicatorValid', () => {
    it('should return true for recent typing indicator', () => {
      const indicator = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      expect(messageStatusService.isTypingIndicatorValid(indicator)).toBe(true);
    });

    it('should return false for old typing indicator', () => {
      const indicator = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      indicator.timestamp = Date.now() - 4000; // 4 seconds old
      expect(messageStatusService.isTypingIndicatorValid(indicator)).toBe(false);
    });
  });

  describe('getTypingStatusText', () => {
    it('should return empty string for no typing users', () => {
      expect(messageStatusService.getTypingStatusText([])).toBe('');
    });

    it('should return single user typing text', () => {
      const indicator = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      const text = messageStatusService.getTypingStatusText([indicator]);
      expect(text).toBe('John is typing...');
    });

    it('should return two users typing text', () => {
      const ind1 = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      const ind2 = messageStatusService.createTypingIndicator('user_456', 'Jane', 'chat_456');
      const text = messageStatusService.getTypingStatusText([ind1, ind2]);
      expect(text).toBe('John and Jane are typing...');
    });

    it('should return multiple users typing text', () => {
      const ind1 = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      const ind2 = messageStatusService.createTypingIndicator('user_456', 'Jane', 'chat_456');
      const ind3 = messageStatusService.createTypingIndicator('user_789', 'Bob', 'chat_456');
      const text = messageStatusService.getTypingStatusText([ind1, ind2, ind3]);
      expect(text).toBe('3 people are typing...');
    });
  });

  describe('filterValidTypingIndicators', () => {
    it('should filter out old typing indicators', () => {
      const recent = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      const old = messageStatusService.createTypingIndicator('user_456', 'Jane', 'chat_456');
      old.timestamp = Date.now() - 4000;

      const filtered = messageStatusService.filterValidTypingIndicators([recent, old]);
      expect(filtered.length).toBe(1);
      expect(filtered[0].userId).toBe('user_123');
    });

    it('should keep all valid indicators', () => {
      const ind1 = messageStatusService.createTypingIndicator('user_123', 'John', 'chat_456');
      const ind2 = messageStatusService.createTypingIndicator('user_456', 'Jane', 'chat_456');

      const filtered = messageStatusService.filterValidTypingIndicators([ind1, ind2]);
      expect(filtered.length).toBe(2);
    });
  });
});
