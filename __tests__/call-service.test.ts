import { describe, it, expect, beforeEach, vi } from "vitest";
import { callService, CallSession, CallHistory } from "@/lib/call-service";
import AsyncStorage from "@react-native-async-storage/async-storage";

vi.mock("@react-native-async-storage/async-storage");

describe("callService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCallSession", () => {
    it("should create a new call session with correct properties", () => {
      const session = callService.createCallSession(
        "caller1",
        "John Doe",
        "avatar1.jpg",
        "recipient1",
        "Jane Smith",
        "avatar2.jpg",
        "outgoing"
      );

      expect(session.callerId).toBe("caller1");
      expect(session.callerName).toBe("John Doe");
      expect(session.recipientId).toBe("recipient1");
      expect(session.recipientName).toBe("Jane Smith");
      expect(session.type).toBe("outgoing");
      expect(session.status).toBe("connecting");
      expect(session.isMuted).toBe(false);
      expect(session.isSpeakerOn).toBe(false);
    });

    it("should set status to 'ringing' for incoming calls", () => {
      const session = callService.createCallSession(
        "caller1",
        "John Doe",
        "avatar1.jpg",
        "recipient1",
        "Jane Smith",
        "avatar2.jpg",
        "incoming"
      );

      expect(session.status).toBe("ringing");
    });
  });

  describe("updateCallSession", () => {
    it("should update call session properties", () => {
      const session = callService.createCallSession(
        "caller1",
        "John Doe",
        "avatar1.jpg",
        "recipient1",
        "Jane Smith",
        "avatar2.jpg",
        "outgoing"
      );

      const updated = callService.updateCallSession(session, {
        status: "active",
        isMuted: true,
      });

      expect(updated.status).toBe("active");
      expect(updated.isMuted).toBe(true);
      expect(updated.callerId).toBe("caller1");
    });
  });

  describe("saveCallToHistory", () => {
    it("should save call to history", async () => {
      const mockSetItem = vi.fn();
      (AsyncStorage.setItem as any).mockImplementation(mockSetItem);
      (AsyncStorage.getItem as any).mockResolvedValue(null);

      await callService.saveCallToHistory(
        "caller1",
        "John Doe",
        "recipient1",
        "Jane Smith",
        Date.now(),
        300,
        "outgoing"
      );

      expect(mockSetItem).toHaveBeenCalled();
      const [key, value] = mockSetItem.mock.calls[0];
      expect(key).toBe("call_history");
      const history = JSON.parse(value);
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe("outgoing");
      expect(history[0].duration).toBe(300);
    });
  });

  describe("getCallHistory", () => {
    it("should return empty array when no history exists", async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);

      const history = await callService.getCallHistory();

      expect(history).toEqual([]);
    });

    it("should return call history from storage", async () => {
      const mockHistory: CallHistory[] = [
        {
          id: "history_1",
          callerId: "caller1",
          callerName: "John Doe",
          recipientId: "recipient1",
          recipientName: "Jane Smith",
          startTime: Date.now(),
          duration: 300,
          type: "outgoing",
        },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockHistory));

      const history = await callService.getCallHistory();

      expect(history).toEqual(mockHistory);
    });
  });

  describe("getMissedCalls", () => {
    it("should return only missed calls", async () => {
      const mockHistory: CallHistory[] = [
        {
          id: "history_1",
          callerId: "caller1",
          callerName: "John Doe",
          recipientId: "recipient1",
          recipientName: "Jane Smith",
          startTime: Date.now(),
          duration: 0,
          type: "missed",
        },
        {
          id: "history_2",
          callerId: "caller1",
          callerName: "John Doe",
          recipientId: "recipient1",
          recipientName: "Jane Smith",
          startTime: Date.now(),
          duration: 300,
          type: "outgoing",
        },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockHistory));

      const missedCalls = await callService.getMissedCalls();

      expect(missedCalls).toHaveLength(1);
      expect(missedCalls[0].type).toBe("missed");
    });
  });

  describe("getCallsWithUser", () => {
    it("should return calls with specific user", async () => {
      const mockHistory: CallHistory[] = [
        {
          id: "history_1",
          callerId: "caller1",
          callerName: "John Doe",
          recipientId: "recipient1",
          recipientName: "Jane Smith",
          startTime: Date.now(),
          duration: 300,
          type: "outgoing",
        },
        {
          id: "history_2",
          callerId: "caller2",
          callerName: "Bob",
          recipientId: "recipient2",
          recipientName: "Alice",
          startTime: Date.now(),
          duration: 200,
          type: "incoming",
        },
      ];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockHistory));

      const calls = await callService.getCallsWithUser("caller1");

      expect(calls).toHaveLength(1);
      expect(calls[0].callerId).toBe("caller1");
    });
  });

  describe("clearCallHistory", () => {
    it("should clear call history", async () => {
      const mockRemoveItem = vi.fn();
      (AsyncStorage.removeItem as any).mockImplementation(mockRemoveItem);

      await callService.clearCallHistory();

      expect(mockRemoveItem).toHaveBeenCalledWith("call_history");
    });
  });
});
