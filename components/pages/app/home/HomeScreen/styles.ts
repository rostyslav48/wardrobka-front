import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, tracking, typography } from '@/theme/layout';

/**
 * Home, spec section 6.2. `UiPage` owns the 62 px top padding, the 20 px
 * gutters and the tab-bar clearance of section 6.1, so everything here is the
 * vertical rhythm between the screen's own blocks. Every value is a
 * `theme/layout` token; the deviations from snap table 8.3 are recorded in
 * section 8.9 of the spec.
 */
export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // The greeting has no 6.2 counterpart - it stands where 6.1 puts the
  // masthead - so its trailing gap takes 6.2's own inter-block rhythm.
  greetingSection: {
    gap: spacing['3xs'],
    marginBottom: spacing.section,
  },
  // Section 8.3 sends the old 15 px subtitle to the 14 px `rowLabel` row.
  greetingSubtitle: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
  },
  // 6.2 item 2: the ask block sits 18 below what precedes it.
  askSection: {
    marginTop: spacing.section,
  },
  // 6.2 item 3: recent suggestions at margin-top 20. The trailing 8 is the
  // scroll region's own bottom padding from 6.1.
  recentSection: {
    marginTop: spacing.gutter,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  // 4.3's section-eyebrow role - "ASK WARDROPKA" and "RECENT SUGGESTIONS" are
  // two of the strings that row names.
  sectionEyebrow: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  // 4.3 measures "SEE ALL ->" as 10 / 500, ls 1.0, `textPrimary` - the same
  // triple as the `dateChip` role at a different colour.
  seeAll: {
    ...typography.dateChip,
    letterSpacing: tracking.dateChip,
    color: colors.textPrimary,
  },
});
