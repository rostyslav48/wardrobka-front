import { StyleSheet } from 'react-native';
import { radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.3 / 7.3: the status pill - padding 2/6, `radius.pill`, ground
 * the status colour at 13.3% (the `status*Soft` keys), label 9.5/600 ls 0.57
 * in the status colour (`typography.statusLabel`).
 */
export const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.hair,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.statusLabel,
    letterSpacing: tracking.statusLabel,
  },
});
