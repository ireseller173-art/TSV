import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import {
  GlobalSearchService,
  SearchResult,
  SearchHistory,
} from '@/lib/global-search-service';
import { cn } from '@/lib/utils';

export default function GlobalSearchScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const hist = await GlobalSearchService.getHistory();
      setHistory(hist);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    try {
      setQuery(searchQuery);

      if (searchQuery.trim().length === 0) {
        setResults([]);
        setShowHistory(true);
        return;
      }

      setLoading(true);
      setShowHistory(false);
      const searchResults = await GlobalSearchService.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      Alert.alert(String(t('common.error')), String(t('search.error') || 'Search failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = (historyQuery: string) => {
    handleSearch(historyQuery);
  };

  const handleRemoveFromHistory = async (historyQuery: string) => {
    try {
      await GlobalSearchService.removeFromHistory(historyQuery);
      await loadHistory();
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      String(t('common.confirm') || 'Confirm'),
      String(t('search.clearHistoryConfirm') || 'Clear search history?'),
      [
        {
          text: String(t('common.cancel') || 'Cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: String(t('common.clear') || 'Clear'),
          onPress: async () => {
            try {
              await GlobalSearchService.clearHistory();
              setHistory([]);
            } catch (error) {
              Alert.alert(String(t('common.error')), String(t('search.clearError') || 'Failed to clear'));
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleResultPress = (result: SearchResult) => {
    // Navigate to appropriate screen based on result type
    switch (result.type) {
      case 'message':
        router.push('/chat-detail');
        break;
      case 'contact':
        router.push('/profile');
        break;
      case 'group':
        router.push('/group-detail');
        break;
      case 'chat':
        router.push('/chat-detail');
        break;
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      onPress={() => handleResultPress(item)}
      className="flex-row items-center gap-3 p-3 border-b border-border"
    >
      {item.avatar && (
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full"
        />
      )}

      <View className="flex-1">
        <Text className="text-foreground font-semibold">{item.title}</Text>
        {item.subtitle && (
          <Text className="text-sm text-muted">{item.subtitle}</Text>
        )}
        {item.preview && (
          <Text className="text-xs text-muted mt-1 line-clamp-1">
            {item.preview}
          </Text>
        )}
      </View>

      <View className="items-end">
        <View
          className={cn(
            'px-2 py-1 rounded-full',
            item.type === 'message' && 'bg-primary/20',
            item.type === 'contact' && 'bg-success/20',
            item.type === 'group' && 'bg-warning/20'
          )}
        >
          <Text className="text-xs font-semibold text-foreground">
            {item.type}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderHistoryItem = ({ item }: { item: SearchHistory }) => (
    <View className="flex-row items-center justify-between p-3 border-b border-border">
      <Pressable
        onPress={() => handleHistoryItemPress(item.query)}
        className="flex-1"
      >
        <Text className="text-foreground">{item.query}</Text>
        <Text className="text-xs text-muted">
          {item.resultCount} {t('search.results') || 'results'}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleRemoveFromHistory(item.query)}
        className="p-2"
      >
        <Text className="text-lg text-muted">×</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer>
      <View className="gap-4 p-4 flex-1">
        {/* Search Input */}
        <View className="flex-row items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border">
          <Text className="text-lg text-muted">🔍</Text>
          <TextInput
            placeholder={String(t('search.placeholder') || 'Search messages, contacts, groups...')}
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={handleSearch}
            className="flex-1 text-foreground"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Text className="text-lg text-muted">×</Text>
            </Pressable>
          )}
        </View>

        {/* Results or History */}
        {showHistory && history.length > 0 ? (
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-foreground">
                {t('search.history') || 'Recent Searches'}
              </Text>
              <Pressable onPress={handleClearHistory}>
                <Text className="text-sm text-primary">
                  {t('common.clear') || 'Clear'}
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={history}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.query}
              scrollEnabled={false}
            />
          </View>
        ) : showHistory ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t('search.noHistory') || 'No search history'}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('search.startSearching') || 'Start typing to search'}
            </Text>
          </View>
        ) : loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-foreground">{t('common.loading') || 'Loading...'}</Text>
          </View>
        ) : results.length > 0 ? (
          <View className="flex-1">
            <Text className="text-sm text-muted mb-2">
              {results.length} {t('search.results') || 'results'}
            </Text>
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
            />
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg font-semibold text-foreground mb-2">
              {t('search.noResults') || 'No results found'}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('search.tryDifferentQuery') || 'Try a different search'}
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
