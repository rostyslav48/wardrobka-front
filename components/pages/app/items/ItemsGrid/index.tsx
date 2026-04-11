import { FlatList, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { WardrobeItem } from '@/types/wardrobe';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import ItemCard from '@/components/pages/app/items/ItemCard';
import ItemSkeleton from '@/components/pages/app/items/ItemSkeleton';
import { styles } from './styles';

interface Props {
  items: WardrobeItem[];
  isLoading: boolean;
  ListHeaderComponent: React.ReactElement;
}

function SkeletonGrid() {
  const rows = Array.from({ length: 3 });
  return (
    <View style={styles.skeletonContainer}>
      {rows.map((_, i) => (
        <View key={i} style={styles.skeletonRow}>
          <ItemSkeleton />
          <ItemSkeleton />
        </View>
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <IconSymbol name="tshirt.fill" size={64} color={colors.border} />
      <Text style={styles.emptyText}>Your wardrobe is empty</Text>
      <Pressable onPress={() => router.push('/item/new')}>
        <Text style={[styles.emptySubtext, { color: colors.textPrimary }]}>
          + Add your first item
        </Text>
      </Pressable>
    </View>
  );
}

export default function ItemsGrid({ items, isLoading, ListHeaderComponent }: Props) {
  if (isLoading) {
    return (
      <View style={styles.list}>
        {ListHeaderComponent}
        <SkeletonGrid />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyState />}
      renderItem={({ item }) => <ItemCard item={item} />}
    />
  );
}
