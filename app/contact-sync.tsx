/**
 * Contact Sync Screen
 * 
 * Manages device contact synchronization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useContactSync } from '@/lib/contact-sync-provider';
import { useI18n } from '@/lib/i18n-provider';
import { t } from '@/lib/i18n';

export default function ContactSyncScreen() {
  const router = useRouter();
  const colors = useColors();
  const { contacts, isLoading, isSyncing, lastSyncTime, syncResult, error, syncContacts } =
    useContactSync();
  const { language } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSync = async () => {
    await syncContacts();
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return language === 'ru' ? 'Никогда' : 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return language === 'ru' ? 'Только что' : 'Just now';
    } else if (diffMins < 60) {
      return language === 'ru'
        ? `${diffMins} мин назад`
        : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return language === 'ru'
        ? `${diffHours} ч назад`
        : `${diffHours} h ago`;
    } else if (diffDays < 7) {
      return language === 'ru'
        ? `${diffDays} дн назад`
        : `${diffDays} d ago`;
    } else {
      return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US');
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: colors.surface },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.backButtonText, { color: colors.primary }]}>←</Text>
            </Pressable>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {language === 'ru' ? 'Синхронизация контактов' : 'Contact Sync'}
            </Text>
          </View>

          {/* Sync Status */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statusLabel, { color: colors.muted }]}>
              {language === 'ru' ? 'Последняя синхронизация:' : 'Last sync:'}
            </Text>
            <Text style={[styles.statusValue, { color: colors.foreground }]}>
              {formatLastSync(lastSyncTime)}
            </Text>

            {syncResult && (
              <View style={styles.syncResultContainer}>
                <Text style={[styles.syncResultText, { color: colors.success }]}>
                  ✓ {language === 'ru' ? 'Добавлено:' : 'Imported:'} {syncResult.imported}
                </Text>
                <Text style={[styles.syncResultText, { color: colors.primary }]}>
                  ↻ {language === 'ru' ? 'Обновлено:' : 'Updated:'} {syncResult.updated}
                </Text>
              </View>
            )}

            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                ⚠️ {error}
              </Text>
            )}
          </View>

          {/* Sync Button */}
          <Pressable
            onPress={handleSync}
            disabled={isSyncing || isLoading}
            style={({ pressed }) => [
              styles.syncButton,
              { backgroundColor: colors.primary },
              (pressed || isSyncing || isLoading) && { opacity: 0.7 },
            ]}
          >
            {isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>
                {language === 'ru' ? '🔄 Синхронизировать' : '🔄 Sync Now'}
              </Text>
            )}
          </Pressable>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.searchPlaceholder, { color: colors.muted }]}>
              🔍 {language === 'ru' ? 'Поиск контактов...' : 'Search contacts...'}
            </Text>
          </View>

          {/* Contacts List */}
          <View style={styles.contactsContainer}>
            <Text style={[styles.contactsCount, { color: colors.muted }]}>
              {language === 'ru' ? 'Контактов:' : 'Contacts:'} {filteredContacts.length}
            </Text>

            {isLoading ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : filteredContacts.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {language === 'ru'
                  ? 'Контакты не найдены'
                  : 'No contacts found'}
              </Text>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[styles.contactItem, { backgroundColor: colors.background }]}>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: colors.foreground }]}>
                        {item.name}
                      </Text>
                      {item.phoneNumbers.length > 0 && (
                        <Text style={[styles.contactPhone, { color: colors.muted }]}>
                          {item.phoneNumbers[0]}
                        </Text>
                      )}
                      {item.emails.length > 0 && (
                        <Text style={[styles.contactEmail, { color: colors.muted }]}>
                          {item.emails[0]}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>
              {language === 'ru' ? 'ℹ️ Информация' : 'ℹ️ Information'}
            </Text>
            <Text style={[styles.infoText, { color: colors.muted }]}>
              {language === 'ru'
                ? 'Контакты синхронизируются автоматически каждые 24 часа. Вы также можете синхронизировать вручную, нажав кнопку выше.'
                : 'Contacts sync automatically every 24 hours. You can also sync manually by pressing the button above.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  syncResultContainer: {
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  syncResultText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
  syncButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactsContainer: {
    flex: 1,
    marginVertical: 8,
  },
  contactsCount: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  contactItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0a7ea4',
  },
  contactInfo: {
    gap: 4,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 12,
  },
  contactEmail: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 32,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
