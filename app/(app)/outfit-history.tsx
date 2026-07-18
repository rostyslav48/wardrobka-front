import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AssistantOutfitSuggestionDto } from '@/types/ai-assistant';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import OutfitSuggestionCard from '@/components/ui/OutfitSuggestionCard';
import SuggestionSkeleton from '@/components/pages/app/home/SuggestionSkeleton';
import HistoryEmptyState from '@/components/pages/app/outfit-history/HistoryEmptyState';
import UiTitle from '@/components/ui/UiTitle';

const PAGE_SIZE = 20;

export default function OutfitHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { items: wardrobeItems } = useWardrobe();

  const [suggestions, setSuggestions] = useState<AssistantOutfitSuggestionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(
    (offset: number, silent = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!silent) {
        if (offset === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
      }

      const sub = aiAssistantService
        .getOutfitSuggestions(PAGE_SIZE, offset)
        .subscribe({
          next: (page) => {
            setSuggestions((prev) =>
              offset === 0 ? page : [...prev, ...page],
            );
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
    },
    [],
  );

  useEffect(() => {
    return fetchPage(0);
  }, [fetchPage]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setHasMore(true);
    offsetRef.current = 0;
    fetchPage(0, true);
  }, [fetchPage]);

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
        Alert.alert('Error', 'Failed to remove the suggestion. Please try again.');
      },
    });
  }, []);

  const resolveThumbnails = (wardrobeItemIds: number[]) =>
    wardrobeItemIds.map(
      (id) => wardrobeItems.find((item) => item.id === id)?.img_url ?? null,
    );

  const resolveItemNames = (wardrobeItemIds: number[]) =>
    wardrobeItemIds.map(
      (id) => wardrobeItems.find((item) => item.id === id)?.name ?? null,
    );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <UiTitle>Outfit History</UiTitle>
        </View>
        <View style={styles.skeletonList}>
          <SuggestionSkeleton />
          <SuggestionSkeleton />
          <SuggestionSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <UiTitle>Outfit History</UiTitle>
      </View>

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OutfitSuggestionCard
            suggestion={item}
            thumbnails={resolveThumbnails(item.wardrobeItemIds)}
            itemNames={resolveItemNames(item.wardrobeItemIds)}
            onPress={() => router.push(`/chat/${item.sessionId}`)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          suggestions.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={<HistoryEmptyState />}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              color={colors.textSecondary}
              style={styles.loadingMore}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: 8,
    paddingTop: 8,
  },
  skeletonList: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 4,
  },
  listContent: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 4,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingMore: {
    paddingVertical: 16,
  },
});
