import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/lib/auth-provider';
import { InvitationService, Invitation } from '@/lib/invitation-service';
import * as Haptics from 'expo-haptics';

export default function AcceptInvitationScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { user } = useAuth();
  const { code } = useLocalSearchParams<{ code: string }>();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadInvitation();
  }, [code]);

  const loadInvitation = async () => {
    if (!code) {
      setValidationError('Код приглашения не найден');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get invitation
      const inv = await InvitationService.getInvitationByCode(code);

      if (!inv) {
        setValidationError('Приглашение не найдено');
        return;
      }

      // Validate
      const validation = await InvitationService.validateInvitation(code);
      if (!validation.valid) {
        setValidationError(validation.reason || 'Приглашение невалидно');
        return;
      }

      setInvitation(inv);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setValidationError('Ошибка при загрузке приглашения');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user || !code) {
      Alert.alert(t('common.error'), 'Не удалось принять приглашение');
      return;
    }

    try {
      setAccepting(true);

      const result = await InvitationService.acceptInvitation(code, user.id);

      if (result) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert(
          t('common.success'),
          `Вы приняли приглашение от ${result.invitedByName}!`
        );

        // Navigate back or to home
        router.replace('/(tabs)/chats');
      } else {
        Alert.alert(t('common.error'), 'Не удалось принять приглашение');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      Alert.alert(t('common.error'), 'Ошибка при принятии приглашения');
    } finally {
      setAccepting(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!code) return;

    try {
      const success = await InvitationService.rejectInvitation(code);

      if (success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        Alert.alert(t('common.success'), 'Приглашение отклонено');
        router.back();
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      Alert.alert(t('common.error'), 'Ошибка при отклонении приглашения');
    }
  };

  const formatTimeRemaining = (expiresAt: number): string => {
    const now = Date.now();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
      return 'Истекло';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }

    return `${minutes}м`;
  };

  return (
    <ScreenContainer className="flex-1 p-4">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 32,
          gap: 8,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 18,
            fontWeight: '600',
            flex: 1,
          }}
        >
          Приглашение
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={{
              color: colors.muted,
              fontSize: 14,
              marginTop: 12,
            }}
          >
            Загрузка приглашения...
          </Text>
        </View>
      ) : validationError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.error,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 40 }}>❌</Text>
          </View>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {validationError}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 24,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                color: colors.background,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Вернуться
            </Text>
          </TouchableOpacity>
        </View>
      ) : invitation ? (
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          {/* Invitation Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: colors.primary,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>

            <Text
              style={{
                color: colors.foreground,
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {invitation.invitedByName}
            </Text>

            <Text
              style={{
                color: colors.muted,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              приглашает вас присоединиться к TSV Keeper
            </Text>

            {/* Time Remaining */}
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                ⏰ Действует: {formatTimeRemaining(invitation.expiresAt)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleAcceptInvitation}
              disabled={accepting}
              style={{
                backgroundColor: colors.success,
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: accepting ? 0.6 : 1,
              }}
            >
              {accepting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text
                  style={{
                    color: colors.background,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  ✅ Принять приглашение
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRejectInvitation}
              disabled={accepting}
              style={{
                backgroundColor: colors.error,
                borderRadius: 8,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: accepting ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                ❌ Отклонить
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
