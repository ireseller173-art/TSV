import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CallHistoryService, CallRecord } from "@/lib/call-history-service";
import { PressableButton } from "@/components/pressable-button";
import { PressableListItem } from "@/components/pressable-list-item";

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
      <PressableListItem
        onPress={() => {}}
        leftIcon={
          <View
            style={{
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isMissed ? colors.error : colors.primary,
            }}
          >
            <IconSymbol
              name="phone.fill"
              size={20}
              color="white"
            />
          </View>
        }
        rightIcon={
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {CallHistoryService.formatCallTime(item.timestamp)}
            </Text>
            <Pressable
              onPress={() => handleDeleteCall(item.id)}
              style={({ pressed }) => [{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.6 : 1,
              }]}
            >
              <IconSymbol name="trash.fill" size={14} color={colors.error} />
            </Pressable>
          </View>
        }
        showGlow={true}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
            {otherUser}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {isIncoming ? '📥 Входящий' : '📤 Исходящий'}
            </Text>
            {isMissed && <Text style={{ fontSize: 12, color: colors.error }}>Пропущен</Text>}
            {!isMissed && (
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {CallHistoryService.formatCallDuration(item.duration)}
              </Text>
            )}
          </View>
        </View>
      </PressableListItem>
    );
  };

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-4 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{
            opacity: pressed ? 0.6 : 1,
          }]}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </Pressable>
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
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={({ pressed }) => [{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: filter === f ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
              shadowColor: filter === f ? colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: pressed ? 0.3 : 0,
              shadowRadius: 4,
              elevation: pressed ? 4 : 0,
            }]}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: filter === f ? 'white' : colors.foreground,
              }}
            >
              {f === 'all' && 'Все'}
              {f === 'incoming' && 'Входящие'}
              {f === 'outgoing' && 'Исходящие'}
              {f === 'missed' && 'Пропущенные'}
            </Text>
          </Pressable>
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
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <PressableButton
            label="Очистить историю"
            variant="danger"
            size="medium"
            onPress={handleClearHistory}
            showGlow={true}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
