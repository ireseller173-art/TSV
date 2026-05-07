import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { messageStatusService, MessageStatusInfo, TypingIndicator } from './message-status-service';

/**
 * Message Status Context Type
 */
interface MessageStatusContextType {
  // Message status management
  messageStatuses: Map<string, MessageStatusInfo>;
  updateMessageStatus: (messageId: string, status: MessageStatusInfo) => void;
  markMessageAsDelivered: (messageId: string) => void;
  markMessageAsRead: (messageId: string, userId: string) => void;
  getMessageStatus: (messageId: string) => MessageStatusInfo | undefined;

  // Typing indicators
  typingIndicators: TypingIndicator[];
  setUserTyping: (userId: string, userName: string, chatId: string) => void;
  setUserIdle: (userId: string, chatId: string) => void;
  getTypingUsers: (chatId: string) => TypingIndicator[];
  getTypingStatusText: (chatId: string) => string;
}

const MessageStatusContext = createContext<MessageStatusContextType | undefined>(undefined);

/**
 * Message Status Provider Component
 */
export function MessageStatusProvider({ children }: { children: React.ReactNode }) {
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatusInfo>>(new Map());
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);

  // Clean up old typing indicators every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndicators((prev) => {
        const validIndicators = messageStatusService.filterValidTypingIndicators(prev);
        if (validIndicators.length !== prev.length) {
          return validIndicators;
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: MessageStatusInfo) => {
    setMessageStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.set(messageId, status);
      return newMap;
    });
  }, []);

  const markMessageAsDelivered = useCallback((messageId: string) => {
    setMessageStatuses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(messageId);
      if (current) {
        newMap.set(messageId, messageStatusService.markAsDelivered(current));
      }
      return newMap;
    });
  }, []);

  const markMessageAsRead = useCallback((messageId: string, userId: string) => {
    setMessageStatuses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(messageId);
      if (current) {
        newMap.set(messageId, messageStatusService.markAsRead(current, userId));
      }
      return newMap;
    });
  }, []);

  const getMessageStatus = useCallback(
    (messageId: string): MessageStatusInfo | undefined => {
      return messageStatuses.get(messageId);
    },
    [messageStatuses]
  );

  const setUserTyping = useCallback((userId: string, userName: string, chatId: string) => {
    setTypingIndicators((prev) => {
      // Remove existing indicator for this user
      const filtered = prev.filter((ind) => ind.userId !== userId);
      // Add new typing indicator
      const newIndicator = messageStatusService.createTypingIndicator(userId, userName, chatId);
      return [...filtered, newIndicator];
    });
  }, []);

  const setUserIdle = useCallback((userId: string, chatId: string) => {
    setTypingIndicators((prev) => prev.filter((ind) => ind.userId !== userId || ind.chatId !== chatId));
  }, []);

  const getTypingUsers = useCallback(
    (chatId: string): TypingIndicator[] => {
      return typingIndicators.filter(
        (ind) => ind.chatId === chatId && messageStatusService.isTypingIndicatorValid(ind)
      );
    },
    [typingIndicators]
  );

  const getTypingStatusText = useCallback(
    (chatId: string): string => {
      const typingUsers = getTypingUsers(chatId);
      return messageStatusService.getTypingStatusText(typingUsers);
    },
    [getTypingUsers]
  );

  const value: MessageStatusContextType = {
    messageStatuses,
    updateMessageStatus,
    markMessageAsDelivered,
    markMessageAsRead,
    getMessageStatus,
    typingIndicators,
    setUserTyping,
    setUserIdle,
    getTypingUsers,
    getTypingStatusText,
  };

  return (
    <MessageStatusContext.Provider value={value}>
      {children}
    </MessageStatusContext.Provider>
  );
}

/**
 * Hook to use message status context
 */
export function useMessageStatus() {
  const context = useContext(MessageStatusContext);
  if (!context) {
    throw new Error('useMessageStatus must be used within MessageStatusProvider');
  }
  return context;
}
