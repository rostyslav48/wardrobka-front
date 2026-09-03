import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec 6.6. `UiPage` owns the 62 top padding, the 20 gutters and the
 * tab-bar clearance of 6.1; the title row's margin-top, the profile block's
 * margin-top and the 24 px dividers between sections are this screen's own
 * figures.
 */
export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginTop: spacing.md,
  },
  profileBlock: {
    marginTop: spacing.sectionLg,
  },
  loader: {
    marginVertical: spacing['3xl'],
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing['2xl'],
  },
  // Spec 4.3's "body" role - "Version 1.0.0" 11.5/400, verbatim.
  version: {
    ...typography.body,
    letterSpacing: tracking.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
});
