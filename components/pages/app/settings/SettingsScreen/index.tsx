import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { AuthApiService, ProfileData, UpdateProfilePayload } from '@/services/auth.service';
import ProfileSection from '@/components/pages/app/settings/ProfileSection';
import NotificationsSection from '@/components/pages/app/settings/NotificationsSection';
import CalendarSection from '@/components/pages/app/settings/CalendarSection';
import SignOutSection from '@/components/pages/app/settings/SignOutSection';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';
import UiTitle from '@/components/ui/UiTitle';
import UiPage from '@/components/ui/UiPage';
import { colors } from '@/theme/colors';
import { styles } from './styles';

const appVersion = Constants.expoConfig?.version ?? '—';

export default function SettingsScreen() {
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
    <View style={styles.root} testID="settings-screen">
      <UiPage tabBarInset>
        {/* sizeL: spec 6.6's "Settings" 28/400 - the same page-title role as
            Items/Chat/Log. */}
        <View style={styles.header}>
          <UiTitle sizeL>Settings</UiTitle>
        </View>

        <View style={styles.profileBlock}>
          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
          ) : profile ? (
            <ProfileSection profile={profile} onSave={handleSave} />
          ) : null}
        </View>

        <View style={styles.separator} />

        <NotificationsSection
          onNotify={(message, type) => toastRef.current?.show(message, type)}
        />

        <View style={styles.separator} />

        <CalendarSection
          onNotify={(message, type) => toastRef.current?.show(message, type)}
        />

        <View style={styles.separator} />

        <SignOutSection />

        <Text style={styles.version}>Version {appVersion}</Text>
      </UiPage>

      <UiToast ref={toastRef} />
    </View>
  );
}
