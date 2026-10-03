import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.gutter,
    right: spacing.gutter,
    borderRadius: radius.control,
    paddingVertical: spacing.cardPad,
    paddingHorizontal: spacing.section,
    // Not a design value - snap table 8.6.
    zIndex: 100,
  },
  container__success: {
    backgroundColor: colors.statusActive,
  },
  container__error: {
    backgroundColor: colors.error,
  },
  text: {
    ...typography.valueEmphasis,
    letterSpacing: tracking.valueEmphasis,
    // Was a hardcoded #FFFFFF. Spec section 1.1 records no pure white anywhere
    // in the mockup; `textPrimary` (#F0F0F0) is the palette's light-on-dark ink
    // and reads the same on both toast grounds.
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
