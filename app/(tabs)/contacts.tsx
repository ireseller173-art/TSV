import React, { useState, useEffect } from "react";
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
import { UserPresenceService } from "@/lib/user-presence-service";
import { PressableButton } from "@/components/pressable-button";
import { PressableListItem } from "@/components/pressable-list-item";

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

  // Initialize presence tracking
  useEffect(() => {
    const initPresence = async () => {
      // In a real app, this would be the current user's ID
      await UserPresenceService.initialize('current-user-id');
    };
    initPresence();
  }, []);

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
    <PressableListItem
      onPress={() => {
        // Start a new chat with this contact
      }}
      leftIcon={
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          {item.isOnline && (
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              backgroundColor: colors.success,
              borderRadius: 6,
              borderWidth: 2,
              borderColor: colors.background,
            }} />
          )}
        </View>
      }
      rightIcon={
        <Pressable
          onPress={() => {
            // Start call
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
          <IconSymbol name="phone.fill" size={18} color="white" />
        </Pressable>
      }
      showGlow={true}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {item.status}
        </Text>
      </View>
    </PressableListItem>
  );

  return (
    <ScreenContainer className="flex-1 gap-4" edges={["top", "left", "right"]}>
      <View className="px-4 pt-4 gap-4">
        <Text className="text-2xl font-bold text-foreground">Контакты</Text>

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
