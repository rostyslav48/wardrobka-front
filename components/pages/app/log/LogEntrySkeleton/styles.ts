import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.cardPad,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dateBar: {
    height: 16,
    width: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.mdPlus,
  },
  thumb: {
    flex: 1,
    height: 84,
    borderRadius: radius.tile,
    backgroundColor: colors.border,
  },
  noteBar: {
    height: 12,
    width: '60%',
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
});
