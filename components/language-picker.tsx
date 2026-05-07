/**
 * Language Picker Component
 * Allows users to select between English and Russian languages
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { MaterialIcons } from '@expo/vector-icons';
import Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-provider';
import { UserProfileService } from '@/lib/user-profile-service';

interface LanguagePickerProps {
  onLanguageChange?: (language: 'en' | 'ru') => void;
}

export function LanguagePicker({ onLanguageChange }: LanguagePickerProps) {
  const { language, setLanguage, t } = useI18n();
  const colors = useColors();

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  ];

  const { user } = useAuth();

  const handleLanguageChange = async (newLanguage: 'en' | 'ru') => {
    if (newLanguage === language) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Update language in AsyncStorage and context
      await setLanguage(newLanguage);

      // Save language to user profile
      if (user?.id) {
        await UserProfileService.saveProfile({
          id: user.id,
          language: newLanguage,
        });
      }

      onLanguageChange?.(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground px-4">
        {t('profile.language')}
      </Text>

      <View className="flex-row gap-2 px-4">
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            className="flex-1"
            style={{
              backgroundColor:
                language === lang.code ? colors.primary : colors.surface,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: language === lang.code ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            <View className="items-center gap-2">
              <Text className="text-2xl">{lang.flag}</Text>
              <Text
                className="font-semibold text-sm"
                style={{
                  color:
                    language === lang.code
                      ? '#FFFFFF'
                      : colors.foreground,
                }}
              >
                {lang.name}
              </Text>
              {language === lang.code && (
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color="#FFFFFF"
                  style={{ marginTop: 4 }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
