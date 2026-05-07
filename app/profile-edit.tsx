import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/lib/auth-provider';
import { useI18n } from '@/hooks/use-i18n';
import { UserProfileService, UserProfile } from '@/lib/user-profile-service';
import * as ImagePicker from 'expo-image-picker';
import Haptics from 'expo-haptics';

export default function ProfileEditScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const { t } = useI18n();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await UserProfileService.getProfile(user.id);

      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name || '');
        setEmail((userProfile.email || '') as string);
        setPhone((userProfile.phone || '') as string);
        setStatus((userProfile.status || '') as string);
        setBio((userProfile.bio || '') as string);
        setAvatar((userProfile.avatar || '') as string);
      } else {
        // Create default profile
        const newProfile: UserProfile = {
          id: user.id,
          name: user.name || 'User',
          email: user.email || '',
          phone: '',
          status: 'Hey there!',
          bio: '',
          avatar: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setProfile(newProfile);
        setName(newProfile.name);
        setEmail((newProfile.email || '') as string);
        setStatus((newProfile.status || '') as string);
        setAvatar('');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(t('common.error'), 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri || '');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim()) {
      Alert.alert(t('common.error'), 'Name is required');
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await UserProfileService.saveProfile({
        id: user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status: status.trim(),
        bio: bio.trim(),
        avatar: avatar,
      });

      if (updatedProfile) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Alert.alert(t('common.success'), 'Profile updated successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(t('common.error'), 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">{t('profile.edit')}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text
              className="font-semibold"
              style={{
                color: saving ? colors.muted : colors.primary,
              }}
            >
              {saving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View className="items-center py-6 gap-4">
          <TouchableOpacity onPress={pickImage} className="relative">
            <Image
              source={{ uri: avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default' }}
              className="w-24 h-24 rounded-full"
            />
            <View
              className="absolute bottom-0 right-0 bg-primary rounded-full w-8 h-8 items-center justify-center"
              style={{ borderWidth: 2, borderColor: colors.background }}
            >
              <IconSymbol name="camera.fill" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Text className="text-primary font-medium">{t('profile.changeAvatar')}</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-4 gap-4">
          {/* Name */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('profile.name')}</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder={t('profile.name')}
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('profile.email')}</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder={t('profile.email')}
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={false}
            />
          </View>

          {/* Phone */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('profile.phone')}</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder={t('profile.phone')}
              placeholderTextColor={colors.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Status */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('profile.status')}</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="Hey there!"
              placeholderTextColor={colors.muted}
              value={status}
              onChangeText={setStatus}
              maxLength={100}
            />
          </View>

          {/* Bio */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Bio</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="Tell us about yourself"
              placeholderTextColor={colors.muted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
