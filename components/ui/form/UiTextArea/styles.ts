import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, fontFamily, radius, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  input: {
    borderWidth: border.hairline,
    borderColor: colors.border,
    borderRadius: radius.control,
    padding: spacing.rowY,
    // Snap table 8.7: section 4.3's only 16px row is this native textarea, and
    // it stays component-owned. `minHeight` is box geometry (8.5), not a scale
    // value.
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
