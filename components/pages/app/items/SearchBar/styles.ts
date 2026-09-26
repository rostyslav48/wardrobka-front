import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, fontFamily, iconSize, radius, spacing, typography } from '@/theme/layout';

/**
 * Spec section 6.3: "UiInput 304 x 51 (r10, 1px border)". Snap table 8.1's
 * "35" row gives the left inset for the leading icon as
 * `spacing.cardPad + iconSize.mdPlus` (30) once this field is rebuilt against
 * section 6.3 - this is that rebuild. 51 is section-6 box geometry (8.5).
 */
export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: border.hairline,
    borderColor: colors.border,
    borderRadius: radius.control,
    minHeight: 51,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.cardPad,
    paddingLeft: spacing.cardPad + iconSize.mdPlus,
    fontFamily: fontFamily.body,
    fontSize: typography.rowLabel.fontSize,
  },
  icon: {
    position: 'absolute',
    left: spacing.cardPad,
  },
});
