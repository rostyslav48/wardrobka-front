import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
    borderWidth: border.hairline,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },

  chip__active: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  // Snap table 8.7: the option label is one of the six roles the mockup leaves
  // on the React Native default family, so its 13/500 stays component-owned.
  // Tokenising it would change a design the mockup never made.
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },

  chipText__active: {
    color: colors.accentText,
  },
});
