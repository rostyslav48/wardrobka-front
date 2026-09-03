import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing, typography } from '@/theme/layout';

/**
 * Spec 7.2: "Bubbles, if any, take `radius.card` and `surfaceRaised`; do not
 * invent a second accent." The user bubble keeps the existing `accent`
 * ground; the assistant bubble moves from `surface` to `surfaceRaised`. The
 * 4px tail-corner radius is snap table 8.2's one explicit non-arbitration -
 * "the mockup has no message thread, so this is the one radius §3 cannot
 * arbitrate" - and stays a bare literal rather than guessing a token for it.
 */
export const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.lg,
    maxWidth: '80%',
    gap: spacing['3xs'],
  },
  rowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  bubble: {
    borderRadius: radius.card,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surfaceRaised,
    borderBottomLeftRadius: 4,
  },

  // `rowLabel`'s fontSize/fontWeight apply per snap table 8.3, but its 15px
  // lineHeight is measured for a single-line list row, not wrapped prose -
  // spec §7.2 has no chat-thread mockup surface to borrow a leading value
  // from, so the role's lineHeight is not transcribable here. Overridden to
  // a readable ~1.43 ratio (matches the pre-redesign bubble's 21/15 ratio)
  // so multi-line replies don't collide ascenders/descenders between lines.
  content: {
    ...typography.rowLabel,
    lineHeight: 20,
  },
  contentUser: {
    color: colors.accentText,
  },
  contentAssistant: {
    color: colors.textPrimary,
  },

  time: {
    ...typography.meta,
    color: colors.textSecondary,
    marginHorizontal: spacing['3xs'],
  },
  timeUser: {
    // inherits from time
  },
  timeAssistant: {
    // inherits from time
  },
});
