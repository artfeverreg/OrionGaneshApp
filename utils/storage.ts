import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSession } from '../types/database';

const STORAGE_KEYS = {
  USER_SESSION: 'user_session',
  LAST_SCRATCH_TIME: 'last_scratch_time',
  COLLECTED_STICKERS: 'collected_stickers',
};

export class StorageManager {
  static async saveUserSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  }

  static async getUserSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  static async updateLastScratchTime(): Promise<void> {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCRATCH_TIME, now);
      
      // Also update session
      const session = await this.getUserSession();
      if (session) {
        session.lastScratchTime = new Date(now);
        await this.saveUserSession(session);
      }
    } catch (error) {
      console.error('Error updating last scratch time:', error);
    }
  }

  static async getLastScratchTime(): Promise<Date | null> {
    try {
      const timeString = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCRATCH_TIME);
      return timeString ? new Date(timeString) : null;
    } catch (error) {
      console.error('Error getting last scratch time:', error);
      return null;
    }
  }

  static async addCollectedSticker(stickerId: string): Promise<void> {
    try {
      const session = await this.getUserSession();
      if (session) {
        if (!session.collectedStickers.includes(stickerId)) {
          session.collectedStickers.push(stickerId);
          await this.saveUserSession(session);
        }
      }
    } catch (error) {
      console.error('Error adding collected sticker:', error);
    }
  }

  static async getCollectedStickers(): Promise<string[]> {
    try {
      const session = await this.getUserSession();
      return session?.collectedStickers || [];
    } catch (error) {
      console.error('Error getting collected stickers:', error);
      return [];
    }
  }

  static async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.LAST_SCRATCH_TIME,
        STORAGE_KEYS.COLLECTED_STICKERS,
      ]);
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  static canScratchToday(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const lastScratch = await this.getLastScratchTime();
        if (!lastScratch) {
          resolve(true);
          return;
        }

        const now = new Date();
        const timeDiff = now.getTime() - lastScratch.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        resolve(hoursDiff >= 24);
      } catch (error) {
        console.error('Error checking scratch availability:', error);
        resolve(true);
      }
    });
  }

  static getTimeUntilNextScratch(): Promise<number> {
    return new Promise(async (resolve) => {
      try {
        const lastScratch = await this.getLastScratchTime();
        if (!lastScratch) {
          resolve(0);
          return;
        }

        const now = new Date();
        const nextScratchTime = new Date(lastScratch.getTime() + (24 * 60 * 60 * 1000));
        const timeRemaining = Math.max(0, nextScratchTime.getTime() - now.getTime());
        
        resolve(timeRemaining);
      } catch (error) {
        console.error('Error calculating time until next scratch:', error);
        resolve(0);
      }
    });
  }
}