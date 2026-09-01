import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { ApiError } from '@/services/http.service';
import {
  IMAGE_ORIGINAL_EXPIRED_CODE,
  WardrobeItem,
} from '@/types/wardrobe';

interface RetryHandlers {
  /**
   * Called when the original photo is gone and the user has to supply a new
   * one. Every caller has a different way to ask for it — the grid can only
   * point at the item, the detail screen can open the picker — so the copy is
   * shared here and the action is not.
   */
  onOriginalExpired: () => void;

  /** Called with the item once it is back to `pending`. */
  onQueued?: (item: WardrobeItem) => void;
}

function errorCode(error: ApiError): string | undefined {
  const body = error?.response as { code?: string } | undefined;
  return body?.code;
}

/**
 * Runs "Generate again" and turns the three answers it can get into something
 * the user can act on: the item goes back to `pending` (and the grid's poll
 * picks the finished image up), the original has expired and a new photo is
 * needed, or the rate limit refused it.
 */
export function useRetryImageGeneration(): {
  isRetrying: boolean;
  originalExpired: boolean;
  retry: (item: WardrobeItem, handlers: RetryHandlers) => void;
} {
  const { upsertItem, refresh } = useWardrobe();
  const [isRetrying, setIsRetrying] = useState(false);
  // Rendered, not only announced: `Alert` is a no-op under react-native-web,
  // so a prompt on its own would make the expired case look like a button
  // that does nothing.
  const [originalExpired, setOriginalExpired] = useState(false);

  const retry = useCallback(
    (item: WardrobeItem, handlers: RetryHandlers) => {
      if (isRetrying) return;
      setIsRetrying(true);
      setOriginalExpired(false);

      wardrobeService.retryImageGeneration(item.id).subscribe({
        next: (updated) => {
          setIsRetrying(false);
          upsertItem(updated);
          handlers.onQueued?.(updated);
        },
        error: (error: ApiError) => {
          setIsRetrying(false);

          if (errorCode(error) === IMAGE_ORIGINAL_EXPIRED_CODE) {
            setOriginalExpired(true);
            handlers.onOriginalExpired();
            return;
          }

          if (errorCode(error) === 'IMAGE_ALREADY_PENDING') {
            // Someone (another device, or a double tap) already restarted it.
            refresh();
            return;
          }

          if (error?.status === 429) {
            Alert.alert(
              'Slow down a moment',
              'That was a bit quick — wait a few seconds and try again.',
            );
            return;
          }

          Alert.alert(
            'Could not start generation',
            'Something went wrong. Please try again.',
          );
        },
      });
    },
    [isRetrying, refresh, upsertItem],
  );

  return { isRetrying, originalExpired, retry };
}

/** Shared copy for the "your original is gone" case. */
export const ORIGINAL_EXPIRED_TITLE = 'Photo no longer available';
export const ORIGINAL_EXPIRED_MESSAGE =
  'The photo this item was created from has expired, so there is nothing to ' +
  'generate from. Pick the photo again to try once more.';
