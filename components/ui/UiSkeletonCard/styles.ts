import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

/**
 * The loading stand-in for `OutfitSuggestionCard`, so its box matches that card
 * exactly. The bar widths and heights are box geometry (snap table 8.5): they
 * mirror the text rows they stand in for and carry no token.
 */
export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  topicLine: {
    width: 80,
    height: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  thumb: {
    width: 70,
    height: 105,
    borderRadius: radius.tile,
    backgroundColor: colors.border,
  },
  summaryLine1: {
    width: '100%',
    height: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  summaryLine2: {
    width: '70%',
    height: 13,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dateLine: {
    alignSelf: 'flex-end',
    width: 48,
    height: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
});
