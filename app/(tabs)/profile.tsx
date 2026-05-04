import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-provider";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // @ts-ignore
    router.replace("/(auth)/splash");
  };

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* Profile Header */}
          <View className="items-center gap-4">
            <Image
              source={{ uri: user?.avatar }}
              className="w-24 h-24 rounded-full border-4 border-primary"
            />
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
              <Text className="text-sm text-muted">{user?.email}</Text>
              <Text className="text-xs text-success mt-2">Online</Text>
            </View>
          </View>

          {/* Status Section */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-muted uppercase">Status</Text>
            <Text className="text-base text-foreground">{user?.status}</Text>
          </View>

          {/* Settings Section */}
          <View className="gap-3">
            <Text className="text-xs font-semibold text-muted uppercase px-2">Settings</Text>

            {/* Notifications */}
            <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="bell.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Dark Mode */}
            <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="moon.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Privacy */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="lock.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Privacy & Security</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Help */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Help & Support</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">About</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-error rounded-lg py-3 items-center justify-center mt-4"
          >
            <Text className="text-white font-semibold text-base">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
