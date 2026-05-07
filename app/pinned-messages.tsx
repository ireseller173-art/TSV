import { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { PinnedMessagesService, PinnedMessage } from '@/lib/pinned-messages-service';

export default function PinnedMessagesScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPinnedMessages();
  }, [chatId]);

  const loadPinnedMessages = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const messages = await PinnedMessagesService.getPinnedMessages(chatId);
      setPinnedMessages(messages.sort((a, b) => b.pinnedAt - a.pinnedAt));
    } catch (error) {
      console.error('Error loading pinned messages:', error);
      Alert.alert(t('common.error'), 'Failed to load pinned messages');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId: string) => {
    if (!chatId) return;
    try {
      const success = await PinnedMessagesService.unpinMessage(messageId, chatId);
      if (success) {
        setPinnedMessages(pinnedMessages.filter((pm) => pm.messageId !== messageId));
        Alert.alert(t('common.success'), 'Message unpinned');
      }
    } catch (error) {
      console.error('Error unpinning message:', error);
      Alert.alert(t('common.error'), 'Failed to unpin message');
    }
  };

  const handleSelectMessage = (pinnedMessage: PinnedMessage) => {
    router.push({
      pathname: '/chat-detail',
      params: {
        chatId: chatId,
        messageId: pinnedMessage.messageId,
      },
    });
  };

  const renderPinnedMessage = ({ item }: { item: PinnedMessage }) => (
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
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {item.message.text}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
            }}
          >
            {new Date(item.pinnedAt).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleUnpin(item.messageId)}
          style={{ marginLeft: 8 }}
        >
          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>
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
          Закрепленные сообщения ({pinnedMessages.length})
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : pinnedMessages.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            Нет закрепленных сообщений
          </Text>
        </View>
      ) : (
        <FlatList
          data={pinnedMessages}
          renderItem={renderPinnedMessage}
          keyExtractor={(item) => item.messageId}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </ScreenContainer>
  );
}
