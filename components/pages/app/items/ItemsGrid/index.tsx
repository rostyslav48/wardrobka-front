import { View } from 'react-native';
import { router } from 'expo-router';
import { WardrobeItem } from '@/types/wardrobe';
import UiEmptyState from '@/components/ui/UiEmptyState';
import ItemCard from '@/components/pages/app/items/ItemCard';
import ItemSkeleton from '@/components/pages/app/items/ItemSkeleton';
import { usePendingImagePolling } from '@/components/pages/app/items/usePendingImagePolling';
import { styles } from './styles';

interface Props {
  items: WardrobeItem[];
  isLoading: boolean;
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
export default function ItemsGrid({ items, isLoading }: Props) {
  usePendingImagePolling(items);

  // Only the very first load shows skeletons: a background poll flips
  // isLoading too, and swapping the grid for skeletons every few seconds
  // would hide the images the poll exists to reveal.
  if (isLoading && items.length === 0) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <ItemSkeleton />
            <ItemSkeleton />
          </View>
        ))}
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <UiEmptyState
        icon="tshirt.fill"
        title="Your wardrobe is empty"
        subtitle="Add a few pieces and the assistant can start putting outfits together."
        actionLabel="+ Add your first item"
        onAction={() => router.push('/item/new')}
      />
    );
  }

  return (
    <View style={styles.grid}>
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
