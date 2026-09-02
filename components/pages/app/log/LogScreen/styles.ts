import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, typography } from '@/theme/layout';

/**
 * Spec 6.5. `UiPage` owns the 62 top padding, the 20 gutters and the
 * tab-bar clearance of 6.1; the "Add entry" pill (padding 9/13, `radius.pill`)
 * and the list's 18 top margin are this section's own figures.
 */
export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3xs'],
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.smPlus,
    paddingHorizontal: spacing.chipX,
  },
  // Spec 4.3: "'Add entry' pill label" role, verbatim.
  addButtonText: {
    ...typography.pillLabel,
    color: colors.accentText,
  },
  list: {
    marginTop: spacing.section,
  },
});
