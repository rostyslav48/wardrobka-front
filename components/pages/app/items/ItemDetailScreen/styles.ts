import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.7's Edit item sheet, adapted to a pushed route - see
 * `NewItemScreen/styles.ts`'s header comment for why this isn't a sheet.
 */
export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.xl,
  },
  linkText: {
    ...typography.valueEmphasis,
    letterSpacing: tracking.valueEmphasis,
    color: colors.textPrimary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.cardPad,
  },
  backButton: {
    marginRight: spacing['3xs'],
  },
  // Sheet-title role (22/400) - `UiTitle`'s own default.
  title: {
    flex: 1,
    textAlign: 'center',
  },

  form: {
    gap: spacing.xl,
  },

  // Image generation state
  imageStateBanner: {
    borderRadius: radius.tileLg,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  imageStateText: {
    ...typography.overflowChip,
    color: colors.textSecondary,
  },
  imageStateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.chipY,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  imageStateButtonText: {
    ...typography.overflowChip,
    color: colors.textPrimary,
  },

  // Photo - spec 6.7: the same 362 x 200 slot as the Add item sheet.
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
  photoOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.scrimSoft,
    borderRadius: radius.round,
    padding: spacing.sm,
  },

  submitButton: {
    marginBottom: spacing['2xl'],
  },
  submitLabel: {
    color: colors.accentText,
  },
});
