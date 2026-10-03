import { firstValueFrom } from 'rxjs';
import * as WebBrowser from 'expo-web-browser';
import { calendarService } from '@/services/calendar.service';
import { CALENDAR_RETURN_URL } from '@/constants/calendar';

/**
 * Device-facing Google Calendar layer (plan-12 Phase 3), mirroring
 * `notifications.service.ts`: a plain async module wrapping a Promise-based
 * Expo SDK (here `expo-web-browser`'s auth session), not RxJS Ajax. HTTP
 * calls to the backend still go through `calendarService` via `firstValueFrom`.
 */

/** Parses the `status` query param off the deep link the auth session returns. */
function parseCallbackStatus(resultUrl: string): string | null {
  const match = resultUrl.match(/[?&]status=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export interface ConnectResult {
  /** True when the user dismissed/cancelled the auth session themselves - QA-03: not an error. */
  cancelled: boolean;
  /** The callback's `status` query param ('ok' | 'denied' | 'scope_denied' | 'error'), or null. */
  callbackStatus: string | null;
}

export const googleCalendarService = {
  /**
   * Runs the full OAuth round trip: fetches the auth URL from the backend,
   * opens it in an in-app browser session, and waits for Google to redirect
   * back to `CALENDAR_RETURN_URL`.
   *
   * Does not itself refresh calendar state — the caller (CalendarContext)
   * re-fetches status/occasions afterward, since that backend round trip is
   * the source of truth regardless of what this resolves to.
   */
  async connect(): Promise<ConnectResult> {
    try {
      const { url } = await firstValueFrom(calendarService.getAuthUrl());
      const result = await WebBrowser.openAuthSessionAsync(url, CALENDAR_RETURN_URL);
      // `WebBrowser`'s own 'cancel'/'dismiss' result types are exactly a
      // user-initiated close of the auth sheet, not a failure - QA-03.
      if (result.type !== 'success') return { cancelled: true, callbackStatus: null };
      return { cancelled: false, callbackStatus: parseCallbackStatus(result.url) };
    } catch {
      return { cancelled: false, callbackStatus: null };
    }
  },

  /** Calls the disconnect endpoint; swallows failures so the UI can proceed optimistically. */
  async disconnect(): Promise<void> {
    try {
      await firstValueFrom(calendarService.disconnect());
    } catch {
      // Best-effort; a stale credential is harmless and the next status
      // fetch will reconcile.
    }
  },
};
