import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  duration: number; // в секундах
  timestamp: number;
  status: 'completed' | 'missed' | 'rejected' | 'cancelled';
  isGroupCall?: boolean;
  groupId?: string;
}

const CALL_HISTORY_KEY = 'call_history';
const MAX_HISTORY_RECORDS = 500;

export class CallHistoryService {
  /**
   * Сохранить запись о звонке
   */
  static async recordCall(callRecord: Omit<CallRecord, 'id'>): Promise<CallRecord> {
    try {
      const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const record: CallRecord = {
        ...callRecord,
        id,
      };

      // Сохранить в AsyncStorage
      try {
        const history = await this.getCallHistory();
        history.unshift(record);
        // Ограничить размер истории
        if (history.length > MAX_HISTORY_RECORDS) {
          history.pop();
        }
        await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(history));
      } catch (storageError) {
        console.warn('AsyncStorage save failed:', storageError);
      }

      // Сохранить в Firebase
      try {
        const db = getFirestore();
        const callsRef = collection(db, 'calls');
        await addDoc(callsRef, record);
        console.log('✅ Call recorded in Firebase:', id);
      } catch (firebaseError) {
        console.warn('Firebase save failed:', firebaseError);
      }

      return record;
    } catch (error) {
      console.error('Error recording call:', error);
      throw error;
    }
  }

  /**
   * Получить полную историю звонков
   */
  static async getCallHistory(): Promise<CallRecord[]> {
    try {
      // Сначала пытаемся загрузить из Firebase
      try {
        const db = getFirestore();
        const callsRef = collection(db, 'calls');
        const q = query(callsRef);
        const snapshot = await getDocs(q);
        const records: CallRecord[] = [];
        snapshot.forEach((doc) => {
          records.push(doc.data() as CallRecord);
        });
        return records.sort((a, b) => b.timestamp - a.timestamp);
      } catch (firebaseError) {
        console.warn('Firebase query failed:', firebaseError);
      }

      // Если Firebase не доступен, загружаем из AsyncStorage
      const stored = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting call history:', error);
      return [];
    }
  }

  /**
   * Получить историю звонков с конкретным пользователем
   */
  static async getCallHistoryWithUser(userId: string): Promise<CallRecord[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter(
        (call) => call.callerId === userId || call.recipientId === userId
      );
    } catch (error) {
      console.error('Error getting call history with user:', error);
      return [];
    }
  }

  /**
   * Получить входящие звонки
   */
  static async getIncomingCalls(): Promise<CallRecord[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter((call) => call.callType === 'incoming');
    } catch (error) {
      console.error('Error getting incoming calls:', error);
      return [];
    }
  }

  /**
   * Получить исходящие звонки
   */
  static async getOutgoingCalls(): Promise<CallRecord[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter((call) => call.callType === 'outgoing');
    } catch (error) {
      console.error('Error getting outgoing calls:', error);
      return [];
    }
  }

  /**
   * Получить пропущенные звонки
   */
  static async getMissedCalls(): Promise<CallRecord[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter((call) => call.status === 'missed');
    } catch (error) {
      console.error('Error getting missed calls:', error);
      return [];
    }
  }

  /**
   * Получить количество пропущенных звонков
   */
  static async getMissedCallCount(): Promise<number> {
    try {
      const missedCalls = await this.getMissedCalls();
      return missedCalls.length;
    } catch (error) {
      console.error('Error getting missed call count:', error);
      return 0;
    }
  }

  /**
   * Удалить запись о звонке
   */
  static async deleteCall(callId: string): Promise<boolean> {
    try {
      // Удалить из AsyncStorage
      try {
        const history = await this.getCallHistory();
        const filtered = history.filter((call) => call.id !== callId);
        await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(filtered));
      } catch (storageError) {
        console.warn('AsyncStorage delete failed:', storageError);
      }

      // Удалить из Firebase
      try {
        const db = getFirestore();
        const callRef = doc(db, 'calls', callId);
        await deleteDoc(callRef);
        console.log('✅ Call deleted from Firebase:', callId);
      } catch (firebaseError) {
        console.warn('Firebase delete failed:', firebaseError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting call:', error);
      return false;
    }
  }

  /**
   * Очистить всю историю звонков
   */
  static async clearCallHistory(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify([]));
      console.log('✅ Call history cleared');
      return true;
    } catch (error) {
      console.error('Error clearing call history:', error);
      return false;
    }
  }

  /**
   * Получить статистику звонков
   */
  static async getCallStats(): Promise<{
    totalCalls: number;
    incomingCalls: number;
    outgoingCalls: number;
    missedCalls: number;
    totalDuration: number; // в секундах
    averageDuration: number; // в секундах
  }> {
    try {
      const history = await this.getCallHistory();

      const stats = {
        totalCalls: history.length,
        incomingCalls: history.filter((c) => c.callType === 'incoming').length,
        outgoingCalls: history.filter((c) => c.callType === 'outgoing').length,
        missedCalls: history.filter((c) => c.status === 'missed').length,
        totalDuration: history.reduce((sum, c) => sum + c.duration, 0),
        averageDuration: 0,
      };

      if (stats.totalCalls > 0) {
        stats.averageDuration = Math.round(stats.totalDuration / stats.totalCalls);
      }

      return stats;
    } catch (error) {
      console.error('Error getting call stats:', error);
      return {
        totalCalls: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        missedCalls: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }
  }

  /**
   * Форматировать время звонка
   */
  static formatCallDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Форматировать время звонка для отображения
   */
  static formatCallTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'только что';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  }
}
