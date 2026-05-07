import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { soundService, type Sound } from '@/lib/sound-service';
import { cn } from '@/lib/utils';

interface SoundPickerProps {
  category: 'message' | 'call' | 'ringtone' | 'outgoing';
  selectedSoundId: string;
  onSoundSelected: (soundId: string) => void;
  visible: boolean;
  onClose: () => void;
}

/**
 * Sound Picker Component
 * Allows users to select notification sounds
 */
export function SoundPicker({
  category,
  selectedSoundId,
  onSoundSelected,
  visible,
  onClose,
}: SoundPickerProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const sounds = soundService.getSoundsByCategory(category);
  const categoryLabel = soundService.getCategoryLabel(category);

  const handleSoundSelect = (soundId: string) => {
    onSoundSelected(soundId);
    setPlayingId(null);
    onClose();
  };

  const handlePlaySound = (soundId: string) => {
    setPlayingId(playingId === soundId ? null : soundId);
    // In production, play actual sound here
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-background rounded-t-3xl mt-20">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Text className="text-lg font-bold text-foreground">{categoryLabel}</Text>
            <Pressable
              onPress={onClose}
              className="active:opacity-70 p-2"
            >
              <Text className="text-xl text-primary">✕</Text>
            </Pressable>
          </View>

          {/* Sound List */}
          <ScrollView className="flex-1 p-4">
            <View className="gap-3">
              {sounds.map((sound) => (
                <SoundItem
                  key={sound.id}
                  sound={sound}
                  isSelected={selectedSoundId === sound.id}
                  isPlaying={playingId === sound.id}
                  onSelect={() => handleSoundSelect(sound.id)}
                  onPlay={() => handlePlaySound(sound.id)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-border">
            <Pressable
              onPress={onClose}
              className="bg-primary rounded-lg py-3 active:opacity-80"
            >
              <Text className="text-center text-white font-semibold">Закрыть</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SoundItemProps {
  sound: Sound;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlay: () => void;
}

/**
 * Sound Item Component
 */
function SoundItem({
  sound,
  isSelected,
  isPlaying,
  onSelect,
  onPlay,
}: SoundItemProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-3 p-4 rounded-lg border',
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'bg-surface border-border'
      )}
    >
      {/* Selection Indicator */}
      <Pressable
        onPress={onSelect}
        className={cn(
          'w-6 h-6 rounded-full border-2 items-center justify-center',
          isSelected
            ? 'bg-primary border-primary'
            : 'border-muted'
        )}
      >
        {isSelected && <Text className="text-white text-sm">✓</Text>}
      </Pressable>

      {/* Sound Info */}
      <View className="flex-1">
        <Text className="text-foreground font-semibold">{sound.name}</Text>
        <Text className="text-muted text-sm">
          {soundService.formatDuration(sound.duration)}
        </Text>
      </View>

      {/* Play Button */}
      <Pressable
        onPress={onPlay}
        className={cn(
          'w-10 h-10 rounded-full items-center justify-center',
          isPlaying ? 'bg-primary' : 'bg-surface border border-border'
        )}
      >
        <Text className={isPlaying ? 'text-white' : 'text-foreground'}>
          {isPlaying ? '⏸' : '▶'}
        </Text>
      </Pressable>
    </View>
  );
}
