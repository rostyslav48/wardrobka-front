import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: border.hairline,
    borderColor: colors.border,
    borderRadius: radius.control,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    padding: spacing.rowY,
    // Size only, not the whole role: a `lineHeight` on a React Native
    // `TextInput` clips the caret and the last descender on Android.
    fontSize: typography.rowLabel.fontSize,
  },
  icon: {
    paddingRight: spacing.rowY,
  },
  container__readonly: {
    borderColor: colors.surface,
    backgroundColor: colors.surface,
  },
  container__focused: {
    borderColor: colors.brand,
  },
  container__error: {
    borderColor: colors.error,
  },
  input__readonly: {
    color: colors.textSecondary,
  },
});
