import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/i18n-provider";

interface Contact {
  id: string;
  name: string;
  avatar: string;
}

export default function GroupCreationScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    },
    {
      id: "2",
      name: "Sarah Smith",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    },
    {
      id: "4",
      name: "Emma Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    },
  ]);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      // TODO: Call group-chat-service to create group
      router.back();
    }
  };

  const renderMember = ({ item }: { item: Contact }) => {
    const isSelected = selectedMembers.includes(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleMember(item.id)}
        className="flex-row items-center gap-3 px-4 py-3 border-b border-border"
      >
        <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {item.name}
          </Text>
        </View>
        <View
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            isSelected
              ? "bg-primary border-primary"
              : "border-border bg-surface"
          }`}
        >
          {isSelected && (
            <IconSymbol name="checkmark" size={14} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">
              {t('contacts.addContact')}
            </Text>
            <View className="w-6" />
          </View>

          {/* Group Name Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              {t('chat.newMessage')}
            </Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder={t('chat.typeMessage')}
              placeholderTextColor={colors.muted}
              value={groupName}
              onChangeText={setGroupName}
            />
          </View>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t('contacts.importFromPhone')} ({selectedMembers.length})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedMembers.map((memberId) => {
                  const member = contacts.find((c) => c.id === memberId);
                  return (
                    <View
                      key={memberId}
                      className="bg-primary/20 px-3 py-2 rounded-full flex-row items-center gap-2"
                    >
                      <Text className="text-sm text-primary font-semibold">
                        {member?.name}
                      </Text>
                      <TouchableOpacity onPress={() => toggleMember(memberId)}>
                        <IconSymbol name="xmark" size={14} color="currentColor" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Members List */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">
              {t('contacts.title')}
            </Text>
            <FlatList
              data={contacts}
              renderItem={renderMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              className="border border-border rounded-lg overflow-hidden"
            />
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View className="px-4 py-4 gap-2">
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length === 0}
          className={`py-3 rounded-lg items-center justify-center ${
            groupName.trim() && selectedMembers.length > 0
              ? "bg-primary"
              : "bg-primary/50"
          }`}
        >
          <Text className="text-white font-semibold">
            {t('chat.send')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
