import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { ApiError } from '@/services/http.service';
import { ImageStatus, WardrobeItem } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { iconSize, spacing } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiButton from '@/components/ui/UiButton';
import UiPage from '@/components/ui/UiPage';
import UiKeyboardToolbar from '@/components/ui/UiKeyboardToolbar';
import UiTitle from '@/components/ui/UiTitle';
import UiError from '@/components/ui/UiError';
import ItemFormFields from '@/components/pages/app/items/ItemFormFields';
import {
  ORIGINAL_EXPIRED_MESSAGE,
  ORIGINAL_EXPIRED_TITLE,
  useRetryImageGeneration,
} from '@/components/pages/app/items/useRetryImageGeneration';
import { PENDING_IMAGE_POLL_INTERVAL_MS } from '@/components/pages/app/items/usePendingImagePolling';
import {
  appendPreparedImage,
  downscaleIfNeeded,
  PreparedImage,
} from '@/components/pages/app/items/imageUpload';
import { ItemFormValues, itemFormSchema } from '@/components/pages/app/items/itemForm';
import { styles } from './styles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function itemToFormValues(item: WardrobeItem): ItemFormValues {
  return {
    name:        item.name,
    type:        item.type,
    color:       item.color,
    season:      item.season,
    status:      item.status,
    brand:       item.brand       ?? '',
    material:    item.material    ?? '',
    style:       item.style       ?? '',
    fit_type:    item.fit_type    ?? '',
    size:        item.size        ?? '',
    description: item.description ?? '',
    favourite:   item.favourite,
    // The edit screen offers no generation toggle and never sends the field —
    // re-running the generator on an existing item is Phase 3's "Generate
    // again", not an edit.
    generate_image: false,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, upsertItem, removeItem } = useWardrobe();

  const [item, setItem]           = useState<WardrobeItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  // null = no new photo; string = local URI of newly picked photo
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  // Set only on the "your original expired" path: the replacement photo is
  // meant to be generated from, not just stored as-is.
  const [regenerateFromNewPhoto, setRegenerateFromNewPhoto] = useState(false);

  const { isRetrying, originalExpired, retry } = useRetryImageGeneration();

  // The prepared (possibly downscaled) replacement photo; submit awaits any
  // in-flight preparation instead of racing it — same reasoning as new.tsx.
  const preparedImageRef = useRef<PreparedImage | null>(null);
  const pendingPrepareRef = useRef<Promise<PreparedImage> | null>(null);

  // Resolve item from context first, then fetch if missing
  useEffect(() => {
    const numId = Number(id);
    const cached = items.find((i) => i.id === numId);
    if (cached) {
      setItem(cached);
      setIsLoadingItem(false);
      return;
    }
    const sub = wardrobeService.getItem(numId).subscribe({
      next: (data) => { setItem(data); setIsLoadingItem(false); },
      error: () => { setLoadError('Could not load item.'); setIsLoadingItem(false); },
    });
    return () => sub.unsubscribe();
  }, [id]);

  // This screen has its own `item` state instead of reading the grid's, so a
  // "Generate again" from here needs its own reveal: without this, the
  // generating… banner stays up until the user leaves and comes back, even
  // though the backend finishes in 10–30s (see usePendingImagePolling, which
  // only covers the grid). The id is derived to a primitive so the effect's
  // dependency array can stay honest without re-subscribing on every poll
  // tick's `setItem` (a new `item` object every time).
  const pendingItemId =
    item?.image_status === ImageStatus.Pending ? item.id : null;

  useEffect(() => {
    if (pendingItemId === null) return;

    const interval = setInterval(() => {
      wardrobeService.getItem(pendingItemId).subscribe({
        next: (updated) => {
          setItem(updated);
          upsertItem(updated);
        },
        // A transient poll failure is not fatal — the next tick tries again.
        error: () => {},
      });
    }, PENDING_IMAGE_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pendingItemId, upsertItem]);

  // ── Generation retry ──────────────────────────────────────────────────────

  const handleRetry = () => {
    if (!item) return;

    retry(item, {
      onQueued: (updated) => setItem(updated),
      // The retained original is gone, so there is nothing to re-run from —
      // the only way forward is a new photo, and saying so beats a second
      // failure ten seconds later.
      onOriginalExpired: () =>
        Alert.alert(ORIGINAL_EXPIRED_TITLE, ORIGINAL_EXPIRED_MESSAGE, [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Pick a photo',
            onPress: () => {
              setRegenerateFromNewPhoto(true);
              showImageOptions();
            },
          },
        ]),
    });
  };

  // ── Image picker ──────────────────────────────────────────────────────────

  const showImageOptions = () => {
    Alert.alert('Change Photo', undefined, [
      { text: 'Take Photo',          onPress: () => pickImage('camera') },
      { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        'Permission required',
        `Allow access to your ${source === 'camera' ? 'camera' : 'photo library'} in Settings.`,
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });

    if (result.canceled) return;

    const asset = result.assets[0];
    setNewImageUri(asset.uri);

    const preparePromise = downscaleIfNeeded(asset).catch(
      (): PreparedImage => ({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? 'photo.jpg',
      }),
    );
    pendingPrepareRef.current = preparePromise;
    preparedImageRef.current = await preparePromise;
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    Alert.alert(
      'Delete this item?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            wardrobeService.deleteItem(Number(id)).subscribe({
              next: () => {
                removeItem(Number(id));
                router.back();
              },
              error: () =>
                Alert.alert('Error', 'Failed to delete item. Please try again.'),
            });
          },
        },
      ],
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  // Kept as a plain (non-async) function — same reasoning as new.tsx: an
  // async onSubmit would hand Formik a Promise that resolves as soon as the
  // function body finishes awaiting, clearing `isSubmitting` well before the
  // request completes.
  const onSubmit = (values: ItemFormValues, { setSubmitting }: FormikHelpers<ItemFormValues>) => {
    setSaveError('');
    void submitForm(values, setSubmitting);
  };

  const submitForm = async (
    values: ItemFormValues,
    setSubmitting: (submitting: boolean) => void,
  ) => {
    const formData = new FormData();
    formData.append('name',      values.name.trim());
    formData.append('type',      values.type);
    formData.append('color',     values.color);
    formData.append('season',    values.season);
    formData.append('status',    values.status);
    formData.append('favourite', String(values.favourite));
    if (values.brand)       formData.append('brand',       values.brand.trim());
    if (values.material)    formData.append('material',    values.material.trim());
    if (values.style)       formData.append('style',       values.style.trim());
    if (values.fit_type)    formData.append('fit_type',    values.fit_type);
    if (values.size)        formData.append('size',        values.size);
    if (values.description) formData.append('description', values.description.trim());

    if (newImageUri) {
      if (pendingPrepareRef.current) {
        preparedImageRef.current = await pendingPrepareRef.current;
      }
      if (preparedImageRef.current) {
        await appendPreparedImage(formData, preparedImageRef.current);
      }

      // Only on the expired-original path: the replacement photo goes back
      // through the generator instead of becoming the item's image.
      if (regenerateFromNewPhoto) {
        formData.append('generate_image', 'true');
      }
    }

    wardrobeService.updateItem(Number(id), formData).subscribe({
      next: (updated) => {
        upsertItem(updated);
        router.back();
      },
      error: (error: ApiError) => {
        setSaveError(
          error?.status === 429
            ? "You're doing that a bit too fast — wait a few seconds and try again."
            : 'Failed to save changes. Please try again.',
        );
        setSubmitting(false);
      },
    });
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoadingItem) {
    return (
      <UiPage>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      </UiPage>
    );
  }

  if (loadError || !item) {
    return (
      <UiPage>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError || 'Item not found.'}</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.linkText}>Go back</Text>
          </Pressable>
        </View>
      </UiPage>
    );
  }

  // ── Display photo: prefer newly picked → existing → null ─────────────────
  const photoSource = newImageUri ?? item.img_url ?? null;

  return (
    <Formik
      initialValues={itemToFormValues(item)}
      validationSchema={itemFormSchema}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ values, errors, isSubmitting, setFieldValue, handleSubmit }) => (
        // Fragment: `UiKeyboardToolbar` (QA-06) positions itself against the
        // route's screen container, next to the page.
        <>
        <UiPage
          keyboardBottomOffset={spacing.xl}
          header={
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
                <IconSymbol name="chevron.left" size={iconSize.xl} color={colors.textPrimary} />
              </Pressable>
              <UiTitle style={styles.title} numberOfLines={1}>{item.name}</UiTitle>
              <Pressable onPress={handleDelete} hitSlop={8}>
                <IconSymbol name="trash" size={iconSize.lg} color={colors.statusMissing} />
              </Pressable>
            </View>
          }
          contentStyle={styles.form}
        >
          {/* Generation state. A failed job leaves the item with no image
              and nothing on screen explaining why, so the banner carries
              both the explanation and the way out. */}
          {item.image_status === ImageStatus.Pending ? (
            <View testID="item-detail-generating" style={styles.imageStateBanner}>
              <ActivityIndicator color={colors.textSecondary} size="small" />
              <Text style={styles.imageStateText}>
                Generating a clean product image…
              </Text>
            </View>
          ) : item.image_status === ImageStatus.Failed ? (
            <View testID="item-detail-image-failed" style={styles.imageStateBanner}>
              <Text style={styles.imageStateText}>
                {originalExpired
                  ? ORIGINAL_EXPIRED_MESSAGE
                  : 'We couldn’t generate a clean product image for this item.'}
              </Text>
              <Pressable
                testID={originalExpired ? 'item-detail-pick-photo' : 'item-detail-retry'}
                style={styles.imageStateButton}
                onPress={
                  originalExpired
                    ? () => {
                        setRegenerateFromNewPhoto(true);
                        showImageOptions();
                      }
                    : handleRetry
                }
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <Text style={styles.imageStateButtonText}>
                    {originalExpired ? 'Pick a photo' : 'Generate again'}
                  </Text>
                )}
              </Pressable>
            </View>
          ) : null}

          {/* Photo */}
          <Pressable style={styles.photoArea} onPress={showImageOptions}>
            {photoSource ? (
              <Image source={{ uri: photoSource }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <IconSymbol name="camera.fill" size={iconSize.xxl} color={colors.textSecondary} />
                <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
              </View>
            )}
            <View style={styles.photoOverlay}>
              <IconSymbol name="camera.fill" size={iconSize.lg} color={colors.textPrimary} />
            </View>
          </Pressable>

          <ItemFormFields
            values={values}
            errors={errors}
            onFieldChange={(field, value) => setFieldValue(field, value)}
          />

          {/* ── Error + Save ─────────────────────────────────── */}
          {saveError ? <UiError errorMessage={saveError} /> : null}

          <UiButton
            onPress={() => handleSubmit()}
            enableLoader={isSubmitting}
            style={styles.submitButton}
          >
            <UiTitle sizeS style={styles.submitLabel}>Save changes</UiTitle>
          </UiButton>
        </UiPage>
        <UiKeyboardToolbar />
        </>
      )}
    </Formik>
  );
}
