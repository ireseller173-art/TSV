import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useI18n } from '@/hooks/use-i18n';
import { useAuth } from '@/lib/auth-provider';
import { InvitationService } from '@/lib/invitation-service';
import { EmailInvitationService } from '@/lib/email-invitation-service';
import { SMSInvitationService } from '@/lib/sms-invitation-service';
import * as Haptics from 'expo-haptics';

export default function SendInvitationScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { user } = useAuth();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  const handleSendInvitation = async () => {
    if (!user) {
      Alert.alert(t('common.error'), 'User not authenticated');
      return;
    }

    if (!sendViaEmail && !sendViaSMS) {
      Alert.alert(t('common.error'), 'Выберите способ отправки');
      return;
    }

    if (sendViaEmail && !EmailInvitationService.isValidEmail(recipientEmail)) {
      Alert.alert(t('common.error'), 'Введите корректный email');
      return;
    }

    if (sendViaSMS && !SMSInvitationService.isValidPhoneNumber(recipientPhone)) {
      Alert.alert(t('common.error'), 'Введите корректный номер телефона');
      return;
    }

    try {
      setLoading(true);

      // Create invitation
      const invitation = await InvitationService.createInvitation(
        user.id,
        user.name || 'Unknown',
        user.avatar || '',
        sendViaEmail ? recipientEmail : undefined,
        sendViaSMS ? recipientPhone : undefined
      );

      if (!invitation) {
        Alert.alert(t('common.error'), 'Не удалось создать приглашение');
        return;
      }

      setInvitationLink(invitation.invitationLink);

      // Send via email
      if (sendViaEmail && recipientEmail) {
        const emailSuccess = await EmailInvitationService.sendInvitationEmail({
          toEmail: recipientEmail,
          invitationLink: invitation.invitationLink,
          invitedByName: user.name || 'Unknown',
          invitedByAvatar: user.avatar,
        });

        if (!emailSuccess) {
          Alert.alert(t('common.warning'), 'Не удалось отправить email, но приглашение создано');
        }
      }

      // Send via SMS
      if (sendViaSMS && recipientPhone) {
        const smsSuccess = await SMSInvitationService.sendInvitationSMS({
          toPhoneNumber: recipientPhone,
          invitationLink: invitation.invitationLink,
          invitedByName: user.name || 'Unknown',
        });

        if (!smsSuccess) {
          Alert.alert(t('common.warning'), 'Не удалось отправить SMS, но приглашение создано');
        }
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(t('common.success'), 'Приглашение отправлено успешно!');
      setRecipientEmail('');
      setRecipientPhone('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      Alert.alert(t('common.error'), 'Ошибка при отправке приглашения');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      // In a real app, would use Clipboard API
      Alert.alert('Скопировано', invitationLink);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <ScreenContainer className="flex-1 p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
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
            Пригласить друга
          </Text>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 4,
            }}
          >
            ℹ️ Информация
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
            }}
          >
            Приглашение действует 12 часов. Каждое приглашение уникально и может быть использовано только один раз.
          </Text>
        </View>

        {/* Send via Email */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              📧 Отправить по Email
            </Text>
            <Switch
              value={sendViaEmail}
              onValueChange={setSendViaEmail}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {sendViaEmail && (
            <TextInput
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
              paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 14,
              }}
              placeholder="example@email.com"
              placeholderTextColor={colors.muted}
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              editable={!loading}
            />
          )}
        </View>

        {/* Send via SMS */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              📱 Отправить по SMS
            </Text>
            <Switch
              value={sendViaSMS}
              onValueChange={setSendViaSMS}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {sendViaSMS && (
            <TextInput
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                fontSize: 14,
              }}
              placeholder="+7 (999) 999-99-99"
              placeholderTextColor={colors.muted}
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSendInvitation}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
            marginBottom: 16,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text
              style={{
                color: colors.background,
                fontSize: 14,
                fontWeight: '600',
              }}
            >
              Отправить приглашение
            </Text>
          )}
        </TouchableOpacity>

        {/* Invitation Link Display */}
        {invitationLink && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.success,
            }}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
              }}
            >
              ✅ Ссылка приглашения:
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 11,
                fontFamily: 'monospace',
                marginBottom: 8,
                backgroundColor: colors.background,
                padding: 8,
                borderRadius: 4,
              }}
              selectable={true}
            >
              {invitationLink}
            </Text>
            <TouchableOpacity
              onPress={handleCopyLink}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 4,
                paddingVertical: 8,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                Скопировать ссылку
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
