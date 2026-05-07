import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export interface DeviceSyncState {
  userId: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notificationPreferences: Record<string, boolean>;
  favoriteChats: string[];
  pinnedChats: string[];
  blockedUsers: string[];
  mutedChats: string[];
  lastUpdated: number;
  deviceId: string;
}

const SYNC_STATE_KEY = '@cool_messenger_sync_state';

export class MultiDeviceSyncService {
  private static syncUnsubscribe: (() => void) | null = null;

  /**
   * Initialize multi-device sync
   */
  static async initializeSync(userId: string, deviceId: string): Promise<void> {
    try {
      const db = getFirestore();
      const userSyncRef = doc(db, 'users', userId, 'sync', 'state');

      // Get current local state
      const localState = await this.getLocalState(userId, deviceId);

      // Merge with remote state
      const remoteSnap = await getDoc(userSyncRef);
      if (remoteSnap.exists()) {
        const remoteState = remoteSnap.data() as DeviceSyncState;
        const mergedState = this.mergeStates(localState, remoteState);
        await this.saveLocalState(mergedState);
        await this.saveRemoteState(mergedState);
      } else {
        // Create new remote state
        await setDoc(userSyncRef, localState);
      }

      // Listen for remote changes
      this.listenForRemoteChanges(userId, deviceId);
    } catch (error) {
      console.error('Error initializing sync:', error);
    }
  }

  /**
   * Get local sync state
   */
  static async getLocalState(userId: string, deviceId: string): Promise<DeviceSyncState> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_STATE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return default state
      return {
        userId,
        language: 'en',
        theme: 'auto',
        notificationPreferences: {},
        favoriteChats: [],
        pinnedChats: [],
        blockedUsers: [],
        mutedChats: [],
        lastUpdated: Date.now(),
        deviceId,
      };
    } catch (error) {
      console.error('Error getting local state:', error);
      return {
        userId,
        language: 'en',
        theme: 'auto',
        notificationPreferences: {},
        favoriteChats: [],
        pinnedChats: [],
        blockedUsers: [],
        mutedChats: [],
        lastUpdated: Date.now(),
        deviceId,
      };
    }
  }

  /**
   * Save local sync state
   */
  static async saveLocalState(state: DeviceSyncState): Promise<void> {
    try {
      state.lastUpdated = Date.now();
      await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving local state:', error);
    }
  }

  /**
   * Save remote sync state to Firestore
   */
  static async saveRemoteState(state: DeviceSyncState): Promise<void> {
    try {
      const db = getFirestore();
      const userSyncRef = doc(db, 'users', state.userId, 'sync', 'state');

      state.lastUpdated = Date.now();
      await updateDoc(userSyncRef, state as any).catch(async () => {
        // If document doesn't exist, create it
        await setDoc(userSyncRef, state);
      });
    } catch (error) {
      console.error('Error saving remote state:', error);
    }
  }

  /**
   * Listen for remote changes
   */
  static listenForRemoteChanges(userId: string, deviceId: string): void {
    try {
      const db = getFirestore();
      const userSyncRef = doc(db, 'users', userId, 'sync', 'state');

      this.syncUnsubscribe = onSnapshot(userSyncRef, async (snapshot) => {
        if (snapshot.exists()) {
          const remoteState = snapshot.data() as DeviceSyncState;

          // Only update if remote state is newer
          if (remoteState.deviceId !== deviceId) {
            const localState = await this.getLocalState(userId, deviceId);

            if (remoteState.lastUpdated > localState.lastUpdated) {
              const mergedState = this.mergeStates(localState, remoteState);
              await this.saveLocalState(mergedState);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error listening for remote changes:', error);
    }
  }

  /**
   * Merge local and remote states
   */
  private static mergeStates(
    localState: DeviceSyncState,
    remoteState: DeviceSyncState
  ): DeviceSyncState {
    return {
      userId: localState.userId,
      language: remoteState.lastUpdated > localState.lastUpdated ? remoteState.language : localState.language,
      theme: remoteState.lastUpdated > localState.lastUpdated ? remoteState.theme : localState.theme,
      notificationPreferences: {
        ...localState.notificationPreferences,
        ...remoteState.notificationPreferences,
      },
      favoriteChats: Array.from(new Set([...localState.favoriteChats, ...remoteState.favoriteChats])),
      pinnedChats: Array.from(new Set([...localState.pinnedChats, ...remoteState.pinnedChats])),
      blockedUsers: Array.from(new Set([...localState.blockedUsers, ...remoteState.blockedUsers])),
      mutedChats: Array.from(new Set([...localState.mutedChats, ...remoteState.mutedChats])),
      lastUpdated: Math.max(localState.lastUpdated, remoteState.lastUpdated),
      deviceId: localState.deviceId,
    };
  }

  /**
   * Update language across devices
   */
  static async updateLanguage(userId: string, language: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.language = language;
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }

  /**
   * Update theme across devices
   */
  static async updateTheme(
    userId: string,
    theme: 'light' | 'dark' | 'auto',
    deviceId: string
  ): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.theme = theme;
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  }

  /**
   * Add favorite chat
   */
  static async addFavoriteChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      if (!state.favoriteChats.includes(chatId)) {
        state.favoriteChats.push(chatId);
        await this.saveLocalState(state);
        await this.saveRemoteState(state);
      }
    } catch (error) {
      console.error('Error adding favorite chat:', error);
    }
  }

  /**
   * Remove favorite chat
   */
  static async removeFavoriteChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.favoriteChats = state.favoriteChats.filter((id) => id !== chatId);
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error removing favorite chat:', error);
    }
  }

  /**
   * Pin chat
   */
  static async pinChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      if (!state.pinnedChats.includes(chatId)) {
        state.pinnedChats.push(chatId);
        await this.saveLocalState(state);
        await this.saveRemoteState(state);
      }
    } catch (error) {
      console.error('Error pinning chat:', error);
    }
  }

  /**
   * Unpin chat
   */
  static async unpinChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.pinnedChats = state.pinnedChats.filter((id) => id !== chatId);
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error unpinning chat:', error);
    }
  }

  /**
   * Block user
   */
  static async blockUser(userId: string, blockedUserId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      if (!state.blockedUsers.includes(blockedUserId)) {
        state.blockedUsers.push(blockedUserId);
        await this.saveLocalState(state);
        await this.saveRemoteState(state);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  /**
   * Unblock user
   */
  static async unblockUser(userId: string, blockedUserId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.blockedUsers = state.blockedUsers.filter((id) => id !== blockedUserId);
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }

  /**
   * Mute chat
   */
  static async muteChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      if (!state.mutedChats.includes(chatId)) {
        state.mutedChats.push(chatId);
        await this.saveLocalState(state);
        await this.saveRemoteState(state);
      }
    } catch (error) {
      console.error('Error muting chat:', error);
    }
  }

  /**
   * Unmute chat
   */
  static async unmuteChat(userId: string, chatId: string, deviceId: string): Promise<void> {
    try {
      const state = await this.getLocalState(userId, deviceId);
      state.mutedChats = state.mutedChats.filter((id) => id !== chatId);
      await this.saveLocalState(state);
      await this.saveRemoteState(state);
    } catch (error) {
      console.error('Error unmuting chat:', error);
    }
  }

  /**
   * Stop listening for remote changes
   */
  static stopSync(): void {
    if (this.syncUnsubscribe) {
      this.syncUnsubscribe();
      this.syncUnsubscribe = null;
    }
  }
}

export default MultiDeviceSyncService;
