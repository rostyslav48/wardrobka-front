import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.3. `UiPage` owns the 62 top padding, the 20 gutters and the
 * tab-bar clearance of 6.1; everything here is 6.3's own rhythm. The 50 x 50
 * filter button and the 25 x 17 badge are section-6 box geometry (8.5), not
 * scale tokens - `radius.badge` (9) is the one figure that does land on the
 * table.
 */
export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  // Spec 4.3's section-eyebrow role names "54 ITEMS" verbatim.
  itemCount: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.cardPad,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 24,
    borderWidth: border.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 25,
    height: 17,
    paddingHorizontal: spacing.hair,
    borderRadius: radius.badge,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    ...typography.badgeNumeral,
    letterSpacing: tracking.badgeNumeral,
    color: colors.accentText,
  },
  appliedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  appliedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.mdPlus,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  appliedChipText: {
    ...typography.chipLabelApplied,
    letterSpacing: tracking.chipLabelApplied,
    color: colors.textPrimary,
  },
  // Spec 4.3: "actionable eyebrow - 'CLEAR ALL', 'CHANGE'" (10/600 ls 1.4 `brand`).
  clearAll: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.brand,
  },
  grid: {
    marginTop: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.gutter,
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Not design values - snap table 8.6. `'black'`, not a hex string.
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
