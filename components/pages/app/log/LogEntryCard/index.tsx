import { Image, Pressable, Text, View } from 'react-native';
import { OutfitLog } from '@/types/outfit-log';
import { WardrobeItem } from '@/types/wardrobe';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

const THUMB_MAX = 4;

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (isoDate === todayStr) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (isoDate === yStr) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface Props {
  entry: OutfitLog;
  wardrobeItems: WardrobeItem[];
  onPress: () => void;
}

export default function LogEntryCard({ entry, wardrobeItems, onPress }: Props) {
  const items = entry.wardrobeItemIds
    .map((id) => wardrobeItems.find((w) => w.id === id))
    .filter(Boolean) as WardrobeItem[];

  const hasOverflow = items.length > THUMB_MAX;
  const visibleItems = hasOverflow ? items.slice(0, THUMB_MAX - 1) : items.slice(0, THUMB_MAX);
  const overflowCount = items.length - (THUMB_MAX - 1);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(entry.date)}</Text>
        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
      </View>

      {items.length > 0 && (
        <View style={styles.thumbRow}>
          {visibleItems.map((item, i) => (
            <View key={i} style={styles.thumb}>
              {item.img_url ? (
                <Image source={{ uri: item.img_url }} style={styles.thumbImage} resizeMode="cover" />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <IconSymbol name="tshirt.fill" size={20} color={colors.textSecondary} />
                </View>
              )}
            </View>
          ))}
          {hasOverflow && (
            <View style={[styles.thumb, styles.overflowBadge]}>
              <Text style={styles.overflowText}>+{overflowCount}</Text>
            </View>
          )}
        </View>
      )}

      {entry.notes ? (
        <Text style={styles.note} numberOfLines={1}>
          {entry.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}
