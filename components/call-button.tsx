import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCall } from "@/lib/call-provider";
import { useAuth } from "@/lib/auth-provider";
import Haptics from "expo-haptics";
import { Platform } from "react-native";

interface CallButtonProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
}

export function CallButton({ recipientId, recipientName, recipientAvatar }: CallButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { currentCall, initiateCall } = useCall();

  const handleStartCall = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentCall) {
      // Already in a call
      return;
    }

    // Initiate call
    initiateCall(recipientId, recipientName, recipientAvatar);

    // Navigate to active call screen
    // @ts-ignore
    router.push("/active-call");
  };

  return (
    <TouchableOpacity
      onPress={handleStartCall}
      disabled={!!currentCall}
      style={{ opacity: currentCall ? 0.5 : 1 }}
      className="bg-success rounded-full w-12 h-12 items-center justify-center"
    >
      <IconSymbol name="phone.fill" size={20} color="white" />
    </TouchableOpacity>
  );
}
