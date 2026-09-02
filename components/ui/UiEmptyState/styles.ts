import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // Snap table 8.1 records the 40 as having no section 2 row; it is re-derived
    // from section 6 when the empty-state screens land.
    paddingVertical: 40,
    gap: spacing.lg,
  },
  iconWrapper: {
    // 64 x 64 is box geometry (8.5); 8.2 reads its radius as a circle.
    width: 64,
    height: 64,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
});
