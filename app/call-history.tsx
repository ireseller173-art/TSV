import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CallHistoryService, CallRecord } from "@/lib/call-history-service";

export default function CallHistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setIsLoading(true);
      const history = await CallHistoryService.getCallHistory();
      const callStats = await CallHistoryService.getCallStats();
      setCallHistory(history);
      setStats(callStats);
    } catch (error) {
      console.error("Failed to load call history:", error);
      Alert.alert("Ошибка", "Не удалось загрузить историю звонков");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCallHistory();
    setRefreshing(false);
  };

  const handleDeleteCall = async (callId: string) => {
    Alert.alert("Удалить звонок?", "Это действие нельзя отменить", [
      { text: "Отмена", onPress: () => {} },
      {
        text: "Удалить",
        onPress: async () => {
          await CallHistoryService.deleteCall(callId);
          await loadCallHistory();
        },
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert("Очистить историю?", "Все записи о звонках будут удалены", [
      { text: "Отмена", onPress: () => {} },
      {
        text: "Очистить",
        onPress: async () => {
          await CallHistoryService.clearCallHistory();
          await loadCallHistory();
        },
      },
    ]);
  };

  const getFilteredCalls = () => {
    if (filter === 'all') return callHistory;
    if (filter === 'incoming') return callHistory.filter((c) => c.callType === 'incoming');
    if (filter === 'outgoing') return callHistory.filter((c) => c.callType === 'outgoing');
    if (filter === 'missed') return callHistory.filter((c) => c.status === 'missed');
    return callHistory;
  };

  const filteredCalls = getFilteredCalls();

  const renderCallItem = ({ item }: { item: CallRecord }) => {
    const isIncoming = item.callType === 'incoming';
    const isMissed = item.status === 'missed';
    const otherUser = isIncoming ? item.callerName : item.recipientName;

    return (
      <TouchableOpacity
        className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
      >
        {/* Call Type Icon */}
        <View
          className="rounded-full w-12 h-12 items-center justify-center"
          style={{
            backgroundColor: isMissed ? colors.error : colors.primary,
          }}
        >
          <IconSymbol
            name="phone.fill"
            size={20}
            color="white"
          />
        </View>

        {/* Call Info */}
        <View className="flex-1 gap-1">
          <Text className="text-base font-semibold text-foreground">
            {otherUser}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-muted">
              {isIncoming ? '📥 Входящий' : '📤 Исходящий'}
            </Text>
            {isMissed && <Text className="text-xs" style={{ color: colors.error }}>Пропущен</Text>}
            {!isMissed && (
              <Text className="text-xs text-muted">
                {CallHistoryService.formatCallDuration(item.duration)}
              </Text>
            )}
          </View>
        </View>

        {/* Time and Delete */}
        <View className="items-end gap-2">
          <Text className="text-xs text-muted">
            {CallHistoryService.formatCallTime(item.timestamp)}
          </Text>
          <TouchableOpacity
            onPress={() => handleDeleteCall(item.id)}
            className="w-8 h-8 items-center justify-center"
          >
            <IconSymbol name="trash.fill" size={14} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground flex-1">История звонков</Text>
      </View>

      {/* Stats */}
      {stats && !isLoading && (
        <View className="px-4 pb-4 flex-row justify-around bg-surface mx-4 rounded-lg p-4">
          <View className="items-center">
            <Text className="text-lg font-bold text-primary">{stats.totalCalls}</Text>
            <Text className="text-xs text-muted mt-1">Всего</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-primary">{stats.missedCalls}</Text>
            <Text className="text-xs text-muted mt-1">Пропущено</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-primary">
              {CallHistoryService.formatCallDuration(stats.totalDuration)}
            </Text>
            <Text className="text-xs text-muted mt-1">Всего</Text>
          </View>
        </View>
      )}

      {/* Filters */}
      <View className="flex-row px-4 py-3 gap-2">
        {(['all', 'incoming', 'outgoing', 'missed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: filter === f ? colors.primary : colors.surface,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{
                color: filter === f ? 'white' : colors.foreground,
              }}
            >
              {f === 'all' && 'Все'}
              {f === 'incoming' && 'Входящие'}
              {f === 'outgoing' && 'Исходящие'}
              {f === 'missed' && 'Пропущенные'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Call List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredCalls.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <IconSymbol name="phone.fill" size={48} color={colors.muted} />
          <Text className="text-lg text-muted">Нет звонков</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCalls}
          renderItem={renderCallItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEnabled={true}
        />
      )}

      {/* Clear history button */}
      {callHistory.length > 0 && !isLoading && (
        <TouchableOpacity
          onPress={handleClearHistory}
          className="mx-4 my-4 py-3 px-4 bg-error rounded-lg items-center"
        >
          <Text className="text-sm font-semibold text-white">Очистить историю</Text>
        </TouchableOpacity>
      )}
    </ScreenContainer>
  );
}
