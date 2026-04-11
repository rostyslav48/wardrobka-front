import { useState } from 'react';
import {
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
import { router } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { FitType, ItemStatus, ItemType, Season, Size } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiButton from '@/components/ui/UiButton';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiSelect from '@/components/ui/form/UiSelect';
import UiTextArea from '@/components/ui/form/UiTextArea';
import UiError from '@/components/ui/UiError';

// ─── Constants ────────────────────────────────────────────────────────────────

const SWATCHES = [
  { label: 'Black',  hex: '#111111' },
  { label: 'White',  hex: '#F5F5F5' },
  { label: 'Gray',   hex: '#808080' },
  { label: 'Beige',  hex: '#D4C5A9' },
  { label: 'Brown',  hex: '#6B4226' },
  { label: 'Navy',   hex: '#1B2A4A' },
  { label: 'Blue',   hex: '#1565C0' },
  { label: 'Green',  hex: '#2E7D32' },
  { label: 'Red',    hex: '#C62828' },
  { label: 'Pink',   hex: '#E91E8C' },
  { label: 'Yellow', hex: '#F9A825' },
  { label: 'Orange', hex: '#E65100' },
  { label: 'Purple', hex: '#6A1B9A' },
];

const TYPE_OPTIONS = Object.values(ItemType).map((v) => ({ label: v, value: v }));

const SEASON_OPTIONS = [
  { label: 'Winter', value: Season.Winter },
  { label: 'Spring', value: Season.Spring },
  { label: 'Summer', value: Season.Summer },
  { label: 'Autumn', value: Season.Autumn },
];

const STATUS_OPTIONS = [
  { label: 'Ready',      value: ItemStatus.Active },
  { label: 'Washing',    value: ItemStatus.Washing },
  { label: 'Missing',    value: ItemStatus.Missing },
  { label: 'Need Repair', value: ItemStatus.NeedRepair },
];

const FIT_OPTIONS = Object.values(FitType).map((v) => ({
  label: v.charAt(0).toUpperCase() + v.slice(1),
  value: v,
}));

const SIZE_OPTIONS = Object.values(Size).map((v) => ({
  label: v.toUpperCase(),
  value: v,
}));

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = Yup.object({
  name:   Yup.string().trim().max(50, 'Max 50 characters').required('Name is required'),
  type:   Yup.string().required('Select a type'),
  color:  Yup.string().required('Select a colour'),
  season: Yup.string().required('Select a season'),
  status: Yup.string().required('Select a status'),
});

// ─── Form values ──────────────────────────────────────────────────────────────

interface FormValues {
  name:        string;
  type:        ItemType | '';
  color:       string;
  season:      Season | '';
  status:      ItemStatus;
  brand:       string;
  material:    string;
  style:       string;
  fit_type:    FitType | '';
  size:        Size | '';
  description: string;
  favourite:   boolean;
}

const INITIAL_VALUES: FormValues = {
  name:        '',
  type:        '',
  color:       '',
  season:      '',
  status:      ItemStatus.Active,
  brand:       '',
  material:    '',
  style:       '',
  fit_type:    '',
  size:        '',
  description: '',
  favourite:   false,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewItem() {
  const insets = useSafeAreaInsets();
  const { upsertItem } = useWardrobe();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const showImageOptions = () => {
    Alert.alert('Add Photo', undefined, [
      { text: 'Take Photo',           onPress: () => pickImage('camera') },
      { text: 'Choose from Gallery',  onPress: () => pickImage('gallery') },
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
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = (values: FormValues, { setSubmitting }: FormikHelpers<FormValues>) => {
    setErrorMessage('');

    const formData = new FormData();
    formData.append('name',     values.name.trim());
    formData.append('type',     values.type);
    formData.append('color',    values.color);
    formData.append('season',   values.season);
    formData.append('status',   values.status);
    formData.append('favourite', String(values.favourite));
    if (values.brand)       formData.append('brand',       values.brand.trim());
    if (values.material)    formData.append('material',    values.material.trim());
    if (values.style)       formData.append('style',       values.style.trim());
    if (values.fit_type)    formData.append('fit_type',    values.fit_type);
    if (values.size)        formData.append('size',        values.size);
    if (values.description) formData.append('description', values.description.trim());

    if (imageUri) {
      formData.append('image', {
        uri:  imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as unknown as Blob);
    }

    wardrobeService.createItem(formData).subscribe({
      next: (item) => {
        upsertItem(item);
        router.back();
      },
      error: () => {
        setErrorMessage('Failed to save item. Please try again.');
        setSubmitting(false);
      },
    });
  };

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={schema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={onSubmit}
    >
      {({ values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit }) => (
        <View style={[styles.container, { paddingTop: insets.top }]}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <IconSymbol name="chevron.left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Add Item</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Photo picker */}
            <Pressable style={styles.photoArea} onPress={showImageOptions}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="camera.fill" size={32} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
                  <View style={styles.photoActions}>
                    <IconSymbol name="camera.fill"         size={16} color={colors.textSecondary} />
                    <Text style={styles.photoActionText}>Camera</Text>
                    <IconSymbol name="photo.on.rectangle"  size={16} color={colors.textSecondary} />
                    <Text style={styles.photoActionText}>Gallery</Text>
                  </View>
                </View>
              )}
            </Pressable>
            {imageUri && (
              <Pressable style={styles.changePhotoBtn} onPress={showImageOptions}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </Pressable>
            )}

            {/* ── Required fields ─────────────────────────────── */}
            <Text style={styles.sectionLabel}>Required</Text>

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

            {/* ── Favourite toggle ─────────────────────────────── */}
            <View style={styles.favouriteRow}>
              <Text style={styles.favouriteLabel}>Add to favourites</Text>
              <Switch
                value={values.favourite}
                onValueChange={(v) => setFieldValue('favourite', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.accentText}
              />
            </View>

            {/* ── Error + Submit ───────────────────────────────── */}
            {errorMessage ? <UiError errorMessage={errorMessage} /> : null}

            <UiButton onPress={() => handleSubmit()} enableLoader={isSubmitting}>
              <Text style={styles.submitLabel}>Save Item</Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    paddingVertical: 14,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },

  // Form
  form: {
    paddingHorizontal: pageInlineIntent,
    gap: 16,
  },

  // Photo picker
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
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  photoActionText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginRight: 8,
  },
  changePhotoBtn: {
    alignSelf: 'center',
    marginTop: -8,
  },
  changePhotoText: {
    color: colors.textSecondary,
    fontSize: 14,
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
