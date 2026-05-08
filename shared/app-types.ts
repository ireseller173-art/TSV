/**
 * Shared Application Types
 * Unified type definitions used across the application
 */

/**
 * User type - Single source of truth for user data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Chat type
 */
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

/**
 * Message type
 */
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

/**
 * Call type
 */
export interface Call {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "ringing" | "active" | "ended" | "missed" | "rejected";
  type: "audio" | "video";
}

/**
 * Notification type
 */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "message" | "call" | "system";
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
}

/**
 * Contact type
 */
export interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: number;
}

/**
 * Group type
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: string[];
  admins: string[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Note type
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * File type
 */
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: number;
  uploadedBy: string;
  url?: string;
  chatId?: string;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  error: string | null;
}

/**
 * Theme type
 */
export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination type
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
