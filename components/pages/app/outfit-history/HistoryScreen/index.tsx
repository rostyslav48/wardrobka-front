import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { AssistantOutfitSuggestionDto } from '@/types/ai-assistant';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import OutfitSuggestionCard from '@/components/ui/OutfitSuggestionCard';
import UiSkeletonCard from '@/components/ui/UiSkeletonCard';
import UiEmptyState from '@/components/ui/UiEmptyState';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';
import { styles } from './styles';

const PAGE_SIZE = 20;

export default function HistoryScreen() {
  const { items: wardrobeItems } = useWardrobe();

  const [suggestions, setSuggestions] = useState<AssistantOutfitSuggestionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const toastRef = useRef<UiToastRef>(null);

  // Track which sessions still exist so a tap on a suggestion whose
  // originating conversation was deleted shows a toast instead of navigating
  // into a dead route.
  const [validSessionIds, setValidSessionIds] = useState<Set<string> | null>(
    null,
  );

  const fetchSessions = useCallback(() => {
    const sub = aiAssistantService.getSessions().subscribe({
      next: (sessions) => {
        setValidSessionIds(new Set(sessions.map((s) => s.id)));
      },
      error: () => {
        // Leave the set unknown (null) so navigation stays optimistic on error.
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const fetchPage = useCallback((offset: number, silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
    }

    const sub = aiAssistantService.getOutfitSuggestions(PAGE_SIZE, offset).subscribe({
      next: (page) => {
        setSuggestions((prev) => (offset === 0 ? page : [...prev, ...page]));
        setHasMore(page.length === PAGE_SIZE);
        offsetRef.current = offset + page.length;
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      },
      error: () => {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      },
    });

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribePage = fetchPage(0);
    const unsubscribeSessions = fetchSessions();
    return () => {
      unsubscribePage?.();
      unsubscribeSessions();
    };
  }, [fetchPage, fetchSessions]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasMore(true);
    offsetRef.current = 0;
    fetchPage(0, true);
    fetchSessions();
  }, [fetchPage, fetchSessions]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    fetchPage(offsetRef.current);
  }, [hasMore, isLoadingMore, isLoading, fetchPage]);

  const handleDelete = useCallback((id: string) => {
    aiAssistantService.deleteOutfitSuggestion(id).subscribe({
      next: () => {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
        offsetRef.current = Math.max(0, offsetRef.current - 1);
      },
      error: () => {
        toastRef.current?.show(
          'Failed to remove the suggestion. Please try again.',
          'error',
        );
      },
    });
  }, []);

  const handleOpenSession = useCallback(
    (sessionId: string) => {
      // Only block navigation when we positively know the session is gone;
      // if the sessions list hasn't loaded yet, stay optimistic.
      if (validSessionIds && !validSessionIds.has(sessionId)) {
        toastRef.current?.show('This conversation is no longer available', 'error');
        return;
      }
      router.push(`/chat/${sessionId}`);
    },
    [validSessionIds],
  );

  const resolveThumbnails = (wardrobeItemIds: number[]) =>
    wardrobeItemIds.map(
      (id) => wardrobeItems.find((item) => item.id === id)?.img_url ?? null,
    );

  const resolveItemNames = (wardrobeItemIds: number[]) =>
    wardrobeItemIds.map(
      (id) => wardrobeItems.find((item) => item.id === id)?.name ?? null,
    );

  return (
    <>
      <UiPage
        header={
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <IconSymbol name="chevron.left" size={iconSize.xl} color={colors.textPrimary} />
            </Pressable>
            <UiTitle style={styles.title} numberOfLines={1}>
              Outfit History
            </UiTitle>
            <View style={styles.headerSpacer} />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        onEndReached={handleLoadMore}
        contentStyle={styles.content}
      >
        {isLoading ? (
          <View style={styles.list}>
            <UiSkeletonCard />
            <UiSkeletonCard />
            <UiSkeletonCard />
          </View>
        ) : suggestions.length === 0 ? (
          <UiEmptyState
            icon="sparkles"
            title="No outfit suggestions yet"
            subtitle="Try asking the assistant for outfit ideas in the chat."
            actionLabel="+ Ask for an outfit"
            onAction={() => router.push('/chat/new')}
          />
        ) : (
          <View style={styles.list}>
            {suggestions.map((item) => (
              <OutfitSuggestionCard
                key={item.id}
                suggestion={item}
                thumbnails={resolveThumbnails(item.wardrobeItemIds)}
                itemNames={resolveItemNames(item.wardrobeItemIds)}
                onPress={() => handleOpenSession(item.sessionId)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </View>
        )}

        {isLoadingMore ? (
          <ActivityIndicator color={colors.textSecondary} style={styles.loadingMore} />
        ) : null}
      </UiPage>

      <UiToast ref={toastRef} />
    </>
  );
}
