import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useModal } from '@/context/ModalContext';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { iconSize, spacing } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import FiltersPopup from '@/components/pages/app/items/FiltersPopup';
import ItemsGrid from '@/components/pages/app/items/ItemsGrid';
import SearchBar from '@/components/pages/app/items/SearchBar';
import { SEASON_OPTIONS, STATUS_OPTIONS, SWATCHES } from '@/components/pages/app/items/itemForm';
import { WardrobeFilters } from '@/types/wardrobe';
import { styles } from './styles';

// Spec 6.3's applied-filter chip row. Only the fields `FiltersPopup` actually
// writes are represented here - `WardrobeFilters` carries more (brand,
// material, fit_type, size) that no UI sets yet.
type FilterField = 'type' | 'season' | 'status' | 'color' | 'favourite';

const FILTER_FIELDS: FilterField[] = ['type', 'season', 'status', 'color', 'favourite'];

function chipLabel(field: FilterField, filters: WardrobeFilters): string | null {
  switch (field) {
    case 'type':
      return filters.type ?? null;
    case 'season':
      return SEASON_OPTIONS.find((o) => o.value === filters.season)?.label ?? null;
    case 'status':
      return STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? null;
    case 'color':
      return filters.color
        ? SWATCHES.find((s) => s.hex === filters.color)?.label ?? filters.color
        : null;
    case 'favourite':
      return filters.favourite ? 'Favourites only' : null;
  }
}

export default function ItemsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { show } = useModal();
  const { items, isLoading, activeFiltersCount, filters, applyFilters, clearFilters } =
    useWardrobe();

  const openFiltersModal = () => {
    show({
      content: (
        <FiltersPopup
          initialFilters={filters}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      ),
    });
  };

  const appliedChips = FILTER_FIELDS.map((field) => ({
    field,
    label: chipLabel(field, filters),
  })).filter((c): c is { field: FilterField; label: string } => c.label !== null);

  const removeChip = (field: FilterField) => applyFilters({ ...filters, [field]: undefined });

  return (
    <View style={styles.root} testID="items-screen">
      <UiPage tabBarInset>
        {/* Spec 6.3: "Wardrobe" 28/400 Newsreader left, "N ITEMS" right. */}
        <View style={styles.titleRow}>
          <UiTitle sizeL>Wardrobe</UiTitle>
          <UiTitle style={styles.itemCount}>{items.length} ITEMS</UiTitle>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBarWrapper}>
            <SearchBar />
          </View>
          <Pressable style={styles.filterButton} onPress={openFiltersModal}>
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={iconSize.mdPlus}
              color={colors.textPrimary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {appliedChips.length > 0 ? (
          <View style={styles.appliedRow}>
            {appliedChips.map(({ field, label }) => (
              <Pressable key={field} style={styles.appliedChip} onPress={() => removeChip(field)}>
                <Text style={styles.appliedChipText}>{label}</Text>
                <IconSymbol name="xmark" size={iconSize.xxs} color={colors.textSecondary} />
              </Pressable>
            ))}
            <Pressable onPress={clearFilters} hitSlop={8}>
              <UiTitle style={styles.clearAll}>CLEAR ALL</UiTitle>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.grid}>
          <ItemsGrid items={items} isLoading={isLoading} />
        </View>
      </UiPage>

      <Pressable
        style={[styles.fab, { bottom: tabBarHeight + spacing.gutter }]}
        onPress={() => router.push('/item/new')}
      >
        <IconSymbol name="plus" size={iconSize.xl} color={colors.accentText} />
      </Pressable>
    </View>
  );
}
