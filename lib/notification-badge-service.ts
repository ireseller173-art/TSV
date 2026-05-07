import * as Notifications from 'expo-notifications';

/**
 * Notification Badge Service
 * Manages app icon badge count for unread notifications
 */
export class NotificationBadgeService {
  /**
   * Set badge count on app icon
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log(`✅ Badge count set to ${count}`);
    } catch (error) {
      console.warn('Error setting badge count:', error);
    }
  }

  /**
   * Get current badge count
   */
  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.warn('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Increment badge count
   */
  static async incrementBadgeCount(): Promise<void> {
    try {
      const current = await this.getBadgeCount();
      await this.setBadgeCount(current + 1);
    } catch (error) {
      console.warn('Error incrementing badge count:', error);
    }
  }

  /**
   * Decrement badge count
   */
  static async decrementBadgeCount(): Promise<void> {
    try {
      const current = await this.getBadgeCount();
      if (current > 0) {
        await this.setBadgeCount(current - 1);
      }
    } catch (error) {
      console.warn('Error decrementing badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  static async clearBadgeCount(): Promise<void> {
    try {
      await this.setBadgeCount(0);
      console.log('✅ Badge count cleared');
    } catch (error) {
      console.warn('Error clearing badge count:', error);
    }
  }

  /**
   * Set badge count for unread messages
   */
  static async setUnreadMessageBadge(unreadCount: number): Promise<void> {
    try {
      await this.setBadgeCount(unreadCount);
    } catch (error) {
      console.warn('Error setting unread message badge:', error);
    }
  }

  /**
   * Set badge count for unread notifications
   */
  static async setUnreadNotificationBadge(unreadCount: number): Promise<void> {
    try {
      await this.setBadgeCount(unreadCount);
    } catch (error) {
      console.warn('Error setting unread notification badge:', error);
    }
  }

  /**
   * Set badge count for missed calls
   */
  static async setMissedCallBadge(missedCount: number): Promise<void> {
    try {
      await this.setBadgeCount(missedCount);
    } catch (error) {
      console.warn('Error setting missed call badge:', error);
    }
  }
}
