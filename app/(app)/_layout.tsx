import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/AuthContext';
import { WardrobeProvider } from '@/context/WardrobeContext';
import { useNotificationObserver } from '@/hooks/useNotificationObserver';
import { notificationsService } from '@/services/notifications.service';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';

// Show the reminder even when the app is already in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AuthLayout() {
  const { token, userData } = useAuth();
  const toastRef = useRef<UiToastRef>(null);

  const handleNotificationError = useCallback((message: string) => {
    toastRef.current?.show(message, 'error');
  }, []);

  useNotificationObserver({ onError: handleNotificationError });

  // Reconcile the device schedule with the stored preference on startup, so
  // the reminder survives app restarts and picks up the current user's name.
  // Gated on permission already being granted — the preference defaults to
  // enabled, and startup must never trigger a permission prompt.
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        if (!(await notificationsService.hasPermission())) {
          await notificationsService.cancelAll();
          return;
        }
        const prefs = await notificationsService.loadPrefs();
        await notificationsService.applyPrefs(prefs, userData?.name);
      } catch {
        // Scheduling is best-effort; never block app startup on it.
      }
    })();
  }, [token, userData?.name]);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <WardrobeProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="item/new" options={{ headerShown: false }} />
          <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="chat/[sessionId]"
            options={{ headerShown: false }}
          />
        </Stack>

        <UiToast ref={toastRef} />
      </View>
    </WardrobeProvider>
  );
}
