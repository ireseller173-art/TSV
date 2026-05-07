import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import {
  NotificationPreferencesService,
  NotificationPreferences,
  NotificationPreference,
} from '@/lib/notification-preferences-service';
import { cn } from '@/lib/utils';

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const prefs = await NotificationPreferencesService.getPreferences(String(user.id));
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert(String(t('common.error')), String(t('notifications.loadError') || 'Failed to load preferences'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>,
    field: keyof NotificationPreference
  ) => {
    try {
      if (user?.id) {
        const updated = await NotificationPreferencesService.toggleNotification(
          String(user.id),
          category,
          field
        );
        setPreferences(updated);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert(String(t('common.error')), String(t('notifications.updateError') || 'Failed to update'));
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      String(t('common.confirm') || 'Confirm'),
      String(t('notifications.resetConfirm') || 'Reset to default preferences?'),
      [
        {
          text: String(t('common.cancel') || 'Cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: String(t('common.reset') || 'Reset'),
          onPress: async () => {
            try {
              if (user?.id) {
                const defaults = await NotificationPreferencesService.resetToDefaults(String(user.id));
                setPreferences(defaults);
                Alert.alert(
                  String(t('common.success')),
                  String(t('notifications.resetSuccess') || 'Reset to defaults')
                );
              }
            } catch (error) {
              Alert.alert(String(t('common.error')), String(t('notifications.resetError') || 'Failed to reset'));
            }
          },
        },
      ]
    );
  };

  const renderCategorySection = (
    category: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>,
    title: string,
    description: string
  ) => {
    if (!preferences) return null;

    const prefs = preferences[category];

    return (
      <View key={category} className="mb-6 bg-surface rounded-lg p-4">
        <Text className="text-lg font-bold text-foreground mb-1">{title}</Text>
        <Text className="text-sm text-muted mb-4">{description}</Text>

        <View className="gap-3">
          <View className="flex-row justify-between items-center py-2 border-b border-border">
            <Text className="text-foreground font-medium">
              {t('notifications.enabled') || 'Enabled'}
            </Text>
            <Switch
              value={prefs.enabled}
              onValueChange={() => handleToggle(category, 'enabled')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={prefs.enabled ? colors.primary : colors.muted}
            />
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-border">
            <Text className="text-foreground font-medium">
              {t('notifications.sound') || 'Sound'}
            </Text>
            <Switch
              value={prefs.sound}
              onValueChange={() => handleToggle(category, 'sound')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={prefs.sound ? colors.primary : colors.muted}
              disabled={!prefs.enabled}
            />
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-border">
            <Text className="text-foreground font-medium">
              {t('notifications.vibration') || 'Vibration'}
            </Text>
            <Switch
              value={prefs.vibration}
              onValueChange={() => handleToggle(category, 'vibration')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={prefs.vibration ? colors.primary : colors.muted}
              disabled={!prefs.enabled}
            />
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-foreground font-medium">
              {t('notifications.preview') || 'Show Preview'}
            </Text>
            <Switch
              value={prefs.preview}
              onValueChange={() => handleToggle(category, 'preview')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={prefs.preview ? colors.primary : colors.muted}
              disabled={!prefs.enabled}
            />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">{t('common.loading') || 'Loading...'}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-4 p-4">
        <View>
          <Text className="text-2xl font-bold text-foreground mb-2">
            {t('notifications.title') || 'Notifications'}
          </Text>
          <Text className="text-sm text-muted">
            {t('notifications.description') ||
              'Manage your notification preferences by category'}
          </Text>
        </View>

        {renderCategorySection(
          'messages',
          t('notifications.messages') || 'Messages',
          t('notifications.messagesDesc') || 'Direct message notifications'
        )}

        {renderCategorySection(
          'calls',
          t('notifications.calls') || 'Calls',
          t('notifications.callsDesc') || 'Incoming call notifications'
        )}

        {renderCategorySection(
          'groups',
          t('notifications.groups') || 'Groups',
          t('notifications.groupsDesc') || 'Group message notifications'
        )}

        {renderCategorySection(
          'mentions',
          t('notifications.mentions') || 'Mentions',
          t('notifications.mentionsDesc') || 'When someone mentions you'
        )}

        {renderCategorySection(
          'reactions',
          t('notifications.reactions') || 'Reactions',
          t('notifications.reactionsDesc') || 'Message reaction notifications'
        )}

        {/* Reset button */}
        <Pressable
          onPress={handleResetDefaults}
          className="mt-6 py-3 px-4 rounded-lg bg-surface border border-border items-center"
        >
          <Text className="text-foreground font-semibold">
            {t('notifications.resetDefaults') || 'Reset to Defaults'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
