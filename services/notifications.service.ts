import { firstValueFrom } from 'rxjs';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthApiService } from '@/services/auth.service';
import { calendarService } from '@/services/calendar.service';
import { UpcomingOccasion } from '@/types/calendar';
import {
  buildMorningNotificationContent,
  buildOccasionNotificationContent,
  DEFAULT_NOTIFICATION_PREFS,
  EXPO_PUSH_TOKEN_KEY,
  NOTIFICATION_PREFS_KEY,
  NotificationPrefs,
  parseTime,
  SCHEDULE_WINDOW_DAYS,
} from '@/constants/notifications';

/** "YYYY-MM-DD" in device-local time — the bucket key for grouping occasions by day. */
function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses an occasion's ISO start. All-day events carry a date-only string
 * ("2026-09-05") with no timezone — `new Date(...)` would read that as UTC
 * midnight, which shifts to the wrong local day west of UTC. Timed events
 * carry a full offset-aware timestamp and parse correctly as-is.
 */
function parseOccasionStart(iso: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(iso);
}

function groupOccasionsByLocalDay(
  occasions: UpcomingOccasion[],
): Map<string, UpcomingOccasion[]> {
  const byDay = new Map<string, UpcomingOccasion[]>();
  for (const occasion of occasions) {
    const key = localDateKey(parseOccasionStart(occasion.start));
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.push(occasion);
    } else {
      byDay.set(key, [occasion]);
    }
  }
  return byDay;
}

/**
 * Serializes `applyPrefs` calls. Its two callers (`NotificationsSection` and
 * `NotificationsReconciler` in `app/(app)/_layout.tsx`) both fire it without
 * awaiting one another — a toggle flip and a connect/disconnect status change
 * can land within the same tick. Each call does cancel-then-schedule across
 * several awaits (an HTTP round trip, then up to `SCHEDULE_WINDOW_DAYS`
 * sequential `scheduleNotificationAsync` calls); two overlapping calls would
 * interleave those writes and could double-book a day or leave the wrong
 * mode armed. Chaining onto this queue instead makes every call wait for the
 * previous one to fully finish (success or failure) before it starts, so the
 * device schedule always ends up reflecting only the *last* call's decision.
 */
let applyQueue: Promise<unknown> = Promise.resolve();

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
   * Reports whether notification permission is currently granted, WITHOUT
   * prompting. Used on startup and when rendering the settings toggle, where
   * showing a system dialog would be wrong.
   */
  async hasPermission(): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    return current.granted;
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

  // ---- Local scheduling ----

  /**
   * Schedules the recurring daily morning notification at the given "HH:MM"
   * device-local time. Cancels any existing schedule first so repeated calls
   * (e.g. changing the time) never stack duplicates.
   */
  async scheduleDaily(time: string, name?: string | null): Promise<void> {
    await this.cancelAll();

    const { hour, minute } = parseTime(time);
    await Notifications.scheduleNotificationAsync({
      content: buildMorningNotificationContent(name),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Schedules one one-off, date-triggered notification per local day for the
   * next `SCHEDULE_WINDOW_DAYS` days, each carrying that day's occasions.
   * Cancels any existing schedule first, exactly like `scheduleDaily`, so the
   * two modes can never both be armed at once.
   *
   * A day whose fire time has already passed (always "today", when the
   * configured time is earlier than now) is skipped rather than fired
   * immediately or pushed later — every other day in the window is still in
   * the future, so no day is scheduled twice and none is silently dropped.
   */
  async scheduleOccasionWindow(
    time: string,
    occasions: UpcomingOccasion[],
    name?: string | null,
  ): Promise<void> {
    await this.cancelAll();

    const { hour, minute } = parseTime(time);
    const byDay = groupOccasionsByLocalDay(occasions);
    const now = new Date();

    for (let offset = 0; offset < SCHEDULE_WINDOW_DAYS; offset += 1) {
      const fireDate = new Date(now);
      fireDate.setDate(fireDate.getDate() + offset);
      fireDate.setHours(hour, minute, 0, 0);
      if (fireDate.getTime() <= now.getTime()) continue;

      const dayOccasions = byDay.get(localDateKey(fireDate)) ?? [];
      await Notifications.scheduleNotificationAsync({
        content: buildOccasionNotificationContent(dayOccasions, name),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
        },
      });
    }
  },

  /**
   * Single entry point for reconciling the device schedule with the stored
   * preference — schedule when enabled, cancel when not. Used by the Settings
   * UI and on app startup.
   *
   * `calendarConnected` gates the occasion-aware window: pass whether the
   * Google Calendar connection is currently `active` (not disconnected, not
   * revoked). When it's true and `includeOccasions` is on, this fetches the
   * next `SCHEDULE_WINDOW_DAYS` days of occasions and arms the rolling
   * one-off window; on anything short of a `connected` response — a
   * transport failure, or a 200 reporting `status: 'disconnected'` (Google
   * revoked access, token expired, or any upstream error — the backend
   * never throws for these, see `google-calendar.service.ts`) — it falls
   * back to the existing recurring daily schedule, unchanged.
   *
   * Calls are serialized through `applyQueue` (see its comment) so two
   * overlapping invocations can never interleave their cancel/schedule
   * writes; the last call queued always wins.
   */
  async applyPrefs(
    prefs: NotificationPrefs,
    name?: string | null,
    calendarConnected = false,
  ): Promise<void> {
    const run = async () => {
      if (!prefs.enabled) {
        await this.cancelAll();
        return;
      }

      if (prefs.includeOccasions && calendarConnected) {
        try {
          const { status, occasions } = await firstValueFrom(
            calendarService.getOccasions(SCHEDULE_WINDOW_DAYS),
          );
          if (status === 'connected') {
            await this.scheduleOccasionWindow(prefs.time, occasions, name);
            return;
          }
          // status === 'disconnected' — Google-side failure or revocation
          // reported as a normal 200. Fall through to the recurring path.
        } catch {
          // Transport-level failure (gateway unreachable, 401, 500) — fall
          // through to the recurring daily path so the user still gets a
          // reminder.
        }
      }

      await this.scheduleDaily(prefs.time, name);
    };

    const task = applyQueue.then(run);
    applyQueue = task.catch(() => {});
    return task;
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
