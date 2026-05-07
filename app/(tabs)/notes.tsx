import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { TactileButton } from '@/components/tactile-button';
import { useTactileFeedback } from '@/hooks/use-tactile-feedback';
import { useColors } from '@/hooks/use-colors';
import { NotesService, type Note } from '@/lib/notes-service';
import { useI18n } from '@/lib/i18n-provider';
import { cn } from '@/lib/utils';
import { useFocusEffect } from '@react-navigation/native';
import { PressableButton } from '@/components/pressable-button';
import { PressableCard } from '@/components/pressable-card';

export default function NotesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [searchQuery, setSearchQuery] = useState('');

  const { scaleValue: searchScale, onPressIn: searchPressIn, onPressOut: searchPressOut } = useTactileFeedback();
  const { scaleValue: addScale, onPressIn: addPressIn, onPressOut: addPressOut } = useTactileFeedback();

  // Load notes when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    const loadedNotes = await NotesService.getAllNotes();
    setNotes(loadedNotes);
  };

  const handleSaveNote = async () => {
    if (!title.trim() || !content.trim()) {
      alert(t('notes.error_empty'));
      return;
    }

    try {
      if (editingNote) {
        await NotesService.updateNote(editingNote.id, {
          title,
          content,
          date,
          time,
        });
      } else {
        await NotesService.createNote(title, content, date, time);
      }

      setShowModal(false);
      setTitle('');
      setContent('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      alert(t('notes.error_save'));
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await NotesService.deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setDate(note.date);
    setTime(note.time);
    setShowModal(true);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNotes();
      return;
    }

    const results = await NotesService.searchNotes(searchQuery);
    setNotes(results);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNoteItem = ({ item }: { item: Note }) => {
    return (
      <PressableCard
        onPress={() => handleEditNote(item)}
        showGlow={true}
        style={{ marginBottom: 12 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              {item.date} {item.time}
            </Text>
          </View>
          <Pressable
            onPress={() => handleDeleteNote(item.id)}
            style={({ pressed }) => [{
              marginLeft: 8,
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            }]}
          >
            <Text style={{ color: colors.error, fontSize: 18 }}>✕</Text>
          </Pressable>
        </View>
        <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }} numberOfLines={2}>
          {item.content}
        </Text>
      </PressableCard>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row gap-2 mb-4">
        <Animated.View style={{ transform: [{ scale: searchScale }] }} className="flex-1">
          <TextInput
            placeholder={t('notes.search')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onPressIn={searchPressIn}
            onPressOut={searchPressOut}
            className="bg-surface border border-border rounded-lg px-4 py-2 text-foreground"
            placeholderTextColor={colors.muted}
          />
        </Animated.View>
        <PressableButton
          label="+"
          variant="primary"
          size="medium"
          onPress={() => {
            setEditingNote(null);
            setTitle('');
            setContent('');
            setDate(new Date().toISOString().split('T')[0]);
            setTime(new Date().toTimeString().slice(0, 5));
            setShowModal(true);
          }}
          showGlow={true}
        />
      </View>

      {filteredNotes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted text-lg">{t('notes.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <ScreenContainer className="p-4 justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground mb-4">
              {editingNote ? t('notes.edit') : t('notes.new')}
            </Text>

            <TextInput
              placeholder={t('notes.label_title')}
              value={title}
              onChangeText={setTitle}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
              placeholderTextColor={colors.muted}
            />

            <TextInput
              placeholder={t('notes.label_content')}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
              placeholderTextColor={colors.muted}
              textAlignVertical="top"
            />

            <View className="flex-row gap-2 mb-3">
              <TextInput
                placeholder={t('notes.label_date')}
                value={date}
                onChangeText={setDate}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-foreground"
                placeholderTextColor={colors.muted}
              />
              <TextInput
                placeholder={t('notes.label_time')}
                value={time}
                onChangeText={setTime}
                className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View style={{ flex: 1 }}>
              <PressableButton
                label={t('common.cancel')}
                variant="secondary"
                size="medium"
                onPress={() => setShowModal(false)}
                showGlow={true}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PressableButton
                label={t('common.save')}
                variant="primary"
                size="medium"
                onPress={handleSaveNote}
                showGlow={true}
              />
            </View>
          </View>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
