import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { iconSize, radius, spacing } from '@/theme/layout';

/**
 * Four of this component's text roles are the ones snap table 8.7 deliberately
 * leaves untokenised - section 4.3 measures them on the React Native default
 * family because the mockup never restyled this card. Their literals stay, and
 * are marked below.
 */
export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Reserves the delete glyph's box so a card without a topic keeps its rhythm.
    minHeight: iconSize.mdPlus,
  },
  // 8.7: component-owned role (11 / 600, ls 0.6).
  topic: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginRight: spacing.sm,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  // 70 x 105 is spec section 3 row 8 - already correct, and box geometry (8.5).
  thumb: {
    width: 70,
    height: 105,
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
    width: 70,
    height: 105,
    borderRadius: radius.tile,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 8.7: component-owned role (14 / 700).
  overflowText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // 8.7: component-owned role (14 / 400, line-height 20).
  summary: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  namesRow: {
    gap: 0,
    flexDirection: 'row',
  },
  // 8.7: component-owned role (12 / 500) - the caption row and the date read as
  // one row in the computed-style sweep, so both stay.
  itemName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  itemNameDeleted: {
    color: colors.border,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
