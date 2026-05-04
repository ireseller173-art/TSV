import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-provider";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function SplashScreen() {
  // @ts-ignore - Expo Router types
  const router = useRouter();
  const { isSignedIn, isLoading } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on auth state
      if (isSignedIn) {
        router.replace("/(tabs)");
      } else {
        // @ts-ignore
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, isSignedIn, router]);

  return (
    <ScreenContainer className="flex-1 items-center justify-center gap-4" edges={["top", "bottom", "left", "right"]}>
      <View className="items-center gap-4">
        <Text className="text-5xl font-bold text-primary">💬</Text>
        <Text className="text-2xl font-bold text-foreground">Cool Messenger</Text>
        <Text className="text-sm text-muted">Modern messaging for everyone</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
    </ScreenContainer>
  );
}
