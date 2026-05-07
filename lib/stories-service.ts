import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: number;
  expiresAt: number;
  views: string[]; // userIds who viewed
  isPublic: boolean;
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
        const stories = await this.getAllStories();
        stories.push(newStory);
        await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
      } catch (error) {
        console.warn('AsyncStorage save failed:', error);
      }

      // Save to Firebase
      try {
        const db = getFirestore();
        const storiesRef = collection(db, 'stories');
        await addDoc(storiesRef, newStory);
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
   * Get all active stories
   */
  static async getAllStories(): Promise<Story[]> {
    try {
      const stored = await AsyncStorage.getItem(STORIES_KEY);
      const stories = stored ? JSON.parse(stored) : [];
      
      // Filter expired stories
      const now = Date.now();
      return stories.filter((story: Story) => story.expiresAt > now);
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  }

  /**
   * Get stories from specific user
   */
  static async getUserStories(userId: string): Promise<Story[]> {
    try {
      const stories = await this.getAllStories();
      return stories.filter((story) => story.userId === userId);
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
      const stories = await this.getAllStories();
      const story = stories.find((s) => s.id === storyId);
      
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
      const stories = await this.getAllStories();
      const filtered = stories.filter((s) => s.id !== storyId);
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
      const stories = await AsyncStorage.getItem(STORIES_KEY);
      if (!stories) return 0;
      
      const allStories = JSON.parse(stories);
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
