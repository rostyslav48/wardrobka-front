import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, typography } from '@/theme/layout';

/**
 * Spec section 6.2, the ask block's input row: "flex gap 8: `UiInput` 306 x 51
 * (r10, 1 px `border`) and a 48 x 48 circular send button, ground `accent`,
 * with the 18 px arrow in `accentText`." The pixel heights are section 6
 * layout figures, which snap table 8.5 leaves untokenised.
 */
export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    borderWidth: border.hairline,
    borderColor: colors.border,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
    minHeight: 51,
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
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    // Not a design value - snap table 8.6.
    opacity: 0.4,
  },
});
