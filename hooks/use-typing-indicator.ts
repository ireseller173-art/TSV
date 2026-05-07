import { useEffect, useState } from 'react';
import { typingIndicatorService, TypingUser } from '@/lib/typing-indicator-service';

export function useTypingIndicator(chatId: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    const subject = typingIndicatorService.getTypingUsers(chatId);
    const subscription = subject.subscribe(users => {
      setTypingUsers(users);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId]);

  const setUserTyping = (userId: string, userName: string) => {
    typingIndicatorService.setUserTyping(chatId, userId, userName);
  };

  const removeUserTyping = (userId: string) => {
    typingIndicatorService.removeUserTyping(chatId, userId);
  };

  const getTypingText = () => {
    return typingIndicatorService.getTypingText(typingUsers);
  };

  return {
    typingUsers,
    setUserTyping,
    removeUserTyping,
    getTypingText,
    isAnyoneTyping: typingUsers.length > 0,
  };
}
