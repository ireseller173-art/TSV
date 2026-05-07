/**
 * Groups Screen - Список групповых чатов
 * Показывает все групповые чаты пользователя
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import * as GroupChatService from '@/lib/group-chat-service';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';

interface GroupChatItem {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount: number;
  isArchived?: boolean;
}

export default function GroupsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const [groups, setGroups] = useState<GroupChatItem[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupChatItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Загрузить групповые чаты
  useEffect(() => {
    loadGroups();
  }, []);

  // Фильтровать группы при изменении поиска
  useEffect(() => {
    filterGroups();
  }, [searchText, groups, showArchived]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      // Получаем группы из сервиса
      const allGroups = await GroupChatService.getAllGroupChats();
      const items: GroupChatItem[] = allGroups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        avatar: g.avatar,
        memberCount: g.members.length,
        unreadCount: 0,
        isArchived: false,
      }));
      setGroups(items);
    } catch (error) {
      console.error('Ошибка при загрузке групп:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    // Фильтруем по архивированию
    if (!showArchived) {
      filtered = filtered.filter((g) => !g.isArchived);
    }

    // Фильтруем по поиску
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query)
      );
    }

    setFilteredGroups(filtered);
  };

  const handleGroupPress = (groupId: string) => {
    // Переходим на экран деталей чата с параметром группы
    router.push(`/chat-detail?groupId=${groupId}`);
  };

  const handleCreateGroup = () => {
    // Показываем модальное окно создания группы
    // Можно реализовать как отдельный экран или модальное окно
    console.log('Создание новой группы');
  };

  const handleArchiveGroup = async (groupId: string) => {
    try {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        // Архивирование группы (update name for now)
        await GroupChatService.updateGroupChat(groupId, 'admin', {
          name: group.name,
        });
        await loadGroups();
      }
    } catch (error) {
      console.error('Ошибка при архивировании группы:', error);
    }
  };

  const renderGroupItem = ({ item }: { item: GroupChatItem }) => (
    <Pressable
      onPress={() => handleGroupPress(item.id)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        className={cn(
          'flex-row items-center px-4 py-3 border-b',
          item.isArchived && 'opacity-60'
        )}
        style={{ borderBottomColor: colors.border }}
      >
        {/* Аватар группы */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.surface }}
        >
          {item.avatar ? (
            <Text className="text-lg font-bold text-primary">
              {item.avatar}
            </Text>
          ) : (
            <MaterialIcons name="group" size={24} color={colors.primary} />
          )}
        </View>

        {/* Информация о группе */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-semibold text-foreground flex-1"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.unreadCount > 0 && (
              <View
                className="bg-primary rounded-full px-2 py-1 ml-2"
                style={{ minWidth: 24 }}
              >
                <Text className="text-white text-xs font-bold text-center">
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Последнее сообщение */}
          {item.lastMessage && (
            <Text
              className="text-sm text-muted mt-1"
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
          )}

          {/* Количество участников */}
          <View className="flex-row items-center mt-1">
            <MaterialIcons name="people" size={14} color={colors.muted} />
            <Text className="text-xs text-muted ml-1">
              {item.memberCount} {t('members') || 'participants'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-4">
      <MaterialIcons name="group" size={64} color={colors.muted} />
      <Text className="text-lg font-semibold text-foreground mt-4">
        {t('noGroups')}
      </Text>
      <Text className="text-sm text-muted text-center mt-2">
        {t('createGroupDescription')}
      </Text>
      <Pressable
        onPress={handleCreateGroup}
        className="mt-6 px-6 py-3 rounded-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold">
          {t('createGroup')}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="bg-background">
      {/* Заголовок */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-foreground">
            {t('groups')}
          </Text>
          <Pressable
            onPress={handleCreateGroup}
            className="p-2 rounded-full"
            style={{ backgroundColor: colors.surface }}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Поиск */}
        <View
          className="flex-row items-center px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            placeholder={t('searchGroups')}
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2 text-foreground"
            style={{
              fontSize: 16,
              color: colors.foreground,
            }}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Вкладка архивированные */}
      {groups.some((g) => g.isArchived) && (
        <View className="flex-row px-4 py-2 border-b" style={{ borderBottomColor: colors.border }}>
          <Pressable
            onPress={() => setShowArchived(!showArchived)}
            className="flex-row items-center"
          >
            <MaterialIcons
              name={showArchived ? 'expand-less' : 'expand-more'}
              size={20}
              color={colors.primary}
            />
            <Text className="ml-2 text-primary font-semibold">
              {t('archived')} ({groups.filter((g) => g.isArchived).length})
            </Text>
          </Pressable>
        </View>
      )}

      {/* Список групп */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">{t('loading')}</Text>
        </View>
      ) : filteredGroups.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </ScreenContainer>
  );
}
