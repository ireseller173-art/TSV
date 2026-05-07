import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
  bio?: string;
  createdAt: number;
  updatedAt: number;
  lastSeen?: number;
  isOnline?: boolean;
}

const USER_PROFILE_KEY = 'user_profile';
const ALL_USERS_KEY = 'all_users';

export class UserProfileService {
  /**
   * Create or update user profile
   */
  static async saveProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      if (!profile.id) {
        console.error('User ID is required');
        return null;
      }

      const existing = await this.getProfile(profile.id);
      const now = Date.now();

      const updated: UserProfile = {
        id: profile.id,
        name: profile.name || existing?.name || 'Unknown',
        email: profile.email || existing?.email || '',
        phone: profile.phone || existing?.phone,
        avatar: profile.avatar || existing?.avatar,
        status: profile.status || existing?.status || 'Hey there!',
        bio: profile.bio || existing?.bio,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        lastSeen: existing?.lastSeen,
        isOnline: existing?.isOnline,
      };

      // Save individual profile
      await AsyncStorage.setItem(`${USER_PROFILE_KEY}_${profile.id}`, JSON.stringify(updated));

      // Add to all users list
      await this.addToUsersList(updated);
      
      // Save to Firebase Firestore
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', profile.id);
        await setDoc(userRef, updated, { merge: true });
      } catch (firebaseError) {
        console.warn('Firebase save failed, using local storage:', firebaseError);
      }

      return updated;
    } catch (error) {
      console.error('Error saving profile:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Try Firebase first
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Cache in AsyncStorage
          await AsyncStorage.setItem(`${USER_PROFILE_KEY}_${userId}`, JSON.stringify(data));
          return data;
        }
      } catch (firebaseError) {
        console.warn('Firebase get failed, using local storage:', firebaseError);
      }
      
      // Fall back to AsyncStorage
      const profileJson = await AsyncStorage.getItem(`${USER_PROFILE_KEY}_${userId}`);
      return profileJson ? JSON.parse(profileJson) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Update user name
   */
  static async updateName(userId: string, name: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        return null;
      }

      return this.saveProfile({
        ...profile,
        name,
      });
    } catch (error) {
      console.error('Error updating name:', error);
      return null;
    }
  }

  /**
   * Update user status
   */
  static async updateStatus(userId: string, status: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        return null;
      }

      return this.saveProfile({
        ...profile,
        status,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      return null;
    }
  }

  /**
   * Update user bio
   */
  static async updateBio(userId: string, bio: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        return null;
      }

      return this.saveProfile({
        ...profile,
        bio,
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      return null;
    }
  }

  /**
   * Update user avatar
   */
  static async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        return null;
      }

      return this.saveProfile({
        ...profile,
        avatar: avatarUrl,
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      return null;
    }
  }

  /**
   * Update user phone
   */
  static async updatePhone(userId: string, phone: string): Promise<UserProfile | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) {
        return null;
      }

      return this.saveProfile({
        ...profile,
        phone,
      });
    } catch (error) {
      console.error('Error updating phone:', error);
      return null;
    }
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersJson = await AsyncStorage.getItem(ALL_USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Search users by name or email
   */
  static async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const users = await this.getAllUsers();
      const lowerQuery = query.toLowerCase();

      return users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Add user to users list
   */
  private static async addToUsersList(profile: UserProfile): Promise<void> {
    try {
      const users = await this.getAllUsers();
      const index = users.findIndex((u) => u.id === profile.id);

      if (index > -1) {
        users[index] = profile;
      } else {
        users.push(profile);
      }

      await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error adding user to list:', error);
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(`${USER_PROFILE_KEY}_${userId}`);

      // Remove from users list
      const users = await this.getAllUsers();
      const filtered = users.filter((u) => u.id !== userId);
      await AsyncStorage.setItem(ALL_USERS_KEY, JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  /**
   * Clear all profiles
   */
  static async clearProfiles(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ALL_USERS_KEY);
      const allKeys = await AsyncStorage.getAllKeys();
      const profileKeys = allKeys.filter((key) => key.startsWith(USER_PROFILE_KEY));

      if (profileKeys.length > 0) {
        await AsyncStorage.multiRemove(profileKeys);
      }
    } catch (error) {
      console.error('Error clearing profiles:', error);
    }
  }
}
