import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useWardrobe } from '@/context/WardrobeContext';
import { ImageStatus, WardrobeItem } from '@/types/wardrobe';

/**
 * How often the list is refetched while a product image is still generating.
 * A generation takes roughly 10–30s, so this is short enough that the finished
 * image appears while the user is still looking at the grid.
 */
export const PENDING_IMAGE_POLL_INTERVAL_MS = 4000;

/**
 * Reveals product images finished by the async generator: refetches whenever
 * the screen regains focus, and polls while at least one item is `pending`.
 *
 * The poll stops the moment nothing is pending — an idle wardrobe issues no
 * requests at all.
 */
export function usePendingImagePolling(items: WardrobeItem[]): void {
  const { refresh } = useWardrobe();

  // `refresh` is rebuilt on every WardrobeProvider render, so depending on it
  // directly would tear down and rebuild the interval before it ever fires
  // (and would turn the focus effect into a refetch loop).
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const hasPending = items.some(
    (item) => item.image_status === ImageStatus.Pending,
  );

  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, []),
  );

  useEffect(() => {
    if (!hasPending) return;

    const interval = setInterval(
      () => refreshRef.current(),
      PENDING_IMAGE_POLL_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [hasPending]);
}
