import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.rowY,
    marginTop: spacing.md,
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: border.hairline,
    borderRadius: radius.card,
  },
  message: {
    ...typography.valueEmphasis,
    letterSpacing: tracking.valueEmphasis,
    color: colors.error,
    flexShrink: 1,
  },
  retry: {
    paddingVertical: spacing['3xs'],
    paddingHorizontal: spacing.sm,
  },
  retryLabel: {
    ...typography.valueEmphasis,
    color: colors.textPrimary,
  },
});
