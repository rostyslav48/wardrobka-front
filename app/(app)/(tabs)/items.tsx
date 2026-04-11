import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { useModal } from '@/context/ModalContext';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import SearchBar from '@/components/pages/app/items/SearchBar';
import FiltersPopup from '@/components/pages/app/items/FiltersPopup';
import ItemsGrid from '@/components/pages/app/items/ItemsGrid';

export default function Items() {
  const tabBarHeight = useBottomTabBarHeight();
  const { show } = useModal();
  const { items, isLoading, activeFiltersCount } = useWardrobe();

  const openFiltersModal = () => {
    show({ content: <FiltersPopup /> });
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrapper}>
          <SearchBar />
        </View>
        <Pressable style={styles.filterButton} onPress={openFiltersModal}>
          <IconSymbol name="line.3.horizontal.decrease" size={22} color={colors.textPrimary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ItemsGrid items={items} isLoading={isLoading} ListHeaderComponent={header} />

      <Pressable
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
        onPress={() => router.push('/item/new')}
      >
        <IconSymbol name="plus" size={28} color={colors.accentText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    gap: 10,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.statusMissing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
