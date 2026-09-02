import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: spacing.rowY,
    borderRadius: radius.control,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  button__secondary: {
    backgroundColor: 'transparent',
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
});
