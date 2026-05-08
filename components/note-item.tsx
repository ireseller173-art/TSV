import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { useTactileFeedback } from '@/hooks/use-tactile-feedback';
import { type Note } from '@/lib/notes-service';

interface NoteItemProps {
  item: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteItem({ item, onEdit, onDelete }: NoteItemProps) {
  const { scaleValue, onPressIn, onPressOut } = useTactileFeedback();

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => onEdit(item)}
        className="bg-surface rounded-lg p-4 mb-3 border border-border"
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
            <Text className="text-sm text-muted mt-1">
              {item.date} {item.time}
            </Text>
          </View>
          <Pressable
            onPress={() => onDelete(item.id)}
            className="ml-2 p-2"
          >
            <Text className="text-error text-lg">✕</Text>
          </Pressable>
        </View>
        <Text className="text-sm text-foreground line-clamp-2">{item.content}</Text>
      </Pressable>
    </Animated.View>
  );
}
