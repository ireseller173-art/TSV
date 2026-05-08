import AsyncStorage from "@react-native-async-storage/async-storage";

export type CallStatus = "idle" | "ringing" | "connecting" | "active" | "ended" | "missed";
export type CallType = "incoming" | "outgoing";

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  type: CallType;
  status: CallStatus;
  startTime?: number;
  endTime?: number;
  duration?: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
}

export interface CallHistory {
  id: string;
  callerId: string;
  callerName: string;
  recipientId: string;
  recipientName: string;
  startTime: number;
  duration: number;
  type: "incoming" | "outgoing" | "missed";
}

const CALL_HISTORY_KEY = "call_history";

export const callService = {
  // Create a new call session
  createCallSession(
    callerId: string,
    callerName: string,
    callerAvatar: string,
    recipientId: string,
    recipientName: string,
    recipientAvatar: string,
    type: CallType
  ): CallSession {
    return {
      id: `call_${Date.now()}`,
      callerId,
      callerName,
      callerAvatar,
      recipientId,
      recipientName,
      recipientAvatar,
      type,
      status: type === "incoming" ? "ringing" : "connecting",
      isMuted: false,
      isSpeakerOn: false,
    };
  },

  // Update call session
  updateCallSession(session: CallSession, updates: Partial<CallSession>): CallSession {
    return { ...session, ...updates };
  },

  // Save call to history
  async saveCallToHistory(
    callerId: string,
    callerName: string,
    recipientId: string,
    recipientName: string,
    startTime: number,
    duration: number,
    type: "incoming" | "outgoing" | "missed"
  ): Promise<void> {
    try {
      const history = await this.getCallHistory();
      const callRecord: CallHistory = {
        id: `history_${Date.now()}`,
        callerId,
        callerName,
        recipientId,
        recipientName,
        startTime,
        duration,
        type,
      };
      history.push(callRecord);
      // Keep only last 100 calls
      const recentHistory = history.slice(-100);
      await AsyncStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(recentHistory));
    } catch (error) {
    }
  },

  // Get call history
  async getCallHistory(): Promise<CallHistory[]> {
    try {
      const data = await AsyncStorage.getItem(CALL_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  },

  // Get missed calls
  async getMissedCalls(): Promise<CallHistory[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter((call) => call.type === "missed");
    } catch (error) {
      return [];
    }
  },

  // Clear call history
  async clearCallHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CALL_HISTORY_KEY);
    } catch (error) {
    }
  },

  // Get calls with specific user
  async getCallsWithUser(userId: string): Promise<CallHistory[]> {
    try {
      const history = await this.getCallHistory();
      return history.filter(
        (call) => call.callerId === userId || call.recipientId === userId
      );
    } catch (error) {
      return [];
    }
  },
};
