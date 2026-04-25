import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';
import { AuthApiService, ProfileData, UpdateProfilePayload } from '@/services/auth.service';
import ProfileSection from '@/components/pages/app/settings/ProfileSection';
import SignOutSection from '@/components/pages/app/settings/SignOutSection';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

const appVersion = Constants.expoConfig?.version ?? '—';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const toastRef = useRef<UiToastRef>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sub = AuthApiService.getProfile().subscribe({
      next: (data) => {
        setProfile(data);
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
        toastRef.current?.show('Failed to load profile', 'error');
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const handleSave = (
    payload: UpdateProfilePayload,
    onSuccess: () => void,
    onError: () => void,
  ) => {
    AuthApiService.updateProfile(payload).subscribe({
      next: (updated) => {
        setProfile(updated);
        onSuccess();
        toastRef.current?.show('Profile updated', 'success');
      },
      error: () => {
        onError();
        toastRef.current?.show('Failed to update profile', 'error');
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 20 },
        ]}
        keyboardDismissMode="on-drag"
      >
        {isLoading ? (
          <ActivityIndicator
            style={styles.loader}
            color={colors.textSecondary}
          />
        ) : profile ? (
          <ProfileSection profile={profile} onSave={handleSave} />
        ) : null}

        <View style={styles.separator} />

        <SignOutSection />

        <Text style={styles.version}>Version {appVersion}</Text>
      </ScrollView>

      <UiToast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 4,
  },
  loader: {
    marginVertical: 40,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  version: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 16,
  },
});
