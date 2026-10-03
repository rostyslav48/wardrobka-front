import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.3: the item-grid card is a 175 x 150 photo frame
 * (`radius.tileLg`) then a 17px caption row - the name left, the status pill
 * right. The card's rendered width comes from the grid's own column layout
 * (not a fixed 175px), so the frame keeps the spec's aspect ratio instead.
 * Section 2 row "9" is the caption's top margin (`spacing.smPlus`).
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.smPlus,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 175 / 150,
    borderRadius: radius.tileLg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoArea: {
    width: '100%',
    aspectRatio: 175 / 150,
    borderRadius: radius.tileLg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  // Sits over the bottom of the image so a failed regeneration never hides the
  // photo the item still has.
  failedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.scrim,
  },
  failedOverlayText: {
    flexShrink: 1,
    ...typography.chipLabel,
    letterSpacing: tracking.chipLabel,
    color: colors.textPrimary,
  },
  placeholderText: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.hair,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  retryButtonText: {
    ...typography.overflowChip,
    color: colors.textPrimary,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    ...typography.cardName,
    letterSpacing: tracking.cardName,
    color: colors.textPrimary,
  },
});
