import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { aiAssistantService } from '@/services/ai-assistant.service';
import {
  MORNING_NOTIFICATION_ACTION,
  MORNING_PROMPT,
} from '@/constants/notifications';

interface Options {
  /** Called when the chat session can't be created (e.g. offline). */
  onError?: (message: string) => void;
}

/**
 * Handles taps on the morning notification (plan-08 Phase 4).
 *
 * `useLastNotificationResponse` covers every entry path in one place — a tap
 * while the app is foregrounded or backgrounded, and a cold launch from the
 * notification — so no separate startup branch is needed.
 */
export function useNotificationObserver({ onError }: Options = {}) {
  // expo-notifications has no web implementation for this API (BUG-F03) —
  // Platform.OS is static for the lifetime of the app, so this conditional
  // hook call is stable across renders.
  const response =
    Platform.OS === 'web' ? null : Notifications.useLastNotificationResponse();

  // Held in a ref so an inline callback from the caller doesn't re-run the
  // effect and re-trigger navigation.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!response) return;
    // Ignore custom action buttons — only a plain tap should open the chat.
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const request = response.notification.request;
    if (handledIdRef.current === request.identifier) return;

    const data = request.content.data as
      | { action?: string; prompt?: string }
      | undefined;
    if (data?.action !== MORNING_NOTIFICATION_ACTION) return;

    handledIdRef.current = request.identifier;
    // Stop the same response being replayed on remount.
    Notifications.clearLastNotificationResponse();

    const sub = aiAssistantService
      .chat({ prompt: data.prompt ?? MORNING_PROMPT })
      .subscribe({
        next: ({ sessionId }) => router.push(`/chat/${sessionId}`),
        error: () =>
          // Stay put (home on a cold launch) rather than crashing.
          onErrorRef.current?.('Could not start a chat. Please try again.'),
      });

    return () => sub.unsubscribe();
  }, [response]);
}
