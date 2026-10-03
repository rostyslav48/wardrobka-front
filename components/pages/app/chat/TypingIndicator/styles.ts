import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

/**
 * Same bubble treatment as the assistant's `MessageBubble` -
 * `radius.card` / `surfaceRaised`, 4px tail corner left untokenised per
 * snap table 8.2's note on the chat thread. The 7 x 7 dot is 8.2's own
 * "already a circle" row (`radius.round` clamps to the same pixel).
 */
export const styles = StyleSheet.create({
  row: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.card,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.cardPad,
    gap: spacing['2xs'],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.round,
    backgroundColor: colors.textSecondary,
  },
});
