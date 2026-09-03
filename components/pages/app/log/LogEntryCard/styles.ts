import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec 6.5: card padding 14 (`radius.card`, 1px `hairline`, ground
 * `surfaceRaised`); date header is the "log date header" role (10/600
 * textPrimary, distinct from the generic eyebrow's textSecondary); overflow
 * tile is the "+2 overflow chip" role; the note is the "body" role spec
 * 4.3 names for "log summary" verbatim.
 */
export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.card,
    borderWidth: border.hairline,
    borderColor: colors.hairline,
    padding: spacing.cardPad,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textPrimary,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.mdPlus,
  },
  thumb: {
    flex: 1,
    height: 84,
    borderRadius: radius.tile,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    ...typography.overflowChip,
    color: colors.textPrimary,
  },
  note: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
