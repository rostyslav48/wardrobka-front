import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.cardSm,
    borderWidth: border.hairline,
    borderColor: colors.border,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
    // Box geometry - snap table 8.5.
    minHeight: 46,
    justifyContent: 'center',
  },
  input: {
    // Size only: a `lineHeight` on a multiline `TextInput` clips descenders.
    fontSize: typography.rowLabel.fontSize,
    color: colors.textPrimary,
    padding: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: radius.cardSm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    // Not a design value - snap table 8.6.
    opacity: 0.4,
  },
});
