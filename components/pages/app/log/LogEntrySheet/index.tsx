import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OutfitLog, OutfitLogPayload } from '@/types/outfit-log';
import { WardrobeItem } from '@/types/wardrobe';
import { outfitLogService } from '@/services/outfit-log.service';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ItemPickerSheet from '@/components/ui/ItemPickerSheet';
import { colors } from '@/theme/colors';
import { styles } from './styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function toUnixSeconds(date: Date): number {
  const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(midnight.getTime() / 1000);
}

function fromUnixSeconds(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  // undefined = closed, null = add mode, OutfitLog = edit mode
  entry: OutfitLog | null | undefined;
  wardrobeItems: WardrobeItem[];
  isLoadingItems: boolean;
  onClose: () => void;
  onSave: (entry: OutfitLog) => void;
  onDelete: (id: string) => void;
}

export default function LogEntrySheet({
  entry,
  wardrobeItems,
  isLoadingItems,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const isVisible = entry !== undefined;
  const isEdit = entry !== null && entry !== undefined;

  const [view, setView] = useState<'form' | 'items'>('form');
  const [date, setDate] = useState(new Date());
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingItemIdsRef = useRef<number[]>([]);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Reset form state when entry changes
  useEffect(() => {
    if (isVisible) {
      setView('form');
      setDate(isEdit ? fromUnixSeconds(entry.date) : new Date());
      setSelectedIds(isEdit ? entry.wardrobeItemIds : []);
      setNotes(isEdit ? (entry.notes ?? '') : '');
      setError(null);
      setIsSaving(false);
    }
  }, [isVisible, entry, isEdit]);

  // Animate sheet in/out
  useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        mass: 0.8,
        damping: 26,
        stiffness: 300,
        overshootClamping: true,
      });
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleClose = () => {
    backdropOpacity.value = withTiming(0, { duration: 260 });
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      { duration: 280, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const handleSave = () => {
    if (selectedIds.length === 0) {
      setError('Select at least one item.');
      return;
    }
    setError(null);
    setIsSaving(true);

    const payload: OutfitLogPayload = {
      date: toUnixSeconds(date),
      wardrobeItemIds: selectedIds,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    const request$ = isEdit
      ? outfitLogService.update(entry.id, payload)
      : outfitLogService.create(payload);

    request$.subscribe({
      next: (saved) => {
        setIsSaving(false);
        onSave(saved);
      },
      error: () => {
        setIsSaving(false);
        setError('Something went wrong. Please try again.');
      },
    });
  };

  const handleDelete = () => {
    if (!isEdit) return;
    Alert.alert('Delete entry?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          outfitLogService.remove(entry.id).subscribe({
            next: () => onDelete(entry.id),
            error: () => setError('Failed to delete entry.'),
          });
        },
      },
    ]);
  };

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowAndroidPicker(false);
    if (selected) setDate(selected);
  };

  const selectedItems = selectedIds
    .map((id) => wardrobeItems.find((w) => w.id === id))
    .filter(Boolean) as WardrobeItem[];

  return (
    <Modal
      visible={!!isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <AnimatedPressable
          style={[styles.backdrop, animatedBackdropStyle]}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 8 },
            animatedSheetStyle,
          ]}
        >
          {/* Header */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.sheetTitle}>
                {view === 'items'
                  ? 'Select items worn'
                  : isEdit
                    ? 'Edit entry'
                    : 'New entry'}
              </Text>
              {view === 'items' && selectedIds.length > 0 && (
                <Text style={styles.sheetSubtitle}>{selectedIds.length} selected</Text>
              )}
            </View>
            <Pressable
              onPress={
                view === 'items'
                  ? () => {
                      setSelectedIds(pendingItemIdsRef.current);
                      setView('form');
                    }
                  : handleClose
              }
              hitSlop={12}
            >
              <IconSymbol
                name={view === 'items' ? 'chevron.left' : 'xmark'}
                size={20}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>

          {view === 'items' ? (
            <ItemPickerSheet
              items={wardrobeItems}
              selectedIds={selectedIds}
              hideHeader
              onSelectionChange={(ids) => { pendingItemIdsRef.current = ids; }}
              onConfirm={(ids) => {
                setSelectedIds(ids);
                setView('form');
              }}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={styles.formContent}
            >
              {/* Date section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Date</Text>
                {Platform.OS === 'android' ? (
                  <>
                    <Pressable
                      style={styles.dateButton}
                      onPress={() => setShowAndroidPicker(true)}
                    >
                      <MaterialIcons
                        name="calendar-today"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.dateButtonText}>
                        {formatDisplayDate(date)}
                      </Text>
                    </Pressable>
                    {showAndroidPicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        maximumDate={new Date()}
                        onChange={onDateChange}
                      />
                    )}
                  </>
                ) : (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                    textColor={colors.textPrimary}
                    style={styles.iosPicker}
                  />
                )}
              </View>

              {/* Items section */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>
                    Items{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}
                  </Text>
                  <Pressable
                    onPress={() => { pendingItemIdsRef.current = selectedIds; setView('items'); }}
                    hitSlop={8}
                  >
                    <Text style={styles.changeLink}>
                      {selectedItems.length > 0 ? 'Change' : 'Select'}
                    </Text>
                  </Pressable>
                </View>

                {isLoadingItems ? (
                  <Text style={styles.loadingText}>Loading wardrobe…</Text>
                ) : selectedItems.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectedRow}
                  >
                    {selectedItems.map((item) => (
                      <View key={item.id} style={styles.selectedThumb}>
                        {item.img_url ? (
                          <Image
                            source={{ uri: item.img_url }}
                            style={styles.selectedThumbImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.selectedThumbPlaceholder}>
                            <IconSymbol
                              name="tshirt.fill"
                              size={18}
                              color={colors.textSecondary}
                            />
                          </View>
                        )}
                        <Text style={styles.selectedThumbName} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Pressable
                    style={styles.emptyItemsButton}
                    onPress={() => { pendingItemIdsRef.current = selectedIds; setView('items'); }}
                  >
                    <IconSymbol name="plus" size={16} color={colors.textSecondary} />
                    <Text style={styles.emptyItemsText}>Tap to select items worn</Text>
                  </Pressable>
                )}
              </View>

              {/* Notes section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Note (optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. wore this to the interview"
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving…' : 'Save entry'}
                </Text>
              </Pressable>

              {isEdit && (
                <Pressable style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Delete entry</Text>
                </Pressable>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
