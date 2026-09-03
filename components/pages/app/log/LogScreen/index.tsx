import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { OutfitLog } from '@/types/outfit-log';
import { outfitLogService } from '@/services/outfit-log.service';
import { useWardrobe } from '@/context/WardrobeContext';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import LogEntryCard from '@/components/pages/app/log/LogEntryCard';
import LogEntrySkeleton from '@/components/pages/app/log/LogEntrySkeleton';
import LogEntrySheet from '@/components/pages/app/log/LogEntrySheet';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiEmptyState from '@/components/ui/UiEmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

export default function LogScreen() {
  const {
    items: wardrobeItems,
    isLoading: isLoadingItems,
    refresh: refreshWardrobe,
  } = useWardrobe();

  const [entries, setEntries] = useState<OutfitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // undefined = sheet closed, null = add mode, OutfitLog = edit mode
  const [sheetEntry, setSheetEntry] = useState<OutfitLog | null | undefined>(
    undefined,
  );

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
    return () => sub.unsubscribe();
  }, [fetchEntries]);

  useEffect(() => {
    if (wardrobeItems.length === 0 && !isLoadingItems) {
      refreshWardrobe();
    }
  }, [wardrobeItems.length, isLoadingItems, refreshWardrobe]);

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
    <View style={styles.root} testID="log-screen">
      <UiPage
        tabBarInset
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
      >
        {/* Spec 6.5: "Outfit Log" 28/400 left, "Add entry" pill right - the
            same title-row shape as Items/Chat. */}
        <View style={styles.header}>
          <UiTitle sizeL>Outfit Log</UiTitle>
          <Pressable style={styles.addButton} onPress={handleOpenAdd} hitSlop={8}>
            <IconSymbol name="plus" size={iconSize.sm} color={colors.accentText} />
            <Text style={styles.addButtonText}>Add entry</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.list}>
            <LogEntrySkeleton />
            <LogEntrySkeleton />
            <LogEntrySkeleton />
          </View>
        ) : entries.length === 0 ? (
          <UiEmptyState
            icon="calendar"
            title="Nothing logged yet"
            subtitle="Log what you wore and the outfit history builds itself."
            actionLabel="+ Add entry"
            onAction={handleOpenAdd}
          />
        ) : (
          <View style={styles.list}>
            {entries.map((entry) => (
              <LogEntryCard
                key={entry.id}
                entry={entry}
                wardrobeItems={wardrobeItems}
                onPress={() => handleOpenEdit(entry)}
              />
            ))}
          </View>
        )}
      </UiPage>

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
