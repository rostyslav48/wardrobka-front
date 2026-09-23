import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec 6.6: "NOTIFICATIONS" 10/600 eyebrow, "Daily reminder" row (label
 * 14/400, help 11.5/400), "Time" row value 14/500 `brand`. The blocked-notice
 * card and its link have no mockup surface - extrapolated onto the same
 * `surface` ground `UiButton secondary` uses elsewhere.
 */
export const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  rowLabel: {
    flex: 1,
    gap: spacing.hair,
  },
  label: {
    ...typography.rowLabel,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },
  timeValue: {
    ...typography.valueEmphasis,
    color: colors.brand,
  },
  // QA-55: placeholder for a `row` while prefs/permission load - same
  // approximate height as a label+hint row with a switch, so the section
  // doesn't grow once real content replaces it.
  rowSkeleton: {
    height: 44,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  blockedNotice: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  link: {
    ...typography.rowLabel,
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
});
