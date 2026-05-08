/**
 * Badge Counter Service
 * 
 * Manages app badge counters for unread messages and missed calls
 * Updates the app icon badge on iOS and Android
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BadgeCount {
  unreadMessages: number;
  missedCalls: number;
  total: number;
}

const BADGE_STORAGE_KEY = 'tsv_keeper_badge_count';

/**
 * Get current badge count
 */
export async function getBadgeCount(): Promise<BadgeCount> {
  try {
    const stored = await AsyncStorage.getItem(BADGE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { unreadMessages: 0, missedCalls: 0, total: 0 };
  } catch (error) {
    return { unreadMessages: 0, missedCalls: 0, total: 0 };
  }
}

/**
 * Update badge count for unread messages
 */
export async function incrementUnreadMessages(count: number = 1): Promise<void> {
  try {
    const current = await getBadgeCount();
    const updated: BadgeCount = {
      unreadMessages: current.unreadMessages + count,
      missedCalls: current.missedCalls,
      total: current.unreadMessages + count + current.missedCalls,
    };
    await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updated));
    await updateAppBadge(updated.total);
  } catch (error) {
  }
}

/**
 * Update badge count for missed calls
 */
export async function incrementMissedCalls(count: number = 1): Promise<void> {
  try {
    const current = await getBadgeCount();
    const updated: BadgeCount = {
      unreadMessages: current.unreadMessages,
      missedCalls: current.missedCalls + count,
      total: current.unreadMessages + current.missedCalls + count,
    };
    await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updated));
    await updateAppBadge(updated.total);
  } catch (error) {
  }
}

/**
 * Reset unread messages counter
 */
export async function resetUnreadMessages(): Promise<void> {
  try {
    const current = await getBadgeCount();
    const updated: BadgeCount = {
      unreadMessages: 0,
      missedCalls: current.missedCalls,
      total: current.missedCalls,
    };
    await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updated));
    await updateAppBadge(updated.total);
  } catch (error) {
  }
}

/**
 * Reset missed calls counter
 */
export async function resetMissedCalls(): Promise<void> {
  try {
    const current = await getBadgeCount();
    const updated: BadgeCount = {
      unreadMessages: current.unreadMessages,
      missedCalls: 0,
      total: current.unreadMessages,
    };
    await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updated));
    await updateAppBadge(updated.total);
  } catch (error) {
  }
}

/**
 * Reset all counters
 */
export async function resetAllBadges(): Promise<void> {
  try {
    const updated: BadgeCount = {
      unreadMessages: 0,
      missedCalls: 0,
      total: 0,
    };
    await AsyncStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(updated));
    await updateAppBadge(0);
  } catch (error) {
  }
}

/**
 * Update app icon badge
 */
async function updateAppBadge(count: number): Promise<void> {
  try {
    // For iOS and Android
    if (count > 0) {
      await Notifications.setBadgeCountAsync(count);
    } else {
      await Notifications.setBadgeCountAsync(0);
    }
  } catch (error) {
  }
}

/**
 * Get unread message count for a specific chat
 */
export async function getUnreadCountForChat(chatId: string): Promise<number> {
  try {
    const key = `unread_chat_${chatId}`;
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Increment unread count for a specific chat
 */
export async function incrementUnreadForChat(chatId: string, count: number = 1): Promise<void> {
  try {
    const key = `unread_chat_${chatId}`;
    const current = await getUnreadCountForChat(chatId);
    await AsyncStorage.setItem(key, (current + count).toString());
  } catch (error) {
  }
}

/**
 * Reset unread count for a specific chat
 */
export async function resetUnreadForChat(chatId: string): Promise<void> {
  try {
    const key = `unread_chat_${chatId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
  }
}

/**
 * Get missed call count for a specific contact
 */
export async function getMissedCallCountForContact(contactId: string): Promise<number> {
  try {
    const key = `missed_calls_${contactId}`;
    const count = await AsyncStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Increment missed call count for a specific contact
 */
export async function incrementMissedCallsForContact(contactId: string, count: number = 1): Promise<void> {
  try {
    const key = `missed_calls_${contactId}`;
    const current = await getMissedCallCountForContact(contactId);
    await AsyncStorage.setItem(key, (current + count).toString());
  } catch (error) {
  }
}

/**
 * Reset missed call count for a specific contact
 */
export async function resetMissedCallsForContact(contactId: string): Promise<void> {
  try {
    const key = `missed_calls_${contactId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
  }
}
