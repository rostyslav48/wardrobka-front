import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * The mockup has no calendar-management surface at all (spec 7.2 only
 * documents Notifications for this screen) - extrapolated onto the same
 * eyebrow-title / row-label / body-hint shape as `NotificationsSection`, and
 * the same `surface`-ground action button `UiButton secondary` uses.
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
    gap: spacing['3xs'],
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
  button: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  // QA-04: the only other visible cue while `connect()`/`disconnect()` is
  // pending - not a design value, snap table 8.6.
  buttonBusy: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.valueEmphasis,
    color: colors.textPrimary,
  },
});
