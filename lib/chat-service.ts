import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebase-config";
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "voice" | "call";
  reactions: { [emoji: string]: string[] };
  isEdited?: boolean;
  editedAt?: number;
  isDeleted?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  isGroup: boolean;
  members: string[];
  createdAt: number;
}

const CHATS_KEY = "chats";
const MESSAGES_KEY = "messages";

export const chatService = {
  // Chat operations
  async getChats(): Promise<Chat[]> {
    try {
      const data = await AsyncStorage.getItem(CHATS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting chats:", error);
      return [];
    }
  },

  async saveChat(chat: Chat): Promise<void> {
    try {
      const chats = await this.getChats();
      const index = chats.findIndex((c) => c.id === chat.id);
      if (index > -1) {
        chats[index] = chat;
      } else {
        chats.push(chat);
      }
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  },

  async deleteChat(chatId: string): Promise<void> {
    try {
      const chats = await this.getChats();
      const filtered = chats.filter((c) => c.id !== chatId);
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  },

  // Message operations
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toMillis?.() || doc.data().timestamp,
        })) as Message[];
        if (messages.length > 0) {
          await AsyncStorage.setItem(`${MESSAGES_KEY}_${chatId}`, JSON.stringify(messages));
          return messages;
        }
      } catch (firebaseError) {
        console.warn("Firebase load failed, using local storage:", firebaseError);
      }
      
      const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${chatId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  },

  async saveMessage(message: Message): Promise<void> {
    try {
      const messages = await this.getMessages(message.chatId);
      const index = messages.findIndex((m) => m.id === message.id);
      if (index > -1) {
        messages[index] = message;
      } else {
        messages.push(message);
      }
      await AsyncStorage.setItem(
        `${MESSAGES_KEY}_${message.chatId}`,
        JSON.stringify(messages)
      );
      
      try {
        const messageRef = doc(db, "chats", message.chatId, "messages", message.id);
        await setDoc(messageRef, {
          ...message,
          timestamp: Timestamp.fromMillis(message.timestamp),
        });
      } catch (firebaseError) {
        console.warn("Firebase save failed, using local storage:", firebaseError);
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      const filtered = messages.filter((m) => m.id !== messageId);
      await AsyncStorage.setItem(
        `${MESSAGES_KEY}_${chatId}`,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  },

  async addReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        if (!message.reactions[emoji]) {
          message.reactions[emoji] = [];
        }
        if (!message.reactions[emoji].includes(userId)) {
          message.reactions[emoji].push(userId);
        }
        await this.saveMessage(message);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  },

  async removeReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      const message = messages.find((m) => m.id === messageId);
      if (message && message.reactions[emoji]) {
        message.reactions[emoji] = message.reactions[emoji].filter(
          (id) => id !== userId
        );
        if (message.reactions[emoji].length === 0) {
          delete message.reactions[emoji];
        }
        await this.saveMessage(message);
      }
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  },
};
