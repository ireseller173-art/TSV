import React, { createContext, useContext, useState, useCallback } from "react";
import { CallSession, CallStatus, callService } from "@/lib/call-service";

interface CallContextType {
  currentCall: CallSession | null;
  isCallActive: boolean;
  initiateCall: (
    recipientId: string,
    recipientName: string,
    recipientAvatar: string
  ) => void;
  receiveCall: (
    callerId: string,
    callerName: string,
    callerAvatar: string
  ) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  updateCallStatus: (status: CallStatus) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);

  const initiateCall = useCallback(
    (recipientId: string, recipientName: string, recipientAvatar: string) => {
      // This would be called by the user initiating a call
      // In a real app, this would send a signal to the recipient
      console.log(`Initiating call to ${recipientName}`);
      // For now, we'll just set up the local call session
      // The actual WebRTC connection would be established here
    },
    []
  );

  const receiveCall = useCallback(
    (callerId: string, callerName: string, callerAvatar: string) => {
      // This would be called when receiving a call signal
      const newCall = callService.createCallSession(
        callerId,
        callerName,
        callerAvatar,
        "recipient_id", // This would come from current user
        "Recipient Name",
        "recipient_avatar",
        "incoming"
      );
      setCurrentCall(newCall);
    },
    []
  );

  const acceptCall = useCallback(() => {
    if (currentCall) {
      const updatedCall = callService.updateCallSession(currentCall, {
        status: "connecting",
      });
      setCurrentCall(updatedCall);
      // Establish WebRTC connection here
    }
  }, [currentCall]);

  const rejectCall = useCallback(() => {
    setCurrentCall(null);
  }, []);

  const endCall = useCallback(async () => {
    if (currentCall) {
      const duration = currentCall.startTime
        ? Math.floor((Date.now() - currentCall.startTime) / 1000)
        : 0;

      // Save to history
      await callService.saveCallToHistory(
        currentCall.callerId,
        currentCall.callerName,
        currentCall.recipientId,
        currentCall.recipientName,
        currentCall.startTime || Date.now(),
        duration,
        currentCall.type === "incoming" ? "incoming" : "outgoing"
      );

      setCurrentCall(null);
    }
  }, [currentCall]);

  const toggleMute = useCallback(() => {
    if (currentCall) {
      const updatedCall = callService.updateCallSession(currentCall, {
        isMuted: !currentCall.isMuted,
      });
      setCurrentCall(updatedCall);
    }
  }, [currentCall]);

  const toggleSpeaker = useCallback(() => {
    if (currentCall) {
      const updatedCall = callService.updateCallSession(currentCall, {
        isSpeakerOn: !currentCall.isSpeakerOn,
      });
      setCurrentCall(updatedCall);
    }
  }, [currentCall]);

  const updateCallStatus = useCallback((status: CallStatus) => {
    setCurrentCall((prev) => {
      if (!prev) return null;
      const updated = callService.updateCallSession(prev, { status });
      if (status === "active" && !updated.startTime) {
        updated.startTime = Date.now();
      }
      return updated;
    });
  }, []);

  const value: CallContextType = {
    currentCall,
    isCallActive: currentCall?.status === "active",
    initiateCall,
    receiveCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    updateCallStatus,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}
