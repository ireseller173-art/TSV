import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-provider";
import { useI18n } from "@/hooks/use-i18n";
import { ChatContextMenu } from "@/components/chat-context-menu";
import { PressableButton } from "@/components/pressable-button";
import { PressableListItem } from "@/components/pressable-list-item";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isGroup: boolean;
}

export default function ChatsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const { t, language, toggleLanguage } = useI18n();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
  const [mutedChats, setMutedChats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mockChats: Chat[] = [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        lastMessage: "Hey, how are you?",
        timestamp: "2 min ago",
        unread: 2,
        isGroup: false,
      },
      {
        id: "2",
        name: "Team Project",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=team",
        lastMessage: "You: Thanks for the update!",
        timestamp: "1 hour ago",
        unread: 0,
        isGroup: true,
      },
      {
        id: "3",
        name: "Sarah Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        lastMessage: "See you tomorrow!",
        timestamp: "3 hours ago",
        unread: 0,
        isGroup: false,
      },
    ];
    setChats(mockChats);
    setFilteredChats(mockChats);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const handlePinChat = () => {
    if (!selectedChatId) return;
    const newPinned = new Set(pinnedChats);
    if (newPinned.has(selectedChatId)) {
      newPinned.delete(selectedChatId);
    } else {
      newPinned.add(selectedChatId);
    }
    setPinnedChats(newPinned);
  };

  const handleMuteChat = () => {
    if (!selectedChatId) return;
    const newMuted = new Set(mutedChats);
    if (newMuted.has(selectedChatId)) {
      newMuted.delete(selectedChatId);
    } else {
      newMuted.add(selectedChatId);
    }
    setMutedChats(newMuted);
  };

  const handleDeleteChat = () => {
    if (!selectedChatId) return;
    setChats(chats.filter((c) => c.id !== selectedChatId));
  };

  const handleArchiveChat = () => {
    if (!selectedChatId) return;
    console.log('Archive chat:', selectedChatId);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <PressableListItem
      onPress={() => {
        router.push({
          pathname: "/chat-detail",
          params: {
            chatId: item.id,
            chatName: item.name,
            chatAvatar: item.avatar,
            isGroup: item.isGroup ? "true" : "false",
          },
        });
      }}
      leftIcon={<Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />}
      rightIcon={item.unread > 0 ? (
        <View style={{ backgroundColor: colors.primary, borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{item.unread}</Text>
        </View>
      ) : null}
      showGlow={true}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>{item.timestamp}</Text>
        </View>
        <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </PressableListItem>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      <View className="px-4 pt-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">{t('chat.messages')}</Text>
          <Pressable
            onPress={() => {
              // @ts-ignore
              router.push("/new-chat");
            }}
            style={({ pressed }) => [{
              backgroundColor: colors.primary,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: pressed ? 0.4 : 0.1,
              shadowRadius: 4,
              elevation: pressed ? 8 : 2,
            }]}
          >
            <IconSymbol name="plus" size={20} color="white" />
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            className="flex-1 text-foreground"
            placeholder={t('chat.searchConversations')}
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredChats.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-lg text-muted">{t('chat.noChats')}</Text>
          <PressableButton
            onPress={() => {
              // @ts-ignore
              router.push("/contacts");
            }}
            label={t('chat.startChatting')}
            variant="primary"
            size="medium"
            showGlow={true}
          />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}

      {/* Chat Context Menu */}
      {selectedChatId && (
        <ChatContextMenu
          visible={showContextMenu}
          onClose={() => setShowContextMenu(false)}
          onPin={handlePinChat}
          onMute={handleMuteChat}
          onDelete={handleDeleteChat}
          onArchive={handleArchiveChat}
          isPinned={pinnedChats.has(selectedChatId)}
          isMuted={mutedChats.has(selectedChatId)}
        />
      )}
    </ScreenContainer>
  );
}
