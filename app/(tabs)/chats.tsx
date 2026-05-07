import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-provider";
import { useI18n } from "@/hooks/use-i18n";

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

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
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
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
    >
      <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />

      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-foreground flex-1">
            {item.name}
          </Text>
          <Text className="text-xs text-muted">{item.timestamp}</Text>
        </View>
        <Text className="text-sm text-muted" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unread > 0 && (
        <View className="bg-accent rounded-full w-6 h-6 items-center justify-center">
          <Text className="text-white text-xs font-bold">{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      <View className="px-4 pt-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">{t('chat.messages')}</Text>
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              router.push("/new-chat");
            }}
            className="bg-primary rounded-full w-10 h-10 items-center justify-center"
          >
            <IconSymbol name="plus" size={20} color="white" />
          </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => {
              // @ts-ignore
              router.push("/contacts");
            }}
            className="mt-4 bg-primary px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">{t('chat.startChatting')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
