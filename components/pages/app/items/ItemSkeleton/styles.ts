import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

/** Mirrors `ItemCard/styles.ts`'s shape - spec section 6.3. */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.smPlus,
  },
  photo: {
    width: '100%',
    aspectRatio: 175 / 150,
    borderRadius: radius.tileLg,
    backgroundColor: colors.surface,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  nameLine: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flex: 1,
  },
  badgeLine: {
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    width: 56,
  },
});
