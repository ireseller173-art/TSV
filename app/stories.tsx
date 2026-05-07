import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, FlatList, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useI18n } from '@/hooks/use-i18n';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/hooks/use-auth';
import { StoriesService, Story, UserStory } from '@/lib/stories-service';
import { cn } from '@/lib/utils';

export default function StoriesScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const { user } = useAuth();
  const [stories, setStories] = useState<UserStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimers();
    }, 1000);

    return () => clearInterval(interval);
  }, [stories]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const allStories = await StoriesService.getAllStories();
      setStories(allStories);

      const timers: Record<string, number> = {};
      allStories.forEach((userStory) => {
        userStory.stories.forEach((story) => {
          const timeLeft = StoriesService.getTimeRemaining(story.createdAt);
          timers[story.id] = timeLeft;
        });
      });
      setTimeRemaining(timers);
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert(t('common.error'), t('stories.loadError') || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const updateTimers = () => {
    setTimeRemaining((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((storyId) => {
        updated[storyId] = Math.max(0, updated[storyId] - 1);
        if (updated[storyId] === 0) {
          delete updated[storyId];
        }
      });
      return updated;
    });
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return t('stories.expired') || 'Expired';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const handleStoryPress = (story: Story) => {
    setSelectedStory(story);
    setShowStoryPreview(true);
  };

  const handleDeleteStory = async (storyId: string) => {
    Alert.alert(
      t('common.confirm') || 'Confirm',
      t('stories.deleteConfirm') || 'Delete this story?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('common.delete') || 'Delete',
          onPress: async () => {
            try {
              await StoriesService.deleteStory(storyId);
              await loadStories();
              setShowStoryPreview(false);
              Alert.alert(
                t('common.success'),
                t('stories.deleteSuccess') || 'Story deleted'
              );
            } catch (error) {
              Alert.alert(
                t('common.error'),
                t('stories.deleteError') || 'Failed to delete story'
              );
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderStoryItem = ({ item: userStory }: { item: UserStory }) => {
    const isCurrentUser = userStory.userId === user?.id;
    const firstStory = userStory.stories[0];
    const timeLeft = timeRemaining[firstStory.id] || 0;
    const isExpired = (timeLeft as number) === 0;

    return (
      <Pressable
        onPress={() => handleStoryPress(firstStory)}
        className={cn(
          'rounded-lg overflow-hidden border-2 mb-3',
          isExpired ? 'border-border opacity-50' : 'border-primary'
        )}
      >
        <Image
          source={{ uri: firstStory.mediaUrl }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="absolute inset-0 bg-black/30 justify-between p-3">
          <View className="flex-row items-center gap-2">
            {userStory.userAvatar && (
              <Image
                source={{ uri: userStory.userAvatar }}
                className="w-8 h-8 rounded-full"
              />
            )}
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">
                {userStory.userName}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-end">
            <Text className="text-white text-xs font-medium">
              {formatTimeRemaining(timeLeft)}
            </Text>
            {isCurrentUser && (
              <Pressable
                onPress={() => handleDeleteStory(firstStory.id)}
                className="bg-error/80 px-2 py-1 rounded"
              >
                <Text className="text-white text-xs font-semibold">
                  {t('common.delete') || 'Delete'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderStoryPreview = () => {
    if (!selectedStory) return null;

    const timeLeft = timeRemaining[selectedStory.id] || 0;

    return (
      <Modal
        visible={showStoryPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStoryPreview(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
          <Pressable
            onPress={() => setShowStoryPreview(false)}
            className="absolute top-4 right-4 z-10 p-2"
          >
            <Text className="text-white text-2xl font-bold">×</Text>
          </Pressable>

          <Image
            source={{ uri: selectedStory.mediaUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />

          <View className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-full">
            <Text className="text-white text-sm font-semibold">
              {formatTimeRemaining(timeLeft)}
            </Text>
          </View>

          {selectedStory.caption && (
            <View className="absolute bottom-20 left-4 right-4 bg-black/70 p-3 rounded-lg">
              <Text className="text-white text-sm">{selectedStory.caption}</Text>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">{t('common.loading') || 'Loading...'}</Text>
      </ScreenContainer>
    );
  }

  if (stories.length === 0) {
    return (
      <ScreenContainer className="justify-center items-center gap-4">
        <Text className="text-lg font-semibold text-foreground">
          {t('stories.noStories') || 'No stories yet'}
        </Text>
        <Text className="text-sm text-muted text-center">
          {t('stories.noStoriesDescription') ||
            'Share your moments with stories that disappear after 24 hours'}
        </Text>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="mt-4 bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background font-semibold">
            {t('stories.createStory') || 'Create Story'}
          </Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="gap-4 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-2xl font-bold text-foreground">
            {t('stories.title') || 'Stories'}
          </Text>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-background font-semibold text-sm">
              {t('stories.add') || 'Add'}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.userId}
          scrollEnabled={false}
        />
      </ScrollView>

      {renderStoryPreview()}
    </ScreenContainer>
  );
}
