import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
    paddingVertical: spacing.hair,
  },
  chip: {
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.smPlus,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  // These are the "Ask Wardropka" chips, which spec section 4.3 measures as the
  // ask-chip role rather than 8.3's by-the-number 13px row. Recorded in 8.8.
  chipText: {
    ...typography.chipLabel,
    letterSpacing: tracking.chipLabel,
    color: colors.textPrimary,
  },
});
