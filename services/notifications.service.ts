import { firstValueFrom } from 'rxjs';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthApiService } from '@/services/auth.service';
import {
  DEFAULT_NOTIFICATION_PREFS,
  EXPO_PUSH_TOKEN_KEY,
  NOTIFICATION_PREFS_KEY,
  NotificationPrefs,
} from '@/constants/notifications';

/**
 * Device-facing notification layer (plan-08). Unlike the HTTP services this is
 * a plain async module — it wraps Promise-based `expo-notifications` APIs and
 * device storage, not RxJS Ajax.
 *
 * This file currently covers the TOKEN infrastructure only: request permission,
 * retrieve the Expo push token, persist it locally, and register it with the
 * backend for future server-side sending. Scheduling / deep-link handling land
 * with the rest of plan-08.
 */

function resolveProjectId(): string | undefined {
  // Populated by `eas init` (or a manual entry) under expo.extra.eas.projectId.
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    // Fallback for classic manifests / bare workflow.
    Constants.easConfig?.projectId
  );
}

export const notificationsService = {
  /**
   * Requests notification permission if it hasn't been decided yet.
   * Never re-prompts once the user has explicitly denied — the caller should
   * link to system settings instead. Returns whether permission is granted.
   */
  async requestPermissions(): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    // `canAskAgain === false` means the user denied and iOS/Android won't show
    // the dialog again; asking would be a silent no-op.
    if (!current.canAskAgain) return false;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },

  /**
   * Retrieves the Expo push token. Best-effort: returns null (without throwing)
   * on simulators, when no EAS projectId is configured, or on any SDK error, so
   * enabling notifications / local scheduling is never blocked by token issues.
   */
  async getPushToken(): Promise<string | null> {
    if (!Device.isDevice) return null;

    const projectId = resolveProjectId();
    if (!projectId) {
      // No EAS project configured yet — a real token can't be minted.
      // See the setup note; local notifications still work without this.
      return null;
    }

    try {
      const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Full token round-trip: fetch the token, cache it locally, and register it
   * with the backend. Safe to call repeatedly. Returns the token, or null if
   * one couldn't be obtained. Backend failures are swallowed (the token stays
   * cached and can be retried) so the UI flow isn't blocked.
   */
  async syncPushToken(): Promise<string | null> {
    const token = await this.getPushToken();
    if (!token) return null;

    await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);

    try {
      await firstValueFrom(AuthApiService.registerPushToken(token));
    } catch {
      // Leave the cached token in place; a later sync (or app start) retries.
    }

    return token;
  },

  /**
   * Clears the token locally and on the backend — call on sign-out or when the
   * user disables notifications, so stale tokens aren't targeted later.
   */
  async clearPushToken(): Promise<void> {
    await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
    try {
      await firstValueFrom(AuthApiService.registerPushToken(null));
    } catch {
      // Best-effort; nothing to do if the backend is unreachable.
    }
  },

  async getStoredPushToken(): Promise<string | null> {
    return AsyncStorage.getItem(EXPO_PUSH_TOKEN_KEY);
  },

  // ---- Preference persistence (device-local, used by the Settings UI later) ----

  async loadPrefs(): Promise<NotificationPrefs> {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    try {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_NOTIFICATION_PREFS;
    }
  },

  async savePrefs(prefs: NotificationPrefs): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  },
};
