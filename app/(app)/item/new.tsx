import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { ItemStatus } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiButton from '@/components/ui/UiButton';
import UiTitle from '@/components/ui/UiTitle';
import UiFormField from '@/components/ui/form/UiFormField';
import UiInput from '@/components/ui/form/UiInput';
import UiSelect from '@/components/ui/form/UiSelect';
import UiTextArea from '@/components/ui/form/UiTextArea';
import UiError from '@/components/ui/UiError';
import {
  AnalyzedItemAttributes,
  EMPTY_FORM_VALUES,
  FIT_OPTIONS,
  ItemFormValues,
  itemFormSchema,
  SEASON_OPTIONS,
  SIZE_OPTIONS,
  STATUS_OPTIONS,
  SWATCHES,
  TYPE_OPTIONS,
} from '@/components/pages/app/items/itemForm';

// Fields analysis is allowed to fill — status and favourite are never
// touched by it, so they are not tracked here.
type AnalyzableField = keyof AnalyzedItemAttributes;

// On web, expo-image-picker hands back a real `File` (asset.file) alongside
// the blob: URI — the browser's FormData spec stringifies a {uri,type,name}
// object instead of sending file bytes, so that native-only shape only works
// on iOS/Android and the real File must be used on web.
function appendImageAsset(formData: FormData, asset: ImagePicker.ImagePickerAsset) {
  if (Platform.OS === 'web' && asset.file) {
    formData.append('image', asset.file, asset.fileName ?? 'photo.jpg');
  } else {
    formData.append('image', {
      uri:  asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'photo.jpg',
    } as unknown as Blob);
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewItem() {
  const insets = useSafeAreaInsets();
  const { upsertItem } = useWardrobe();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('');
  // Tracks fields the user has personally changed, so an analysis result
  // arriving afterwards never overwrites them. A ref (not state) because
  // Formik's setFieldValue-driven controls (swatches, selects) never flip
  // Formik's own `touched`, and this must be readable synchronously from
  // inside the analysis callback without waiting on a re-render.
  const editedFieldsRef = useRef<Set<AnalyzableField>>(new Set());
  // The picked asset, kept alongside imageUri (used only for display) so
  // both submit and analysis can build a correctly-shaped FormData part —
  // see appendImageAsset.
  const imageAssetRef = useRef<ImagePicker.ImagePickerAsset | null>(null);

  const onSubmit = (values: ItemFormValues, { setSubmitting }: FormikHelpers<ItemFormValues>) => {
    setErrorMessage('');

    const formData = new FormData();
    formData.append('name',     values.name.trim());
    formData.append('type',     values.type);
    formData.append('color',    values.color);
    formData.append('season',   values.season);
    formData.append('status',   values.status);
    formData.append('favourite', String(values.favourite));
    // Only meaningful with a photo attached; the backend ignores it otherwise.
    formData.append('generate_image', String(values.generate_image));
    if (values.brand)       formData.append('brand',       values.brand.trim());
    if (values.material)    formData.append('material',    values.material.trim());
    if (values.style)       formData.append('style',       values.style.trim());
    if (values.fit_type)    formData.append('fit_type',    values.fit_type);
    if (values.size)        formData.append('size',        values.size);
    if (values.description) formData.append('description', values.description.trim());

    if (imageAssetRef.current) {
      appendImageAsset(formData, imageAssetRef.current);
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
      initialValues={EMPTY_FORM_VALUES}
      validationSchema={itemFormSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={onSubmit}
    >
      {({ values, errors, isSubmitting, handleChange, setFieldValue, handleSubmit }) => {
        const markEdited = (field: AnalyzableField) => {
          editedFieldsRef.current.add(field);
        };

        const applyAnalyzedAttributes = (attributes: AnalyzedItemAttributes) => {
          (Object.keys(attributes) as AnalyzableField[]).forEach((field) => {
            const value = attributes[field];
            if (value === undefined || editedFieldsRef.current.has(field)) return;
            setFieldValue(field, value);
          });
        };

        const runAnalysis = (asset: ImagePicker.ImagePickerAsset) => {
          setAnalyzing(true);
          setAnalysisMessage('');

          const formData = new FormData();
          appendImageAsset(formData, asset);

          wardrobeService.analyzeImage(formData).subscribe({
            next: (attributes) => {
              applyAnalyzedAttributes(attributes);
              setAnalyzing(false);
            },
            error: () => {
              setAnalysisMessage("Couldn't analyze the photo — you can still fill in the details manually.");
              setAnalyzing(false);
            },
          });
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
            const asset = result.assets[0];
            imageAssetRef.current = asset;
            setImageUri(asset.uri);
            runAnalysis(asset);
          }
        };

        // Alert.alert's action sheet is a no-op on react-native-web, so the
        // camera/gallery choice would never appear in a browser — go straight
        // to the gallery picker there instead.
        const showImageOptions = () => {
          if (Platform.OS === 'web') {
            void pickImage('gallery');
            return;
          }
          Alert.alert('Add Photo', undefined, [
            { text: 'Take Photo',           onPress: () => pickImage('camera') },
            { text: 'Choose from Gallery',  onPress: () => pickImage('gallery') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        };

        return (
        <View style={[styles.container, { paddingTop: insets.top }]}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <IconSymbol name="chevron.left" size={24} color={colors.textPrimary} />
            </Pressable>
            <UiTitle sizeM style={styles.title}>Add Item</UiTitle>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <ScrollView
            contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 24 }]}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Photo picker */}
            <Pressable
              testID="item-photo-picker"
              style={styles.photoArea}
              onPress={showImageOptions}
              disabled={analyzing}
            >
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
              {analyzing && (
                <View testID="item-photo-analyzing" style={styles.photoAnalyzingOverlay}>
                  <ActivityIndicator color={colors.textPrimary} />
                  <Text style={styles.photoAnalyzingText}>Analyzing photo…</Text>
                </View>
              )}
            </Pressable>
            {imageUri && !analyzing && (
              <Pressable style={styles.changePhotoBtn} onPress={showImageOptions}>
                <Text style={styles.changePhotoText}>Change photo</Text>
              </Pressable>
            )}
            {analysisMessage ? (
              <Text testID="item-analysis-message" style={styles.analysisMessage}>
                {analysisMessage}
              </Text>
            ) : null}

            {/* ── Generate clean product image ─────────────────── */}
            <View style={styles.generateRow}>
              <View style={styles.generateCopy}>
                <Text style={styles.generateLabel}>Generate clean product image</Text>
                <Text style={styles.generateHint}>
                  {values.generate_image
                    ? 'Your photo is straightened and the background removed. It appears once ready.'
                    : 'Your photo is used as-is.'}
                </Text>
              </View>
              <Switch
                testID="item-generate-image-toggle"
                value={values.generate_image}
                onValueChange={(v) => void setFieldValue('generate_image', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.accentText}
              />
            </View>

            {/* ── Required fields ─────────────────────────────── */}
            <Text style={styles.sectionLabel}>Required</Text>

            <UiFormField errorMessage={errors.name}>
              <UiInput
                testID="item-name-input"
                value={values.name}
                onChange={(text) => { markEdited('name'); handleChange('name')(text); }}
                placeholder="Item name"
              />
            </UiFormField>

            <UiFormField errorMessage={errors.type}>
              <Text style={styles.fieldLabel}>Type</Text>
              <UiSelect
                options={TYPE_OPTIONS}
                value={values.type || undefined}
                onChange={(v) => { markEdited('type'); setFieldValue('type', v ?? ''); }}
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
                    onPress={() => {
                      markEdited('color');
                      setFieldValue('color', values.color === hex ? '' : hex);
                    }}
                  />
                ))}
              </View>
            </UiFormField>

            <UiFormField errorMessage={errors.season}>
              <Text style={styles.fieldLabel}>Season</Text>
              <UiSelect
                options={SEASON_OPTIONS}
                value={values.season || undefined}
                onChange={(v) => { markEdited('season'); setFieldValue('season', v ?? ''); }}
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
                testID="item-brand-input"
                value={values.brand}
                onChange={(text) => { markEdited('brand'); handleChange('brand')(text); }}
                placeholder="Brand"
              />
            </UiFormField>

            <UiFormField>
              <UiInput
                value={values.material}
                onChange={(text) => { markEdited('material'); handleChange('material')(text); }}
                placeholder="Material"
              />
            </UiFormField>

            <UiFormField>
              <UiInput
                value={values.style}
                onChange={(text) => { markEdited('style'); handleChange('style')(text); }}
                placeholder="Style (e.g. casual, formal)"
              />
            </UiFormField>

            <UiFormField>
              <Text style={styles.fieldLabel}>Fit type</Text>
              <UiSelect
                options={FIT_OPTIONS}
                value={values.fit_type || undefined}
                onChange={(v) => { markEdited('fit_type'); setFieldValue('fit_type', v ?? ''); }}
              />
            </UiFormField>

            <UiFormField>
              <Text style={styles.fieldLabel}>Size</Text>
              <UiSelect
                options={SIZE_OPTIONS}
                value={values.size || undefined}
                onChange={(v) => { markEdited('size'); setFieldValue('size', v ?? ''); }}
              />
            </UiFormField>

            <UiFormField>
              <UiTextArea
                value={values.description}
                onChange={(text) => { markEdited('description'); handleChange('description')(text); }}
                placeholder="Description"
              />
            </UiFormField>

            {/* ── Favourite toggle ─────────────────────────────── */}
            <View style={styles.favouriteRow}>
              <Text style={styles.favouriteLabel}>Add to favourites</Text>
              <Switch
                value={values.favourite}
                onValueChange={(v) => void setFieldValue('favourite', v)}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.accentText}
              />
            </View>

            {/* ── Error + Submit ───────────────────────────────── */}
            {errorMessage ? <UiError errorMessage={errorMessage} /> : null}

            <UiButton testID="item-submit-button" onPress={() => handleSubmit()} enableLoader={isSubmitting}>
              <Text style={styles.submitLabel}>Save Item</Text>
            </UiButton>
          </ScrollView>

        </View>
        );
      }}
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
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoAnalyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  photoAnalyzingText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  analysisMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
  },

  // Generate clean product image
  generateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  generateCopy: {
    flex: 1,
    gap: 2,
  },
  generateLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  generateHint: {
    fontSize: 12,
    color: colors.textSecondary,
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
