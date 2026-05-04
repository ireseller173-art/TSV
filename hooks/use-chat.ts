import { useState, useEffect, useCallback } from "react";
import { chatService, Message, Chat } from "@/lib/chat-service";

export function useChat(chatId: string) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load chat and messages
  useEffect(() => {
    const loadChat = async () => {
      try {
        setIsLoading(true);
        const chats = await chatService.getChats();
        const foundChat = chats.find((c) => c.id === chatId);
        setChat(foundChat || null);

        const msgs = await chatService.getMessages(chatId);
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId]);

  const sendMessage = useCallback(
    async (text: string, senderId: string, senderName: string, senderAvatar: string) => {
      try {
        const message: Message = {
          id: `msg_${Date.now()}`,
          chatId,
          senderId,
          senderName,
          senderAvatar,
          text,
          timestamp: Date.now(),
          status: "sending",
          type: "text",
          reactions: {},
        };

        // Save message
        await chatService.saveMessage(message);
        setMessages((prev) => [...prev, message]);

        // Update chat last message
        if (chat) {
          await chatService.saveChat({
            ...chat,
            lastMessage: text,
            lastMessageTime: Date.now(),
          });
        }

        // Simulate delivery
        setTimeout(async () => {
          const updatedMessage = { ...message, status: "delivered" as const };
          await chatService.saveMessage(updatedMessage);
          setMessages((prev) =>
            prev.map((m) => (m.id === message.id ? updatedMessage : m))
          );
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [chatId, chat]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string, userId: string) => {
      try {
        await chatService.addReaction(chatId, messageId, emoji, userId);
        const msgs = await chatService.getMessages(chatId);
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add reaction");
      }
    },
    [chatId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        await chatService.deleteMessage(chatId, messageId);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete message");
      }
    },
    [chatId]
  );

  return {
    chat,
    messages,
    isLoading,
    error,
    sendMessage,
    addReaction,
    deleteMessage,
  };
}
