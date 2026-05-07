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

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  isOnline: boolean;
}

export default function ContactsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mockContacts: Contact[] = [
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
      {
        id: "4",
        name: "Emma Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        status: "Online",
        isOnline: true,
      },
      {
        id: "5",
        name: "Alex Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        status: "Last seen 2 hours ago",
        isOnline: false,
      },
    ];
    setContacts(mockContacts);
    setFilteredContacts(mockContacts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => {
        // Start a new chat with this contact
      }}
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

      <TouchableOpacity
        onPress={() => {
          // Start call
        }}
        className="bg-primary rounded-full w-10 h-10 items-center justify-center"
      >
        <IconSymbol name="phone.fill" size={18} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      <View className="px-4 pt-4 gap-4">
        <Text className="text-2xl font-bold text-foreground">Contacts</Text>

        <View className="flex-row items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            className="flex-1 text-foreground"
            placeholder="Search contacts"
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
      ) : filteredContacts.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-lg text-muted">No contacts found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
