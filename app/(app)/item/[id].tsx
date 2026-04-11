import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { ItemStatus, WardrobeItem } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiButton from '@/components/ui/UiButton';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiSelect from '@/components/ui/form/UiSelect';
import UiTextArea from '@/components/ui/form/UiTextArea';
import UiError from '@/components/ui/UiError';
import {
  FIT_OPTIONS,
  ItemFormValues,
  itemFormSchema,
  SEASON_OPTIONS,
  SIZE_OPTIONS,
  STATUS_OPTIONS,
  SWATCHES,
  TYPE_OPTIONS,
} from '@/components/pages/app/items/itemForm';

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
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ItemDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, upsertItem, removeItem } = useWardrobe();

  const [item, setItem]           = useState<WardrobeItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  // null = no new photo; string = local URI of newly picked photo
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

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

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
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

  const onSubmit = (values: ItemFormValues, { setSubmitting }: FormikHelpers<ItemFormValues>) => {
    setSaveError('');

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
      formData.append('image', {
        uri:  newImageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as unknown as Blob);
    }

    wardrobeService.updateItem(Number(id), formData).subscribe({
      next: (updated) => {
        upsertItem(updated);
        router.back();
      },
      error: () => {
        setSaveError('Failed to save changes. Please try again.');
        setSubmitting(false);
      },
    });
  };

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoadingItem) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.textPrimary} size="large" />
      </View>
    );
  }

  if (loadError || !item) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{loadError || 'Item not found.'}</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  // ── Display photo: prefer newly picked → existing → null ─────────────────
  const photoSource = newImageUri ?? item.img_path ?? null;

  return (
    <Formik
      initialValues={itemToFormValues(item)}
      validationSchema={itemFormSchema}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit }) => (
        <View style={[styles.container, { paddingTop: insets.top }]}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <IconSymbol name="chevron.left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            <Pressable onPress={handleDelete} hitSlop={8}>
              <IconSymbol name="trash" size={22} color={colors.statusMissing} />
            </Pressable>
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Photo */}
            <Pressable style={styles.photoArea} onPress={showImageOptions}>
              {photoSource ? (
                <Image source={{ uri: photoSource }} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="camera.fill" size={32} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
                </View>
              )}
              <View style={styles.photoOverlay}>
                <IconSymbol name="camera.fill" size={18} color={colors.textPrimary} />
              </View>
            </Pressable>

            {/* ── Required fields ─────────────────────────────── */}
            <Text style={styles.sectionLabel}>Details</Text>

            <UiFormField errorMessage={errors.name}>
              <UiInput
                value={values.name}
                onChange={handleChange('name')}
                placeholder="Item name"
              />
            </UiFormField>

            <UiFormField errorMessage={errors.type}>
              <Text style={styles.fieldLabel}>Type</Text>
              <UiSelect
                options={TYPE_OPTIONS}
                value={values.type || undefined}
                onChange={(v) => setFieldValue('type', v ?? '')}
                required
                horizontal
              />
            </UiFormField>

            <UiFormField errorMessage={errors.color}>
              <Text style={styles.fieldLabel}>Colour</Text>
              <View style={styles.swatchRow}>
                {SWATCHES.map(({ label, hex }) => (
                  <Pressable
                    key={label}
                    style={[
                      styles.swatch,
                      { backgroundColor: hex },
                      values.color === hex && styles.swatch__active,
                    ]}
                    onPress={() =>
                      setFieldValue('color', values.color === hex ? '' : hex)
                    }
                  />
                ))}
              </View>
            </UiFormField>

            <UiFormField errorMessage={errors.season}>
              <Text style={styles.fieldLabel}>Season</Text>
              <UiSelect
                options={SEASON_OPTIONS}
                value={values.season || undefined}
                onChange={(v) => setFieldValue('season', v ?? '')}
                required
              />
            </UiFormField>

            <UiFormField errorMessage={errors.status}>
              <Text style={styles.fieldLabel}>Status</Text>
              <UiSelect
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={(v) => setFieldValue('status', v ?? ItemStatus.Active)}
                required
              />
            </UiFormField>

            {/* ── Optional fields ─────────────────────────────── */}
            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Optional</Text>

            <UiFormField>
              <UiInput
                value={values.brand}
                onChange={handleChange('brand')}
                placeholder="Brand"
              />
            </UiFormField>

            <UiFormField>
              <UiInput
                value={values.material}
                onChange={handleChange('material')}
                placeholder="Material"
              />
            </UiFormField>

            <UiFormField>
              <UiInput
                value={values.style}
                onChange={handleChange('style')}
                placeholder="Style (e.g. casual, formal)"
              />
            </UiFormField>

            <UiFormField>
              <Text style={styles.fieldLabel}>Fit type</Text>
              <UiSelect
                options={FIT_OPTIONS}
                value={values.fit_type || undefined}
                onChange={(v) => setFieldValue('fit_type', v ?? '')}
              />
            </UiFormField>

            <UiFormField>
              <Text style={styles.fieldLabel}>Size</Text>
              <UiSelect
                options={SIZE_OPTIONS}
                value={values.size || undefined}
                onChange={(v) => setFieldValue('size', v ?? '')}
              />
            </UiFormField>

            <UiFormField>
              <UiTextArea
                value={values.description}
                onChange={handleChange('description')}
                placeholder="Description"
              />
            </UiFormField>

            {/* ── Favourite ────────────────────────────────────── */}
            <View style={styles.favouriteRow}>
              <Text style={styles.favouriteLabel}>Favourite</Text>
              <Switch
                value={values.favourite}
                onValueChange={(v) => setFieldValue('favourite', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.accentText}
              />
            </View>

            {/* ── Error + Save ─────────────────────────────────── */}
            {saveError ? <UiError errorMessage={saveError} /> : null}

            <UiButton onPress={() => handleSubmit()} enableLoader={isSubmitting}>
              <Text style={styles.submitLabel}>Save Changes</Text>
            </UiButton>
          </ScrollView>

        </View>
      )}
    </Formik>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  linkText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    paddingVertical: 14,
    gap: 8,
  },
  backButton: {
    marginRight: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Form
  form: {
    paddingHorizontal: pageInlineIntent,
    gap: 16,
  },

  // Photo
  photoArea: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    aspectRatio: 3 / 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
  },

  // Section / field labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },

  // Colour swatches
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatch__active: {
    borderColor: colors.textPrimary,
  },

  // Favourite
  favouriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  favouriteLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Submit
  submitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentText,
  },
});
