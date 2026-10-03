import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ImageStatus, WardrobeItem, ItemStatus } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiStatusBadge, { UiStatusBadgeTone } from '@/components/ui/UiStatusBadge';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import {
  ORIGINAL_EXPIRED_MESSAGE,
  ORIGINAL_EXPIRED_TITLE,
  useRetryImageGeneration,
} from '@/components/pages/app/items/useRetryImageGeneration';
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

const STATUS_TONE: Record<ItemStatus, UiStatusBadgeTone> = {
  [ItemStatus.Active]:    'active',
  [ItemStatus.Washing]:   'washing',
  [ItemStatus.Missing]:   'missing',
  [ItemStatus.NeedRepair]: 'needRepair',
};

const STATUS_OPTIONS: ItemStatus[] = [
  ItemStatus.Active,
  ItemStatus.Washing,
  ItemStatus.Missing,
  ItemStatus.NeedRepair,
];

export default function ItemCard({ item }: Props) {
  const { upsertItem } = useWardrobe();
  const { isRetrying, originalExpired, retry } = useRetryImageGeneration();

  const handleRetry = () =>
    retry(item, {
      // The grid has no photo picker, so the fallback is to send the user to
      // the item, where changing the photo is possible.
      onOriginalExpired: () =>
        Alert.alert(ORIGINAL_EXPIRED_TITLE, ORIGINAL_EXPIRED_MESSAGE, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Pick a photo', onPress: () => router.push(`/item/${item.id}`) },
        ]),
    });

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

  const hasFailed = item.image_status === ImageStatus.Failed;
  const failedLabel = originalExpired ? 'Photo expired' : 'Couldn’t generate';
  const failedAction = (
    <Pressable
      testID={originalExpired ? 'item-card-pick-photo' : 'item-card-retry'}
      style={styles.retryButton}
      onPress={originalExpired ? () => router.push(`/item/${item.id}`) : handleRetry}
      disabled={isRetrying}
      hitSlop={4}
    >
      {isRetrying ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <Text style={styles.retryButtonText}>
          {originalExpired ? 'Pick a photo' : 'Generate again'}
        </Text>
      )}
    </Pressable>
  );

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      {/* While a product image is being generated the item has no img_url yet,
          so the placeholder stands in until a poll picks up image_status:ready. */}
      {item.image_status === ImageStatus.Pending ? (
        <View testID="item-card-generating" style={styles.photoArea}>
          <ActivityIndicator color={colors.textSecondary} />
          <Text style={styles.placeholderText}>Generating…</Text>
        </View>
      ) : hasFailed && !item.img_url ? (
        /* A failed job leaves the item with no image at all — without saying
           so the card is indistinguishable from an item added without a
           photo, and the user never learns there is anything to retry. */
        <View testID="item-card-failed" style={styles.photoArea}>
          <IconSymbol name="sparkles" size={iconSize.xxl} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>{failedLabel}</Text>
          {failedAction}
        </View>
      ) : item.img_url ? (
        /* A regeneration keeps the item's existing image, so a failure can
           land on an item that still has a perfectly good photo. Hiding it
           behind the placeholder would look like the photo was lost, so the
           image stays and the retry is offered over it. */
        <View style={styles.imageFrame}>
          <Image
            source={{ uri: item.img_url }}
            style={styles.image}
            resizeMode="cover"
          />
          {hasFailed ? (
            <View testID="item-card-failed" style={styles.failedOverlay}>
              <Text style={styles.failedOverlayText} numberOfLines={1}>
                {failedLabel}
              </Text>
              {failedAction}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.photoArea}>
          <IconSymbol name="tshirt.fill" size={iconSize.xxl} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <UiStatusBadge
          label={STATUS_LABEL[item.status]}
          tone={STATUS_TONE[item.status]}
          onPress={handleStatusPress}
        />
      </View>
    </Pressable>
  );
}
