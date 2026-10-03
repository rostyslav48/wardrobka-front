import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, fontFamily, pageInlineIntent, radius, spacing, typography } from '@/theme/layout';

/**
 * Spec 7.2: compose with the Home ask-input verbatim (`QuickChatInput`'s own
 * `r10` 51px field + 48px `r24` accent send button); the context-picker
 * button and selected-item chip row are this screen's own addition, not in
 * the mockup, so they borrow the same chip vocabulary `ChatInputBar` already
 * used pre-redesign.
 */
export const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: border.hairline,
    borderTopColor: colors.hairline,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
    paddingHorizontal: pageInlineIntent,
    gap: spacing.sm,
  },

  // Context chips
  chipsScroll: {
    flexGrow: 0,
  },
  chipsContent: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2xs'],
    maxWidth: 160,
  },
  chipLabel: {
    ...typography.chipLabel,
    color: colors.textPrimary,
    flexShrink: 1,
  },

  // Input row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.hair,
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
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    // Size only: a `lineHeight` on a multiline `TextInput` clips descenders.
    fontFamily: fontFamily.body,
    fontSize: typography.rowLabel.fontSize,
    color: colors.textPrimary,
    padding: 0,
  },
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
