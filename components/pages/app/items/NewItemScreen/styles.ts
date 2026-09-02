import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.7's Add item sheet, adapted to a pushed route rather than a
 * bottom sheet (section 7.2: the mockup goes straight from grid card to the
 * edit sheet; this repo keeps its existing full-page form instead of building
 * a third layout). The 362 x 200 photo slot and the camera/gallery row are
 * section-6 box geometry (8.5).
 */
export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.cardPad,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  // Sheet-title role (22/400 Newsreader) - `UiTitle`'s own default.
  title: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },

  form: {
    gap: spacing.xl,
  },

  // Photo picker - spec 6.7: "362 x 200 photo slot ... reading 'Tap to add photo'".
  photoArea: {
    borderRadius: radius.photo,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    aspectRatio: 362 / 200,
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
    gap: spacing.sm,
    backgroundColor: colors.scrimSoft,
  },
  // Not a heading - overlay status text over the photo.
  photoAnalyzingText: {
    ...typography.valueEmphasis,
    letterSpacing: tracking.valueEmphasis,
    color: colors.textPrimary,
  },
  analysisMessage: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Generate clean product image
  generateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  generateCopy: {
    flex: 1,
    gap: spacing.hair,
  },
  // Not a heading - the settings-row label role.
  generateLabel: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textPrimary,
  },
  generateHint: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoPlaceholderText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
  },
  // Spec 6.7: "CAMERA / GALLERY row (gap 18, 14px icons, 10/500 ls 0.8 labels)".
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.section,
    marginTop: spacing['3xs'],
  },
  // Spec 4.3's meta-line role names "CAMERA" and "GALLERY" verbatim.
  photoActionText: {
    ...typography.meta,
    letterSpacing: tracking.meta,
    color: colors.textSecondary,
  },
  changePhotoBtn: {
    alignSelf: 'center',
  },
  // Not a heading - a small inline text link.
  changePhotoText: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },

  submitButton: {
    marginBottom: spacing['2xl'],
  },
  submitLabel: {
    color: colors.accentText,
  },
});
