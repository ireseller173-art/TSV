import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { SoundPicker } from '@/components/sound-picker';
import { soundService, type SoundPreference } from '@/lib/sound-service';
import { useColors } from '@/hooks/use-colors';

/**
 * Sound Settings Screen
 * Allows users to customize notification sounds and preferences
 */
export default function SoundSettingsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [preferences, setPreferences] = useState<SoundPreference>(
    soundService.getDefaultPreferences('user-id')
  );
  const [activePicker, setActivePicker] = useState<
    'message' | 'call' | 'ringtone' | 'outgoing' | null
  >(null);

  const handleSoundSelect = (soundId: string) => {
    if (activePicker === 'message') {
      setPreferences(
        soundService.updateSoundPreference(preferences, {
          messageSound: soundId,
        })
      );
    } else if (activePicker === 'call') {
      setPreferences(
        soundService.updateSoundPreference(preferences, {
          callRingtone: soundId,
        })
      );
    } else if (activePicker === 'ringtone') {
      setPreferences(
        soundService.updateSoundPreference(preferences, {
          incomingCallSound: soundId,
        })
      );
    } else if (activePicker === 'outgoing') {
      setPreferences(
        soundService.updateSoundPreference(preferences, {
          outgoingMessageSound: soundId,
        })
      );
    }
    setActivePicker(null);
  };

  const handleVolumeChange = (volume: number) => {
    setPreferences(soundService.setVolume(preferences, volume));
  };

  const handleMuteToggle = () => {
    setPreferences(soundService.toggleMute(preferences));
  };

  const handleVibrationToggle = () => {
    setPreferences(soundService.toggleVibration(preferences));
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Pressable onPress={() => router.back()} className="active:opacity-70">
          <Text className="text-primary text-lg">← Назад</Text>
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Звуки и вибрация</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="gap-6">
          {/* Notifications Mute */}
          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Отключить все звуки</Text>
                <Text className="text-muted text-sm mt-1">
                  Отключить все уведомления
                </Text>
              </View>
              <Switch
                value={preferences.muteNotifications}
                onValueChange={handleMuteToggle}
                trackColor={{ false: '#ccc', true: colors.primary }}
              />
            </View>
          </View>

          {/* Vibration */}
          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-foreground font-semibold">Вибрация</Text>
                <Text className="text-muted text-sm mt-1">
                  Вибрировать при уведомлениях
                </Text>
              </View>
              <Switch
                value={preferences.vibration}
                onValueChange={handleVibrationToggle}
                trackColor={{ false: '#ccc', true: colors.primary }}
              />
            </View>
          </View>

          {/* Volume Control */}
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-foreground font-semibold mb-3">
              Громкость: {soundService.getVolumeLabel(preferences.volume)}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-muted">🔇</Text>
              <View className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${preferences.volume * 100}%` }}
                />
              </View>
              <Text className="text-muted">🔊</Text>
            </View>
            <Text className="text-muted text-xs mt-2">
              Текущая громкость: {Math.round(preferences.volume * 100)}%
            </Text>
          </View>

          {/* Sound Settings */}
          <Text className="text-foreground font-bold text-lg mt-4">Звуки уведомлений</Text>

          {/* Message Sound */}
          <SoundSettingItem
            label="Звук сообщения"
            currentSound={soundService.getSoundName(preferences.messageSound)}
            onPress={() => setActivePicker('message')}
          />

          {/* Call Sound */}
          <SoundSettingItem
            label="Звук звонка"
            currentSound={soundService.getSoundName(preferences.callRingtone)}
            onPress={() => setActivePicker('call')}
          />

          {/* Incoming Call Ringtone */}
          <SoundSettingItem
            label="Рингтон входящего звонка"
            currentSound={soundService.getSoundName(preferences.incomingCallSound)}
            onPress={() => setActivePicker('ringtone')}
          />

          {/* Outgoing Message Sound */}
          <SoundSettingItem
            label="Звук исходящего сообщения"
            currentSound={soundService.getSoundName(preferences.outgoingMessageSound)}
            onPress={() => setActivePicker('outgoing')}
          />

          {/* Reset Button */}
          <Pressable
            onPress={() => {
              setPreferences(soundService.resetToDefaults(preferences.userId));
            }}
            className="bg-warning/10 rounded-lg p-4 active:opacity-70 mt-4"
          >
            <Text className="text-warning text-center font-semibold">
              Восстановить значения по умолчанию
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Sound Picker Modals */}
      <SoundPicker
        category="message"
        selectedSoundId={preferences.messageSound}
        onSoundSelected={handleSoundSelect}
        visible={activePicker === 'message'}
        onClose={() => setActivePicker(null)}
      />

      <SoundPicker
        category="call"
        selectedSoundId={preferences.callRingtone}
        onSoundSelected={handleSoundSelect}
        visible={activePicker === 'call'}
        onClose={() => setActivePicker(null)}
      />

      <SoundPicker
        category="ringtone"
        selectedSoundId={preferences.incomingCallSound}
        onSoundSelected={handleSoundSelect}
        visible={activePicker === 'ringtone'}
        onClose={() => setActivePicker(null)}
      />

      <SoundPicker
        category="outgoing"
        selectedSoundId={preferences.outgoingMessageSound}
        onSoundSelected={handleSoundSelect}
        visible={activePicker === 'outgoing'}
        onClose={() => setActivePicker(null)}
      />
    </ScreenContainer>
  );
}

interface SoundSettingItemProps {
  label: string;
  currentSound: string;
  onPress: () => void;
}

/**
 * Sound Setting Item Component
 */
function SoundSettingItem({ label, currentSound, onPress }: SoundSettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-lg p-4 active:opacity-70 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-foreground font-semibold">{label}</Text>
        <Text className="text-muted text-sm mt-1">{currentSound}</Text>
      </View>
      <Text className="text-primary text-lg">›</Text>
    </Pressable>
  );
}
