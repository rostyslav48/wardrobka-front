// Central config for the push/local notification feature (plan-08, extended
// by plan-12 phase 5 for occasion-aware content).
// Kept in one place so the settings UI, scheduler, and deep-link handler
// all agree on keys, defaults, and copy.
import { UpcomingOccasion } from '@/types/calendar';

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

/**
 * Size of the occasion-aware rolling window: one one-off notification per
 * local day, covering today plus the next six. A user who never reopens the
 * app within that window stops getting reminders until they do — there is no
 * server-side scheduler backing this, only device-local one-off triggers, so
 * that lapse is accepted rather than worked around (see notifications.service.ts).
 */
export const SCHEDULE_WINDOW_DAYS = 7;

export interface NotificationPrefs {
  enabled: boolean;
  /** HH:MM, device-local time. */
  time: string;
  /** Mention today's calendar occasions in the reminder body, when available. */
  includeOccasions: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: true,
  time: DEFAULT_NOTIFICATION_TIME,
  includeOccasions: true,
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

const NO_OCCASIONS_BODY = 'Ready to plan your outfit for today?';

function morningTitle(name?: string | null): string {
  return name ? `Good morning, ${name}! 👕` : 'Good morning! 👕';
}

/** Builds the morning notification content; name comes from AuthContext. */
export function buildMorningNotificationContent(name?: string | null) {
  return {
    title: morningTitle(name),
    body: NO_OCCASIONS_BODY,
    data: {
      action: MORNING_NOTIFICATION_ACTION,
      prompt: MORNING_PROMPT,
    },
  };
}

function occasionTime(occasion: UpcomingOccasion): string {
  if (occasion.allDay) return 'All day';
  const date = new Date(occasion.start);
  return formatTime(date.getHours(), date.getMinutes());
}

/**
 * Body copy for one day of the occasion-aware window. Two or more events show
 * the first two ("HH:MM Title, HH:MM Title"), then a "+N more" tail; a single
 * event reads as a sentence; no events falls back to the existing daily copy.
 */
function buildOccasionBody(occasions: UpcomingOccasion[]): string {
  if (occasions.length === 0) {
    return NO_OCCASIONS_BODY;
  }
  if (occasions.length === 1) {
    const [only] = occasions;
    return `${only.title} at ${occasionTime(only)} — want an outfit?`;
  }

  const [first, second, ...rest] = occasions;
  const shown = [first, second]
    .map((occasion) => `${occasionTime(occasion)} ${occasion.title}`)
    .join(', ');
  const more = rest.length > 0 ? `, +${rest.length} more` : '';
  return `${shown}${more} — want an outfit for today?`;
}

/** Chat prompt seeded from the day's occasions, carried in `data.prompt`. */
function buildOccasionDayPrompt(occasions: UpcomingOccasion[]): string {
  if (occasions.length === 0) return MORNING_PROMPT;
  if (occasions.length === 1) {
    return `What should I wear for "${occasions[0].title}" today?`;
  }
  const titles = occasions.map((occasion) => `"${occasion.title}"`).join(', ');
  return `What should I wear today? On my calendar: ${titles}.`;
}

/** Builds one day's notification content for the occasion-aware window. */
export function buildOccasionNotificationContent(
  occasions: UpcomingOccasion[],
  name?: string | null,
) {
  return {
    title: morningTitle(name),
    body: buildOccasionBody(occasions),
    data: {
      action: MORNING_NOTIFICATION_ACTION,
      prompt: buildOccasionDayPrompt(occasions),
    },
  };
}
