import { useState } from "react";
import {
  View,
  Text,
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
import { PressableButton } from "@/components/pressable-button";
import { PressableListItem } from "@/components/pressable-list-item";

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
            <PressableButton
              onPress={handleEditProfile}
              label={t('profile.edit')}
              variant="primary"
              size="medium"
              showGlow={true}
            />
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
            <PressableListItem
              title={t('profile.privacySecurity')}
              leftIcon={<IconSymbol name="lock.fill" size={20} color={colors.primary} />}
              rightIcon={<IconSymbol name="chevron.right" size={20} color={colors.muted} />}
              showGlow={true}
            />

            {/* Call History */}
            <PressableListItem
              onPress={() => {
                // @ts-ignore
                router.push("/call-history");
              }}
              title={t('profile.callHistoryLabel')}
              leftIcon={<IconSymbol name="phone.fill" size={20} color={colors.primary} />}
              rightIcon={<IconSymbol name="chevron.right" size={20} color={colors.muted} />}
              showGlow={true}
            />

            {/* Language Picker */}
            <View className="bg-surface rounded-lg p-4">
              <LanguagePicker />
            </View>

            {/* Help */}
            <PressableListItem
              title={t('profile.helpSupport')}
              leftIcon={<IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />}
              rightIcon={<IconSymbol name="chevron.right" size={20} color={colors.muted} />}
              showGlow={true}
            />

            {/* About */}
            <PressableListItem
              title={t('profile.aboutLabel')}
              leftIcon={<IconSymbol name="info.circle.fill" size={20} color={colors.primary} />}
              rightIcon={<IconSymbol name="chevron.right" size={20} color={colors.muted} />}
              showGlow={true}
            />
          </View>

          {/* Sign Out Button */}
          <PressableButton
            onPress={handleSignOut}
            label={t('profile.signOut')}
            variant="danger"
            size="large"
            showGlow={true}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
