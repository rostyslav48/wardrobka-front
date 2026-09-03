import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.4. `UiPage` owns the 62 top padding, the 20 gutters and the
 * tab-bar clearance of 6.1; the list's own 16 top margin and 1 px top border
 * are this section's figures.
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
  // Spec 4.3's section-eyebrow role names "6 SESSIONS" verbatim.
  sessionCount: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  list: {
    marginTop: spacing.xl,
    borderTopWidth: border.hairline,
    borderTopColor: colors.hairline,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
  },
  errorText: {
    ...typography.rowLabel,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing['3xs'],
  },
  retryLabel: {
    ...typography.valueEmphasis,
    color: colors.textPrimary,
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
    // Not design values - snap table 8.6.
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
