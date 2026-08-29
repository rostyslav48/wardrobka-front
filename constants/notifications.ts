// Central config for the push/local notification feature (plan-08).
// Kept in one place so the settings UI, scheduler, and deep-link handler
// all agree on keys, defaults, and copy.

/** AsyncStorage key for the user's notification preference. */
export const NOTIFICATION_PREFS_KEY = 'wardropka_notifications';

/** AsyncStorage key for the cached Expo push token. */
export const EXPO_PUSH_TOKEN_KEY = 'wardropka_expo_push_token';

/** Default daily notification time (device-local), HH:MM. */
export const DEFAULT_NOTIFICATION_TIME = '07:30';

/** Deep-link prompt pre-filled into the AI chat when the notification is tapped. */
export const MORNING_PROMPT = 'What should I wear today?';

/** Notification data payload — read by the response listener to route the tap. */
export const MORNING_NOTIFICATION_ACTION = 'open_chat';

export interface NotificationPrefs {
  enabled: boolean;
  /** HH:MM, device-local time. */
  time: string;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: true,
  time: DEFAULT_NOTIFICATION_TIME,
};

/** Parses an "HH:MM" preference string into schedulable components. */
export function parseTime(time: string): { hour: number; minute: number } {
  const [rawHour, rawMinute] = time.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return parseTime(DEFAULT_NOTIFICATION_TIME);
  }
  return { hour, minute };
}

/** Formats schedulable components back into an "HH:MM" preference string. */
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Builds the morning notification content; name comes from AuthContext. */
export function buildMorningNotificationContent(name?: string | null) {
  return {
    title: name ? `Good morning, ${name}! 👕` : 'Good morning! 👕',
    body: 'Ready to plan your outfit for today?',
    data: {
      action: MORNING_NOTIFICATION_ACTION,
      prompt: MORNING_PROMPT,
    },
  };
}
