import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { WardrobeItem, ItemStatus } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { styles } from './styles';

interface Props {
  item: WardrobeItem;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  [ItemStatus.Active]:    'Ready',
  [ItemStatus.Washing]:   'Washing',
  [ItemStatus.Missing]:   'Missing',
  [ItemStatus.NeedRepair]: 'Need Repair',
};

const STATUS_COLOR: Record<ItemStatus, string> = {
  [ItemStatus.Active]:    colors.statusActive,
  [ItemStatus.Washing]:   colors.statusWashing,
  [ItemStatus.Missing]:   colors.statusMissing,
  [ItemStatus.NeedRepair]: colors.statusNeedRepair,
};

const STATUS_OPTIONS: ItemStatus[] = [
  ItemStatus.Active,
  ItemStatus.Washing,
  ItemStatus.Missing,
  ItemStatus.NeedRepair,
];

export default function ItemCard({ item }: Props) {
  const { upsertItem } = useWardrobe();
  const badgeColor = STATUS_COLOR[item.status];
  const [imgError, setImgError] = useState(false);

  const handleStatusPress = () => {
    Alert.alert(
      'Change Status',
      item.name,
      [
        ...STATUS_OPTIONS.map((status) => ({
          text: STATUS_LABEL[status],
          onPress: () => updateStatus(status),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    );
  };

  const updateStatus = (status: ItemStatus) => {
    if (status === item.status) return;

    // Optimistic update
    upsertItem({ ...item, status });

    const formData = new FormData();
    formData.append('status', status);

    wardrobeService.updateItem(item.id, formData).subscribe({
      next: (updated) => upsertItem(updated),
      error: () => {
        upsertItem({ ...item, status: item.status }); // revert
        Alert.alert('Error', 'Failed to update status. Please try again.');
      },
    });
  };

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {item.img_path && !imgError ? (
        <Image
          source={{ uri: item.img_path }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
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
        <Pressable
          style={[styles.badge, { backgroundColor: `${badgeColor}22` }]}
          onPress={handleStatusPress}
          hitSlop={4}
        >
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
