import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { WardrobeItem, ItemStatus } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

interface Props {
  item: WardrobeItem;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  [ItemStatus.Active]: 'Ready',
  [ItemStatus.Washing]: 'Washing',
  [ItemStatus.Missing]: 'Missing',
  [ItemStatus.NeedRepair]: 'Need Repair',
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  [ItemStatus.Active]: colors.statusActive,
  [ItemStatus.Washing]: colors.statusWashing,
  [ItemStatus.Missing]: colors.statusMissing,
  [ItemStatus.NeedRepair]: colors.statusNeedRepair,
};

export default function ItemCard({ item }: Props) {
  const badgeColor = STATUS_COLOR[item.status];

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {item.img_path ? (
        <Image
          source={{ uri: item.img_path }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <IconSymbol name="tshirt.fill" size={40} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${badgeColor}22` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
