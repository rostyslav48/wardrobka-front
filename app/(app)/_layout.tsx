import { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/context/AuthContext';
import { WardrobeProvider } from '@/context/WardrobeContext';
import { CalendarProvider, useCalendar } from '@/context/CalendarContext';
import { useNotificationObserver } from '@/hooks/useNotificationObserver';
import { notificationsService } from '@/services/notifications.service';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';

/**
 * Reconciles the device notification schedule with the stored preference and
 * the current calendar connection. Rendered inside `CalendarProvider` (not in
 * `AuthLayout` itself) so it can read `status` — that's what re-arms the
 * window after connect and after disconnect, in addition to cold start.
 */
function NotificationsReconciler() {
  const { userData } = useAuth();
  const { status, isLoading } = useCalendar();

  useEffect(() => {
    // Wait for the initial calendar fetch so this runs once, already knowing
    // whether occasions are available, instead of scheduling twice (recurring
    // then occasion-aware) on every cold start.
    if (isLoading) return;

    (async () => {
      try {
        if (!(await notificationsService.hasPermission())) {
          await notificationsService.cancelAll();
          return;
        }
        const prefs = await notificationsService.loadPrefs();
        await notificationsService.applyPrefs(
          prefs,
          userData?.name,
          status === 'active',
        );
      } catch {
        // Scheduling is best-effort; never block app startup on it.
      }
    })();
  }, [status, isLoading, userData?.name]);

  return null;
}

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
  const { token } = useAuth();
  const toastRef = useRef<UiToastRef>(null);

  const handleNotificationError = useCallback((message: string) => {
    toastRef.current?.show(message, 'error');
  }, []);

  useNotificationObserver({ onError: handleNotificationError });

  if (!token) {
    return <Redirect href="/login" />;
  }

  return (
    <WardrobeProvider>
      <CalendarProvider>
        <NotificationsReconciler />
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
      </CalendarProvider>
    </WardrobeProvider>
  );
}
