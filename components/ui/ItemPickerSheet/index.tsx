import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { WardrobeItem } from '@/types/wardrobe';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

interface Props {
  items: WardrobeItem[];
  selectedIds: number[];
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  hideHeader?: boolean;
  onSelectionChange?: (ids: number[]) => void;
  onConfirm: (ids: number[]) => void;
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

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        style={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <Pressable
              style={[styles.cell, isSelected && styles.cellSelected]}
              onPress={() => toggle(item.id)}
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
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items in your wardrobe yet.</Text>
          </View>
        }
      />

      <Pressable style={styles.confirmButton} onPress={() => onConfirm(Array.from(selected))}>
        <Text style={styles.confirmLabel}>{derivedConfirmLabel}</Text>
      </Pressable>
    </View>
  );
}
