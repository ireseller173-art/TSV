/**
 * Message Status Service
 * Handles typing indicators and read receipts
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type TypingStatus = 'typing' | 'idle';

/**
 * Message status information
 */
export interface MessageStatusInfo {
  messageId: string;
  status: MessageStatus;
  timestamp: number;
  readBy?: string[]; // Array of user IDs who read the message
}

/**
 * Typing indicator information
 */
export interface TypingIndicator {
  userId: string;
  userName: string;
  chatId: string;
  status: TypingStatus;
  timestamp: number;
}

/**
 * Message Status Service
 */
export const messageStatusService = {
  /**
   * Create message status info
   */
  createMessageStatus(messageId: string, status: MessageStatus = 'sending'): MessageStatusInfo {
    return {
      messageId,
      status,
      timestamp: Date.now(),
      readBy: [],
    };
  },

  /**
   * Update message status
   */
  updateMessageStatus(
    messageStatus: MessageStatusInfo,
    newStatus: MessageStatus
  ): MessageStatusInfo {
    return {
      ...messageStatus,
      status: newStatus,
      timestamp: Date.now(),
    };
  },

  /**
   * Mark message as delivered
   */
  markAsDelivered(messageStatus: MessageStatusInfo): MessageStatusInfo {
    if (messageStatus.status === 'sending') {
      return this.updateMessageStatus(messageStatus, 'delivered');
    }
    return messageStatus;
  },

  /**
   * Mark message as read
   */
  markAsRead(messageStatus: MessageStatusInfo, userId: string): MessageStatusInfo {
    const readBy = messageStatus.readBy || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
    }
    return {
      ...messageStatus,
      status: 'read',
      readBy,
      timestamp: Date.now(),
    };
  },

  /**
   * Get status icon
   */
  getStatusIcon(status: MessageStatus): string {
    switch (status) {
      case 'sending':
        return '⏱️'; // Clock
      case 'sent':
        return '✓'; // Single checkmark
      case 'delivered':
        return '✓✓'; // Double checkmark
      case 'read':
        return '✓✓'; // Double checkmark (blue in UI)
      default:
        return '';
    }
  },

  /**
   * Get status label
   */
  getStatusLabel(status: MessageStatus): string {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return '';
    }
  },

  /**
   * Create typing indicator
   */
  createTypingIndicator(userId: string, userName: string, chatId: string): TypingIndicator {
    return {
      userId,
      userName,
      chatId,
      status: 'typing',
      timestamp: Date.now(),
    };
  },

  /**
   * Check if typing indicator is still valid (not older than 3 seconds)
   */
  isTypingIndicatorValid(indicator: TypingIndicator): boolean {
    const now = Date.now();
    const age = now - indicator.timestamp;
    return age < 3000; // 3 seconds timeout
  },

  /**
   * Get typing status text
   */
  getTypingStatusText(typingUsers: TypingIndicator[]): string {
    if (typingUsers.length === 0) {
      return '';
    }

    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    }

    return `${typingUsers.length} people are typing...`;
  },

  /**
   * Filter valid typing indicators
   */
  filterValidTypingIndicators(indicators: TypingIndicator[]): TypingIndicator[] {
    return indicators.filter((indicator) => this.isTypingIndicatorValid(indicator));
  },
};
