import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';
import { MessageSearchService } from '@/lib/message-search-service';
import { Message } from '@/lib/chat-service';

export default function MessageSearchScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !chatId) {
      Alert.alert(t('common.error'), 'Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const searchQuery_obj: any = { text: searchQuery, chatId };
      const searchResults = await MessageSearchService.searchByText(searchQuery_obj);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching messages:', error);
      Alert.alert(t('common.error'), 'Failed to search messages');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, chatId, t]);

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setSearched(false);
  };

  const handleSelectMessage = (message: any) => {
    router.push({
      pathname: '/chat-detail',
      params: {
        chatId: chatId,
        messageId: message.id,
      },
    });
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleSelectMessage(item)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
      }}
    >
      <Text
        style={{
          color: colors.foreground,
          fontSize: 14,
          fontWeight: '500',
          marginBottom: 4,
        }}
        numberOfLines={2}
      >
        {item.text}
      </Text>
      <Text
        style={{
          color: colors.muted,
          fontSize: 12,
        }}
      >
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 p-4">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
          gap: 8,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 18,
            fontWeight: '600',
            flex: 1,
          }}
        >
          {t('common.search')}
        </Text>
      </View>

      {/* Search Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <IconSymbol name="paperplane.fill" size={20} color={colors.muted} />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            color: colors.foreground,
            fontSize: 14,
          }}
          placeholder={t('common.search')}
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {t('common.noResults')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </ScreenContainer>
  );
}
