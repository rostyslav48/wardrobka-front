import { View } from 'react-native';
import { router } from 'expo-router';
import { WardrobeItem } from '@/types/wardrobe';
import UiEmptyState from '@/components/ui/UiEmptyState';
import UiInlineError from '@/components/ui/UiInlineError';
import ItemCard from '@/components/pages/app/items/ItemCard';
import ItemSkeleton from '@/components/pages/app/items/ItemSkeleton';
import { styles } from './styles';

interface Props {
  /** Visible items after client-side search - what actually renders in the grid. */
  items: WardrobeItem[];
  /**
   * Count of what `WardrobeContext` actually fetched (server-filtered, but
   * *not* narrowed by the client-side search box) - QA-41 review fix. Loading
   * and error states must be judged against this, not `items.length`: if a
   * client-side search matches nothing, `items` is empty even though the
   * fetch itself succeeded and has data, and a stale/failed refetch must not
   * be reported as "couldn't load" when it's really the user's own search
   * that emptied the grid.
   */
  totalLoaded: number;
  isLoading: boolean;
  /** Set by `WardrobeContext` when the fetch itself failed - QA-53/62. */
  error?: string | null;
  onRetry?: () => void;
  /** True when a search query or filter chip is narrowing `items`. */
  hasActiveSearchOrFilters?: boolean;
  onClearSearchAndFilters?: () => void;
}

function chunk<T>(list: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

// `ItemsScreen` renders this inside `UiPage`'s own scroll view, so the grid is
// a plain View + `.map()` rather than a `FlatList` - a second, nested
// virtualized list inside a ScrollView is invalid RN. `OutfitSuggestionCard`'s
// list on Home already sets this precedent.
export default function ItemsGrid({
  items,
  totalLoaded,
  isLoading,
  error,
  onRetry,
  hasActiveSearchOrFilters = false,
  onClearSearchAndFilters,
}: Props) {
  // Only the very first load shows skeletons: a background poll flips
  // isLoading too, and swapping the grid for skeletons every few seconds
  // would hide the images the poll exists to reveal. Judged against
  // `totalLoaded`, not `items.length` - a client-side search narrowing
  // `items` to zero must not re-trigger the skeleton.
  if (isLoading && totalLoaded === 0) {
    return (
      <View style={styles.grid} testID="items-loading-skeleton">
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <ItemSkeleton />
            <ItemSkeleton />
          </View>
        ))}
      </View>
    );
  }

  // QA-53/62: a failed fetch on an otherwise-empty wardrobe used to render
  // the same "your wardrobe is empty" copy as a genuinely empty one - the
  // user had no way to tell a real fetch failure from having no items.
  // Same `totalLoaded` reasoning as above: a search matching nothing is not
  // a fetch failure, even while `error` still holds a stale/failed refetch.
  if (error && totalLoaded === 0) {
    return (
      <UiEmptyState
        testID="items-error-state"
        icon="exclamationmark.triangle.fill"
        title="Couldn't load your wardrobe"
        subtitle="Check your connection and try again."
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (items.length === 0 && hasActiveSearchOrFilters) {
    return (
      <UiEmptyState
        testID="items-no-match-state"
        icon="magnifyingglass"
        title="No items match these filters"
        subtitle="Try a different search or clear your filters to see the rest of your wardrobe."
        actionLabel="Clear filters"
        onAction={onClearSearchAndFilters}
      />
    );
  }

  if (items.length === 0) {
    return (
      <UiEmptyState
        testID="items-empty-state"
        icon="tshirt.fill"
        title="Your wardrobe is empty"
        subtitle="Add a few pieces and the assistant can start putting outfits together."
        actionLabel="+ Add your first item"
        onAction={() => router.push('/item/new')}
      />
    );
  }

  // QA-53/62: items already loaded, but the latest refetch failed - keep the
  // list the user can still read and tell them the refresh failed instead of
  // silently discarding it or replacing it with a full-page error state.
  return (
    <View style={styles.grid}>
      {error ? (
        <UiInlineError
          testID="items-error-banner"
          message="Couldn't refresh your wardrobe."
          onRetry={onRetry}
        />
      ) : null}
      {chunk(items, 2).map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((item) => (
            <View key={item.id} style={styles.cell}>
              <ItemCard item={item} />
            </View>
          ))}
          {row.length === 1 ? <View style={styles.cell} /> : null}
        </View>
      ))}
    </View>
  );
}
