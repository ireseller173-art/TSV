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
import { useFirebaseAuth as useAuth } from "@/lib/firebase-auth-provider";
import { useI18n } from "@/lib/i18n-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeContext } from "@/lib/theme-provider";
import * as ImagePicker from 'expo-image-picker';
import { avatarService } from "@/lib/avatar-service";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const colorScheme = useColorScheme();
  const { setColorScheme } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(colorScheme === 'dark');
  const [avatarUri, setAvatarUri] = useState(user?.avatar || '');

  const handleThemeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        // Note: Avatar upload to Firebase Storage would be implemented in avatar-service
        // For now, just update local state
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

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
            <TouchableOpacity onPress={handleAvatarPick}>
              <Image
                source={{ uri: avatarUri || user?.avatar }}
                className="w-24 h-24 rounded-full border-4 border-primary"
              />
              <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
                <IconSymbol name="pencil" size={14} color="white" />
              </View>
            </TouchableOpacity>
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
              <Text className="text-sm text-muted">{user?.email}</Text>
              <View className="flex-row items-center gap-1">
                <View className="w-2 h-2 rounded-full bg-green-500" />
                <Text className="text-xs text-success mt-2">{t('chat.online')}</Text>
              </View>
            </View>
          </View>

          {/* Status Section */}
          <View className="bg-surface rounded-lg p-4 gap-2">
            <Text className="text-xs font-semibold text-muted uppercase">{t('contacts.title')}</Text>
            <Text className="text-base text-foreground">{user?.status}</Text>
          </View>

          {/* Settings Section */}
          <View className="gap-3">
            <Text className="text-xs font-semibold text-muted uppercase px-2">{t('settings.title')}</Text>

            {/* Notifications */}
            <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="bell.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('settings.notifications')}</Text>
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
                <Text className="text-base text-foreground">{t('profile.theme')}</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleThemeToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Language */}
            <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="globe" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.language')}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setLanguage('en')}
                  className={`px-3 py-1 rounded ${language === 'en' ? 'bg-primary' : 'bg-border'}`}
                >
                  <Text className={language === 'en' ? 'text-white text-xs font-semibold' : 'text-foreground text-xs'}>
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLanguage('ru')}
                  className={`px-3 py-1 rounded ${language === 'ru' ? 'bg-primary' : 'bg-border'}`}
                >
                  <Text className={language === 'ru' ? 'text-white text-xs font-semibold' : 'text-foreground text-xs'}>
                    РУ
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Privacy */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="lock.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{t('profile.privacy')}</Text>
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
                <Text className="text-base text-foreground">{t('chat.call')}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </TouchableOpacity>

            {/* Help */}
            <TouchableOpacity className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <IconSymbol name="questionmark.circle.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">Help</Text>
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
            <Text className="text-white font-semibold text-base">{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
