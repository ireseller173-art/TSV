import { BehaviorSubject } from 'rxjs';

export interface TypingUser {
  userId: string;
  userName: string;
  chatId: string;
  timestamp: number;
}

class TypingIndicatorService {
  private typingUsers = new Map<string, BehaviorSubject<TypingUser[]>>();
  private typingTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Get typing users for a chat
   */
  getTypingUsers(chatId: string): BehaviorSubject<TypingUser[]> {
    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new BehaviorSubject<TypingUser[]>([]));
    }
    return this.typingUsers.get(chatId)!;
  }

  /**
   * Set user as typing
   */
  setUserTyping(chatId: string, userId: string, userName: string): void {
    const subject = this.getTypingUsers(chatId);
    const currentUsers = subject.value;
    
    // Check if user already in typing list
    const existingIndex = currentUsers.findIndex(u => u.userId === userId);
    
    if (existingIndex >= 0) {
      // Update timestamp
      currentUsers[existingIndex].timestamp = Date.now();
    } else {
      // Add new typing user
      currentUsers.push({
        userId,
        userName,
        chatId,
        timestamp: Date.now(),
      });
    }
    
    subject.next([...currentUsers]);
    
    // Clear existing timeout
    const timeoutKey = `${chatId}_${userId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }
    
    // Set new timeout to remove user from typing list after 3 seconds
    const timeout = setTimeout(() => {
      this.removeUserTyping(chatId, userId);
    }, 3000) as unknown as NodeJS.Timeout;
    
    this.typingTimeouts.set(timeoutKey, timeout);
  }

  /**
   * Remove user from typing list
   */
  removeUserTyping(chatId: string, userId: string): void {
    const subject = this.getTypingUsers(chatId);
    const currentUsers = subject.value;
    const filtered = currentUsers.filter(u => u.userId !== userId);
    subject.next(filtered);
    
    // Clear timeout
    const timeoutKey = `${chatId}_${userId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      this.typingTimeouts.delete(timeoutKey);
    }
  }

  /**
   * Clear all typing users for a chat
   */
  clearChat(chatId: string): void {
    const subject = this.getTypingUsers(chatId);
    subject.next([]);
    
    // Clear all timeouts for this chat
    const timeoutKeys = Array.from(this.typingTimeouts.keys()).filter(key =>
      key.startsWith(`${chatId}_`)
    );
    
    timeoutKeys.forEach(key => {
      clearTimeout(this.typingTimeouts.get(key)!);
      this.typingTimeouts.delete(key);
    });
  }

  /**
   * Get typing indicator text
   */
  getTypingText(typingUsers: TypingUser[]): string {
    if (typingUsers.length === 0) {
      return '';
    }
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} ${typingUsers.length === 1 ? 'is typing' : 'are typing'}...`;
    }
    
    if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    }
    
    return `${typingUsers.length} people are typing...`;
  }
}

export const typingIndicatorService = new TypingIndicatorService();
