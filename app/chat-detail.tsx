import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MessageBubble } from "@/components/message-bubble";
import { ReactionPicker } from "@/components/reaction-picker";
import { CallButton } from "@/components/call-button";
import { MediaPicker } from "@/components/media-picker";
import { MediaPreview } from "@/components/media-preview";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-provider";
import { useChat } from "@/hooks/use-chat";
import Haptics from "expo-haptics";
import { Message } from "@/lib/chat-service";

export default function ChatDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const { chatId = "1", chatName = "Chat" } = useLocalSearchParams<{
    chatId: string;
    chatName: string;
  }>();

  const { messages, sendMessage, addReaction } = useChat(chatId);
  const [messageText, setMessageText] = useState("");
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user) return;

    try {
      await sendMessage(
        messageText,
        user.id,
        user.name,
        user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
      );
      setMessageText("");
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (selectedMessageId && user) {
      await addReaction(selectedMessageId, emoji, user.id);
      setSelectedMessageId(null);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => {
        setSelectedMessageId(item.id);
        setShowReactionPicker(true);
      }}
    >
      <MessageBubble
        message={item}
        isOwn={item.senderId === user?.id}
        onReaction={(emoji) => handleReaction(emoji)}
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground">{chatName}</Text>
              <Text className="text-xs text-muted">Online</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <CallButton
              recipientId={chatId}
              recipientName={chatName}
              recipientAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=default"
            />
            <TouchableOpacity className="bg-primary rounded-full w-10 h-10 items-center justify-center">
              <IconSymbol name="ellipsis" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2">
            <Text className="text-lg text-muted">No messages yet</Text>
            <Text className="text-sm text-muted">Start a conversation!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Area */}
        <View className="flex-row items-center gap-2 px-4 py-3 border-t border-border">
          <TouchableOpacity
            onPress={() => setShowMediaPicker(true)}
            className="bg-primary rounded-full w-10 h-10 items-center justify-center"
          >
            <IconSymbol name="plus" size={20} color="white" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-surface border border-border rounded-full px-4 py-2 text-foreground"
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            style={{ maxHeight: 100 }}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-primary rounded-full w-10 h-10 items-center justify-center"
            style={{ opacity: messageText.trim() ? 1 : 0.5 }}
          >
            <IconSymbol name="paperplane.fill" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </ScreenContainer>

      {/* Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onSelect={handleReaction}
        onClose={() => setShowReactionPicker(false)}
      />

      {/* Media Picker */}
      <MediaPicker
        visible={showMediaPicker}
        onMediaSelected={(media) => {
          setSelectedMedia(media);
          setShowMediaPicker(false);
          setShowMediaPreview(true);
        }}
        onCancel={() => setShowMediaPicker(false)}
      />

      {/* Media Preview */}
      <MediaPreview
        visible={showMediaPreview}
        media={selectedMedia}
        caption={mediaCaption}
        onCaptionChange={setMediaCaption}
        onSend={() => {
          // Send media message
          if (selectedMedia && user) {
            console.log("Sending media:", selectedMedia.fileName);
            setShowMediaPreview(false);
            setSelectedMedia(null);
            setMediaCaption("");
          }
        }}
        onCancel={() => {
          setShowMediaPreview(false);
          setSelectedMedia(null);
          setMediaCaption("");
        }}
      />
    </KeyboardAvoidingView>
  );
}
