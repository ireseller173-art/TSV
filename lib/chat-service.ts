import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase-config";

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
  // Real-time listeners
  unsubscribers: new Map<string, Unsubscribe>(),

  // Chat operations with Firestore
  async getChats(): Promise<Chat[]> {
    try {
      const chatsRef = collection(db, "chats");
      const querySnapshot = await getDocs(chatsRef);
      const chats: Chat[] = [];
      querySnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      return chats;
    } catch (error) {
      // Fallback to AsyncStorage
      const data = await AsyncStorage.getItem(CHATS_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveChat(chat: Chat): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chat.id);
      await setDoc(chatRef, {
        ...chat,
        lastMessageTime: serverTimestamp(),
      });
    } catch (error) {
      // Fallback to AsyncStorage
      const chats = await this.getChats();
      const index = chats.findIndex((c) => c.id === chat.id);
      if (index > -1) {
        chats[index] = chat;
      } else {
        chats.push(chat);
      }
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    }
  },

  async deleteChat(chatId: string): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      await deleteDoc(chatRef);
    } catch (error) {
      // Fallback to AsyncStorage
      const chats = await this.getChats();
      const filtered = chats.filter((c) => c.id !== chatId);
      await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(filtered));
    }
  },

  // Message operations with Firestore
  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      return messages;
    } catch (error) {
      // Fallback to AsyncStorage
      const data = await AsyncStorage.getItem(`${MESSAGES_KEY}_${chatId}`);
      return data ? JSON.parse(data) : [];
    }
  },

  async saveMessage(message: Message): Promise<void> {
    try {
      const messageRef = doc(
        db,
        "chats",
        message.chatId,
        "messages",
        message.id
      );
      await setDoc(messageRef, {
        ...message,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      // Fallback to AsyncStorage
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
    }
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await deleteDoc(messageRef);
    } catch (error) {
    }
  },

  // Real-time listener for messages
  subscribeToMessages(
    chatId: string,
    callback: (messages: Message[]) => void
  ): Unsubscribe {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as Message);
        });
        callback(messages);
      });

      // Store unsubscriber for cleanup
      this.unsubscribers.set(`messages_${chatId}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      return () => {};
    }
  },

  // Real-time listener for chats
  subscribeToChats(callback: (chats: Chat[]) => void): Unsubscribe {
    try {
      const chatsRef = collection(db, "chats");

      const unsubscribe = onSnapshot(chatsRef, (querySnapshot) => {
        const chats: Chat[] = [];
        querySnapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() } as Chat);
        });
        callback(chats);
      });

      // Store unsubscriber for cleanup
      this.unsubscribers.set("chats", unsubscribe);
      return unsubscribe;
    } catch (error) {
      return () => {};
    }
  },

  // Cleanup all listeners
  unsubscribeAll(): void {
    this.unsubscribers.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.unsubscribers.clear();
  },

  // Unsubscribe from specific listener
  unsubscribe(key: string): void {
    const unsubscribe = this.unsubscribers.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribers.delete(key);
    }
  },

  // Mark message as read
  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(messageRef, {
        status: "read",
      });
    } catch (error) {
    }
  },

  // Mark all messages as read
  async markAllMessagesAsRead(chatId: string): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      for (const message of messages) {
        if (message.status !== "read") {
          await this.markMessageAsRead(chatId, message.id);
        }
      }
    } catch (error) {
    }
  },

  // Search messages
  async searchMessages(chatId: string, query: string): Promise<Message[]> {
    try {
      const messages = await this.getMessages(chatId);
      return messages.filter((m) =>
        m.text.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      return [];
    }
  },

  // Add reaction to message
  async addReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const reactions = messageDoc.data().reactions || {};
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (!reactions[emoji].includes(userId)) {
          reactions[emoji].push(userId);
        }
        await updateDoc(messageRef, { reactions });
      }
    } catch (error) {
    }
  },

  // Remove reaction from message
  async removeReaction(
    chatId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, "chats", chatId, "messages", messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const reactions = messageDoc.data().reactions || {};
        if (reactions[emoji]) {
          reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
          await updateDoc(messageRef, { reactions });
        }
      }
    } catch (error) {
    }
  },
};
