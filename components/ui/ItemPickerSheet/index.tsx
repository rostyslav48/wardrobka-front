import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { WardrobeItem } from '@/types/wardrobe';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

const COLUMNS = 3;

function chunk<T>(list: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

interface Props {
  items: WardrobeItem[];
  selectedIds: number[];
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  hideHeader?: boolean;
  onSelectionChange?: (ids: number[]) => void;
  onConfirm: (ids: number[]) => void;
  /**
   * Extra bottom padding for the confirm button, e.g. a safe-area inset when
   * this sheet is the only thing between its content and the device edge.
   * `LogEntrySheet` already pads its own wrapper, so it leaves this at 0.
   */
  bottomInset?: number;
  confirmTestID?: string;
}

export default function ItemPickerSheet({
  items,
  selectedIds,
  title = 'Select items',
  subtitle,
  confirmLabel,
  hideHeader = false,
  onSelectionChange,
  onConfirm,
  bottomInset = 0,
  confirmTestID,
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIds));

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange?.(Array.from(next));
      return next;
    });
  };

  const derivedSubtitle =
    subtitle ?? (selected.size > 0 ? `${selected.size} selected` : 'Select items from your wardrobe');

  const derivedConfirmLabel =
    confirmLabel ?? (selected.size > 0 ? `Confirm ${selected.size} item${selected.size > 1 ? 's' : ''}` : 'Done');

  return (
    <View style={styles.container}>
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{derivedSubtitle}</Text>
        </View>
      )}

      {/* A plain View grid, not a `FlatList` - some call sites render this
          sheet inside another scroll container, and a virtualized list nested
          in a plain ScrollView is invalid RN. Item counts here are a
          wardrobe, not a feed, so virtualization buys nothing. */}
      <ScrollView style={styles.list} contentContainerStyle={styles.grid}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items in your wardrobe yet.</Text>
          </View>
        ) : (
          chunk(items, COLUMNS).map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.cell, isSelected && styles.cellSelected]}
                    onPress={() => toggle(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    accessibilityState={{ selected: isSelected }}
                  >
                    {item.img_url ? (
                      <Image
                        source={{ uri: item.img_url }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholder}>
                        <IconSymbol name="tshirt.fill" size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    {isSelected && (
                      <View style={styles.checkOverlay}>
                        <IconSymbol name="checkmark" size={16} color={colors.accentText} />
                      </View>
                    )}
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        testID={confirmTestID}
        style={[styles.confirmButton, { marginBottom: bottomInset }]}
        onPress={() => onConfirm(Array.from(selected))}
        accessibilityRole="button"
        accessibilityLabel={derivedConfirmLabel}
      >
        <Text style={styles.confirmLabel}>{derivedConfirmLabel}</Text>
      </Pressable>
    </View>
  );
}
