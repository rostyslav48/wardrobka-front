import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Formik, FormikHelpers } from 'formik';
import { useWardrobe } from '@/context/WardrobeContext';
import { wardrobeService } from '@/services/wardrobe.service';
import { ApiError } from '@/services/http.service';
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
  appendPreparedImage,
  downscaleIfNeeded,
  PreparedImage,
} from '@/components/pages/app/items/imageUpload';
import {
  AnalyzedItemAttributes,
  EMPTY_FORM_VALUES,
  ItemFormValues,
  itemFormSchema,
} from '@/components/pages/app/items/itemForm';
import { styles } from './styles';

// Fields analysis is allowed to fill — status and favourite are never
// touched by it, so they are not tracked here.
type AnalyzableField = keyof AnalyzedItemAttributes;

// Identifies a picked photo well enough to tell "the same photo, picked
// again" from "a different photo" without hashing bytes. `asset.uri` cannot
// be used as a fallback: on web it is a fresh `URL.createObjectURL()` blob
// URL minted on every pick, so it never matches even for the identical file.
// assetId is stable for a native gallery pick; on web, `asset.file` (a real
// File) has name/size/lastModified, which is stable across re-picking the
// same file from disk. Falling back to fileSize/dimensions alone (e.g. a
// camera capture with neither) is the last resort.
function assetSignature(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.assetId) return `assetId:${asset.assetId}`;
  if (asset.file) return `webFile:${asset.file.name}|${asset.file.size}|${asset.file.lastModified}`;
  return `dims:${asset.fileSize ?? ''}|${asset.width}|${asset.height}`;
}

function friendlyErrorMessage(error: ApiError, fallback: string): string {
  if (error?.status === 429) {
    return "You're doing that a bit too fast — wait a few seconds and try again.";
  }
  return fallback;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewItemScreen() {
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
  // The prepared (possibly downscaled) image, kept alongside imageUri (used
  // only for display) so both submit and analysis send the same bytes.
  const preparedImageRef = useRef<PreparedImage | null>(null);
  // Downscaling runs in the background as soon as a photo is picked; submit
  // awaits this instead of racing it, in case Save is tapped before it settles.
  const pendingPrepareRef = useRef<Promise<PreparedImage> | null>(null);
  // The signature of the last photo actually sent for analysis, so picking
  // the exact same one again is a no-op rather than a second network call.
  const lastAnalyzedSignatureRef = useRef<string | null>(null);

  // Kept as a plain (non-async) function so Formik never sees a Promise back
  // from onSubmit — it would otherwise auto-clear `isSubmitting` as soon as
  // the function body finishes awaiting, well before the request completes.
  // Manual setSubmitting calls below stay in full control, same as before.
  const onSubmit = (values: ItemFormValues, { setSubmitting }: FormikHelpers<ItemFormValues>) => {
    setErrorMessage('');
    void submitForm(values, setSubmitting);
  };

  const submitForm = async (
    values: ItemFormValues,
    setSubmitting: (submitting: boolean) => void,
  ) => {
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

    if (pendingPrepareRef.current) {
      preparedImageRef.current = await pendingPrepareRef.current;
    }
    if (preparedImageRef.current) {
      await appendPreparedImage(formData, preparedImageRef.current);
    }

    wardrobeService.createItem(formData).subscribe({
      next: (item) => {
        upsertItem(item);
        router.back();
      },
      error: (error: ApiError) => {
        setErrorMessage(friendlyErrorMessage(error, 'Failed to save item. Please try again.'));
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
      {({ values, errors, isSubmitting, setFieldValue, handleSubmit }) => {
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

        const runAnalysis = async (image: PreparedImage) => {
          setAnalyzing(true);
          setAnalysisMessage('');

          const formData = new FormData();
          await appendPreparedImage(formData, image);

          wardrobeService.analyzeImage(formData).subscribe({
            next: (attributes) => {
              applyAnalyzedAttributes(attributes);
              setAnalyzing(false);
              // QA-44: the "Analyzing…" overlay is on screen only for as
              // long as the request takes, which can be under a frame - too
              // brief to register. This message persists until the next
              // photo pick or submit, so the user has a way to know the
              // fields below were filled in automatically even if they
              // missed the overlay.
              setAnalysisMessage('Filled in from your photo — check the details below.');
            },
            error: (error: ApiError) => {
              setAnalysisMessage(
                friendlyErrorMessage(
                  error,
                  "Couldn't analyze the photo — you can still fill in the details manually.",
                ),
              );
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

          if (result.canceled) return;

          const asset = result.assets[0];
          const signature = assetSignature(asset);
          setImageUri(asset.uri);

          const preparePromise = downscaleIfNeeded(asset).catch(
            (): PreparedImage => ({
              uri: asset.uri,
              mimeType: asset.mimeType ?? 'image/jpeg',
              fileName: asset.fileName ?? 'photo.jpg',
            }),
          );
          pendingPrepareRef.current = preparePromise;

          const prepared = await preparePromise;
          preparedImageRef.current = prepared;

          // Re-picking the exact same photo (assetId/size/dimensions all
          // match the last one that was actually sent for analysis) must not
          // waste another call — the fields it would fill are already filled.
          if (signature === lastAnalyzedSignatureRef.current) return;
          lastAnalyzedSignatureRef.current = signature;
          void runAnalysis(prepared);
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

        // Every field this form owns funnels through here, so the
        // edited-fields guard (used to keep analysis from overwriting a value
        // the user already changed) lives in one place. Marking `status` /
        // `favourite` as "edited" is harmless — `applyAnalyzedAttributes`
        // only ever iterates the keys `AnalyzedItemAttributes` can carry,
        // which are neither.
        const handleFieldChange = (field: keyof ItemFormValues, value: unknown) => {
          markEdited(field as AnalyzableField);
          setFieldValue(field, value);
        };

        // Fragment: `UiKeyboardToolbar` (QA-06) positions itself against the
        // route's screen container, next to the page.
        return (
          <>
          <UiPage
            keyboardBottomOffset={spacing.xl}
            header={
              <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
                  <IconSymbol name="chevron.left" size={iconSize.xl} color={colors.textPrimary} />
                </Pressable>
                <UiTitle style={styles.title} numberOfLines={1}>Add item</UiTitle>
                <View style={styles.headerSpacer} />
              </View>
            }
            contentStyle={styles.form}
          >
            {/* Photo picker — spec 6.7: 362 x 200 photo slot. */}
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
                  {/* QA-45: the separate "CAMERA"/"GALLERY" hints implied two
                      tap targets when the whole area is one (it opens the
                      same "Add Photo" choice either way) - dropped rather
                      than split into two buttons, per the finding's second
                      option. */}
                  <IconSymbol name="camera.fill" size={iconSize.xxl} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
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

            <ItemFormFields
              values={values}
              errors={errors}
              onFieldChange={handleFieldChange}
              nameTestID="item-name-input"
              brandTestID="item-brand-input"
              colorSwatchTestID={(label) => `item-color-swatch-${label}`}
            />

            {/* ── Error + Submit ───────────────────────────────── */}
            {errorMessage ? <UiError errorMessage={errorMessage} /> : null}

            <UiButton
              testID="item-submit-button"
              onPress={() => handleSubmit()}
              enableLoader={isSubmitting}
              style={styles.submitButton}
            >
              <UiTitle sizeS style={styles.submitLabel}>Save item</UiTitle>
            </UiButton>
          </UiPage>
          <UiKeyboardToolbar />
          </>
        );
      }}
    </Formik>
  );
}
