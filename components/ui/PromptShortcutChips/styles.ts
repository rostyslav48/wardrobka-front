import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  // Spec section 6.2 measures the ask block at 107 tall: eyebrow 11, chips 29,
  // input 51, and 8 between each. That 8 is this margin.
  scroll: {
    marginBottom: spacing.sm,
  },
  content: {
    gap: spacing.xs,
    paddingVertical: spacing.hair,
  },
  // 6.2: "each padding 7 / 13, r999, 1 px #262626". No ground - the chips sit
  // on the page.
  chip: {
    paddingHorizontal: spacing.chipX,
    paddingVertical: spacing.chipY,
    borderRadius: radius.pill,
    borderWidth: border.hairline,
    borderColor: colors.hairline,
  },
  // These are the "Ask Wardropka" chips, which spec section 4.3 measures as the
  // ask-chip role rather than 8.3's by-the-number 13px row. Recorded in 8.8.
  chipText: {
    ...typography.chipLabel,
    letterSpacing: tracking.chipLabel,
    color: colors.textPrimary,
  },
});
