import { UpcomingOccasion } from '@/types/calendar';

/**
 * Deep link Google's in-app browser session returns the app to once the OAuth
 * flow completes. Must match the backend's GOOGLE_OAUTH_APP_REDIRECT
 * (apps/ai-assistant/.env.example) — both ends hardcode the same URL rather
 * than negotiate it, since the callback redirect happens outside any
 * authenticated request.
 */
export const CALENDAR_RETURN_URL = 'wardrobeassistantfront://calendar-connected';

/** Default lookahead window used when Home asks for upcoming occasions. */
export const CALENDAR_OCCASIONS_DAYS_AHEAD = 2;

function formatOccasionTime(occasion: UpcomingOccasion): string {
  if (occasion.allDay) return 'all day';
  return new Date(occasion.start).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Builds the chat prompt an occasion card on Home routes into. */
export function buildOccasionPrompt(occasion: UpcomingOccasion): string {
  const time = formatOccasionTime(occasion);
  const location = occasion.location ? ` at ${occasion.location}` : '';
  return `What should I wear for "${occasion.title}" (${time}${location})?`;
}
