import { useState } from "react";
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

interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  isOnline: boolean;
}

export default function NewChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      status: "Available",
      isOnline: true,
    },
    {
      id: "2",
      name: "Sarah Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      status: "In a meeting",
      isOnline: false,
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      status: "Away",
      isOnline: false,
    },
  ]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSelectUser = (user: User) => {
    // @ts-ignore
    router.push({
      pathname: "/chat-detail",
      params: { chatId: user.id, chatName: user.name },
    });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleSelectUser(item)}
      className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
    >
      <View className="relative">
        <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
        {item.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
        )}
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground">{item.name}</Text>
        <Text className="text-xs text-muted">{item.status}</Text>
      </View>

      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      <View className="px-4 pt-4 gap-4">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">New Chat</Text>
        </View>

        <View className="flex-row items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            className="flex-1 text-foreground"
            placeholder="Search users"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {filteredUsers.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-lg text-muted">No users found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
