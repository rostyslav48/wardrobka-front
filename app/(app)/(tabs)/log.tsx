import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OutfitLog } from '@/types/outfit-log';
import { outfitLogService } from '@/services/outfit-log.service';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import LogEntryCard from '@/components/pages/app/log/LogEntryCard';
import LogEntrySkeleton from '@/components/pages/app/log/LogEntrySkeleton';
import LogEmptyState from '@/components/pages/app/log/LogEmptyState';
import LogEntrySheet from '@/components/pages/app/log/LogEntrySheet';

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { items: wardrobeItems, isLoading: isLoadingItems, refresh: refreshWardrobe } = useWardrobe();

  const [entries, setEntries] = useState<OutfitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // undefined = sheet closed, null = add mode, OutfitLog = edit mode
  const [sheetEntry, setSheetEntry] = useState<OutfitLog | null | undefined>(undefined);

  const fetchEntries = useCallback((silent = false) => {
    if (!silent) setIsLoading(true);
    return outfitLogService.getAll().subscribe({
      next: (data) => {
        setEntries(data);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      error: () => {
        setIsLoading(false);
        setIsRefreshing(false);
      },
    });
  }, []);

  useEffect(() => {
    const sub = fetchEntries();
    if (wardrobeItems.length === 0 && !isLoadingItems) {
      refreshWardrobe();
    }
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchEntries(true);
  }, [fetchEntries]);

  const handleOpenAdd = () => setSheetEntry(null);
  const handleOpenEdit = (entry: OutfitLog) => setSheetEntry(entry);

  const handleSheetClose = () => setSheetEntry(undefined);

  const handleSave = (saved: OutfitLog) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id);
      if (idx === -1) {
        return [saved, ...prev];
      }
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
    setSheetEntry(undefined);
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSheetEntry(undefined);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Outfit Log</Text>
        <Pressable style={styles.addButton} onPress={handleOpenAdd} hitSlop={8}>
          <MaterialIcons name="add" size={22} color={colors.accentText} />
          <Text style={styles.addButtonText}>Add entry</Text>
        </Pressable>
      </View>

      {/* List */}
      {isLoading ? (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 20 }]}>
          <LogEntrySkeleton />
          <LogEntrySkeleton />
          <LogEntrySkeleton />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            entries.length === 0 && styles.listContentCentered,
            { paddingBottom: tabBarHeight + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.textSecondary}
            />
          }
        >
          {entries.length === 0 ? (
            <LogEmptyState onAdd={handleOpenAdd} />
          ) : (
            entries.map((entry) => (
              <LogEntryCard
                key={entry.id}
                entry={entry}
                wardrobeItems={wardrobeItems}
                onPress={() => handleOpenEdit(entry)}
              />
            ))
          )}
        </ScrollView>
      )}

      <LogEntrySheet
        entry={sheetEntry}
        wardrobeItems={wardrobeItems}
        isLoadingItems={isLoadingItems}
        onClose={handleSheetClose}
        onSave={handleSave}
        onDelete={handleDelete}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pageInlineIntent,
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentText,
  },
  listContent: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 4,
  },
  listContentCentered: {
    flexGrow: 1,
  },
});
