import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';
// import { ContactManagementService } from '@/lib/contact-management-service';
import { useAuth } from '@/lib/auth-provider';
import Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// TODO: Uncomment when Firebase integration is complete
// import { ContactManagementService } from '@/lib/contact-management-service';

interface ContactItem {
  id: string;
  name: string;
  avatar: string;
  isFavorite?: boolean;
  isBlocked?: boolean;
}

export default function ContactManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { user } = useAuth();
  const { tab = 'favorites' } = useLocalSearchParams<{ tab: string }>();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'blocked'>(
    (tab as 'favorites' | 'blocked') || 'favorites'
  );

  useEffect(() => {
    loadContacts();
  }, [activeTab]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, this would fetch from Firebase
      const mockContacts: ContactItem[] = [
        {
          id: '1',
          name: 'John Doe',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          isFavorite: activeTab === 'favorites',
          isBlocked: activeTab === 'blocked',
        },
        {
          id: '2',
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
          isFavorite: activeTab === 'favorites',
          isBlocked: activeTab === 'blocked',
        },
      ];
      setContacts(mockContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert(t('common.error'), t('contacts.loadError') || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (contactId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // TODO: Implement with Firebase
      loadContacts();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert(t('common.error'), t('contacts.updateFavoriteError') || 'Failed to update favorite');
    }
  };

  const handleToggleBlock = async (contactId: string) => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      // TODO: Implement with Firebase
      loadContacts();
    } catch (error) {
      console.error('Error toggling block:', error);
      Alert.alert(t('common.error'), t('contacts.updateBlockError') || 'Failed to update block status');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    Alert.alert(
      t('common.confirm'),
      activeTab === 'favorites'
        ? t('contacts.removeFavorite')
        : t('contacts.unblockContact'),
      [
        { text: t('common.cancel'), onPress: () => {} },
        {
          text: activeTab === 'favorites' ? t('contacts.removeAction') : t('contacts.unblockAction'),
          onPress: async () => {
            try {
              // TODO: Implement with Firebase
              loadContacts();
            } catch (error) {
              Alert.alert(t('common.error'), t('contacts.removeError') || 'Failed to remove contact');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderContactItem = ({ item }: { item: ContactItem }) => (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
      <View className="flex-row items-center gap-3 flex-1">
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full"
        />
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted">
            {activeTab === 'favorites' ? t('contacts.favoriteStatus') : t('contacts.blockedStatus')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveContact(item.id)}
        className="bg-error rounded-full w-8 h-8 items-center justify-center"
      >
        <IconSymbol name="trash.fill" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">
          {activeTab === 'favorites' ? t('contacts.favoritesTitle') : t('contacts.blockedTitle')}
        </Text>
        <View className="w-6" />
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-border">
        <TouchableOpacity
          onPress={() => setActiveTab('favorites')}
          className={`flex-1 py-3 border-b-2 ${
            activeTab === 'favorites'
              ? `border-primary`
              : `border-transparent`
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'favorites'
                ? 'text-primary'
                : 'text-muted'
            }`}
          >
            {t('contacts.favoritesTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('blocked')}
          className={`flex-1 py-3 border-b-2 ${
            activeTab === 'blocked'
              ? `border-primary`
              : `border-transparent`
          }`}
        >
          <Text
            className={`text-center font-medium ${
              activeTab === 'blocked'
                ? 'text-primary'
                : 'text-muted'
            }`}
          >
            {t('contacts.blockedTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : contacts.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2">
          <IconSymbol
            name={activeTab === 'favorites' ? 'star' : 'nosign'}
            size={48}
            color={colors.muted}
          />
          <Text className="text-lg text-muted">
            {activeTab === 'favorites'
              ? t('contacts.noFavorites')
              : t('contacts.noBlocked')}
          </Text>
          <Text className="text-sm text-muted">
            {activeTab === 'favorites'
              ? t('contacts.addToFavorites')
              : t('contacts.blockedHere')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
        />
      )}
    </ScreenContainer>
  );
}
