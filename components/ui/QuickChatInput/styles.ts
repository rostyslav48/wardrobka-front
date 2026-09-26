import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, fontFamily, radius, spacing, typography } from '@/theme/layout';

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
    fontFamily: fontFamily.body,
    fontSize: typography.rowLabel.fontSize,
    color: colors.textPrimary,
    padding: 0,
    maxHeight: 100,
  },
  // QA-26: this used to be `accent` always, with a 0.4-opacity "disabled"
  // overlay - enabled and disabled read as the same button. Matches
  // `ChatInputBar`'s send button now: muted by default, `accent` once
  // there's text to send.
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.accent,
  },
});
