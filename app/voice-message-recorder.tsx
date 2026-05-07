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
import { VoiceMessageService } from '@/lib/voice-message-service';
import { useAuth } from '@/lib/auth-provider';
import * as Haptics from 'expo-haptics';

export default function VoiceMessageRecorderScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  const { user } = useAuth();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    initializeAudio();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const initializeAudio = async () => {
    try {
      await VoiceMessageService.initializeAudio();
    } catch (error) {
      console.error('Error initializing audio:', error);
      Alert.alert(t('common.error'), 'Failed to initialize audio');
    }
  };

  const handleStartRecording = async () => {
    try {
      setLoading(true);
      await VoiceMessageService.startRecording();
      setIsRecording(true);
      setDuration(0);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(t('common.error'), 'Failed to start recording');
    } finally {
      setLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setLoading(true);
      const uri = await VoiceMessageService.stopRecording();
      setIsRecording(false);
      setRecordingUri(uri);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert(t('common.error'), 'Failed to stop recording');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVoiceMessage = async () => {
    if (!user || !chatId || !recordingUri) {
      Alert.alert(t('common.error'), 'Missing required data');
      return;
    }

    try {
      setLoading(true);
      const voiceMessage = await VoiceMessageService.createVoiceMessage({
        chatId,
        userId: user.id,
        senderName: user.name || 'Unknown',
        senderAvatar: user.avatar || '',
        audioUri: recordingUri,
        duration,
      });

      if (voiceMessage) {
        Alert.alert(t('common.success'), 'Voice message sent');
        router.back();
      }
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert(t('common.error'), 'Failed to send voice message');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRecording = () => {
    setRecordingUri(null);
    setDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          Голосовое сообщение
        </Text>
      </View>

      {/* Recording Status */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Duration Display */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isRecording ? colors.error : colors.border,
          }}
        >
          <Text
            style={{
              color: colors.foreground,
              fontSize: 48,
              fontWeight: 'bold',
              fontFamily: 'monospace',
            }}
          >
            {formatDuration(duration)}
          </Text>
          {isRecording && (
            <Text
              style={{
                color: colors.error,
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Идет запись...
            </Text>
          )}
        </View>

        {/* Recording Controls */}
        {!recordingUri ? (
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            {!isRecording ? (
              <TouchableOpacity
                onPress={handleStartRecording}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 50,
                  width: 80,
                  height: 80,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <IconSymbol name="paperplane.fill" size={32} color={colors.background} />
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleStopRecording}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 50,
                    width: 80,
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <IconSymbol name="chevron.right" size={32} color={colors.background} />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={handleCancelRecording}
              disabled={loading}
              style={{
                backgroundColor: colors.error,
                borderRadius: 50,
                width: 80,
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={32} color={colors.background} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendVoiceMessage}
              disabled={loading}
              style={{
                backgroundColor: colors.success,
                borderRadius: 50,
                width: 80,
                height: 80,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <IconSymbol name="paperplane.fill" size={32} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}
