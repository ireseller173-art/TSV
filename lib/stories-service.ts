import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  caption?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: number;
  expiresAt: number;
  views: string[]; // userIds who viewed
  isPublic: boolean;
}

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar?: string;
  stories: Story[];
}

const STORIES_KEY = 'stories';
const STORY_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export class StoriesService {
  /**
   * Create a new story
   */
  static async createStory(story: Omit<Story, 'id' | 'createdAt' | 'expiresAt' | 'views'>): Promise<Story> {
    try {
      const id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      
      const newStory: Story = {
        ...story,
        id,
        createdAt: now,
        expiresAt: now + STORY_EXPIRY_TIME,
        views: [],
      };

      // Save to AsyncStorage
      try {
        const stored = await AsyncStorage.getItem(STORIES_KEY);
        const stories = stored ? JSON.parse(stored) : [];
        stories.push(newStory);
        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
      } catch (error) {
        console.warn('AsyncStorage save failed:', error);
      }

      // Save to Firebase (optional)
      try {
        // Firebase save would go here
        // const db = getFirestore();
        // const storiesRef = collection(db, 'stories');
        // await addDoc(storiesRef, newStory);
      } catch (error) {
        console.warn('Firebase save failed:', error);
      }

      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  /**
   * Get all active stories grouped by user
   */
  static async getAllStories(): Promise<UserStory[]> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      const stories = stored ? JSON.parse(stored) : [];
      
      // Filter expired stories
      const now = Date.now();
      const active = stories.filter((story: Story) => story.expiresAt > now);
      
      // Group by user
      const grouped: Record<string, UserStory> = {};
      active.forEach((story: Story) => {
        if (!grouped[story.userId]) {
          grouped[story.userId] = {
            userId: story.userId,
            userName: story.userName,
            userAvatar: story.userAvatar,
            stories: [],
          };
        }
        grouped[story.userId].stories.push(story);
      });
      
      return Object.values(grouped);
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  /**
   * Get time remaining for story (in seconds)
   */
  static getTimeRemaining(createdAt: number): number {
    const now = Date.now();
    const elapsed = now - createdAt;
    const remaining = Math.max(0, STORY_EXPIRY_TIME - elapsed);
    return Math.floor(remaining / 1000); // Convert to seconds
  }

  /**
   * Get stories from specific user
   */
  static async getUserStories(userId: string): Promise<Story[]> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      const stories = stored ? JSON.parse(stored) : [];
      
      const now = Date.now();
      return stories.filter((story: Story) => story.userId === userId && story.expiresAt > now);
    } catch (error) {
      console.error('Error getting user stories:', error);
      return [];
    }
  }

  /**
   * Add view to story
   */
  static async addStoryView(storyId: string, userId: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      const stories = stored ? JSON.parse(stored) : [];
      const story = stories.find((s: Story) => s.id === storyId);
      
      if (story && !story.views.includes(userId)) {
        story.views.push(userId);
        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding story view:', error);
      return false;
    }
  }

  /**
   * Delete story
   */
  static async deleteStory(storyId: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      const stories = stored ? JSON.parse(stored) : [];
      const filtered = stories.filter((s: Story) => s.id !== storyId);
      await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      return false;
    }
  }

  /**
   * Clean up expired stories
   */
  static async cleanupExpiredStories(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      if (!stored) return 0;
      
      const allStories = JSON.parse(stored);
      const now = Date.now();
      const active = allStories.filter((s: Story) => s.expiresAt > now);
      const expired = allStories.length - active.length;
      
      if (expired > 0) {
        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(active));
      }
      
      return expired;
    } catch (error) {
      console.error('Error cleaning up stories:', error);
      return 0;
    }
  }
}
