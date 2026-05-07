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
import { useI18n } from "@/hooks/use-i18n";
import { LanguagePicker } from "@/components/language-picker";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // @ts-ignore
    router.replace("/(auth)/splash");
  };

  const handleEditProfile = () => {
    // @ts-ignore
    router.push("/profile-edit");
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
              <Text className="text-xs text-success mt-2">{t('profile.online')}</Text>
            </View>
            <TouchableOpacity
              onPress={handleEditProfile}
              className="mt-2 px-6 py-2 bg-primary rounded-full"
            >
              <Text className="text-white font-semibold text-sm">{t('profile.edit')}</Text>
            </TouchableOpacity>
          </View>

          {/* Status Section */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-muted uppercase">{t('profile.statusLabel')}</Text>
            <Text className="text-base text-foreground">{user?.status || t('profile.online')}</Text>
          </View>

          {/* Settings Section */}
          <View className="gap-3">
            <Text className="text-xs font-semibold text-muted uppercase px-2">{t('profile.settingsLabel')}</Text>

            {/* Notifications */}
            <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="bell.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.notificationsLabel')}</Text>
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
                <Text className="text-base text-foreground">{t('profile.darkMode')}</Text>
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
                <Text className="text-base text-foreground">{t('profile.privacySecurity')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Call History */}
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore
                router.push("/call-history");
              }}
              className="bg-surface rounded-lg p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="phone.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.callHistoryLabel')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Language Picker */}
            <View className="bg-surface rounded-lg p-4">
              <LanguagePicker />
            </View>

            {/* Help */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.helpSupport')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* About */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="info.circle.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.aboutLabel')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-error rounded-lg py-3 items-center justify-center mt-4"
          >
            <Text className="text-white font-semibold text-base">{t('profile.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
