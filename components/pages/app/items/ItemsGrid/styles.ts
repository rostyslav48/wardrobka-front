import { StyleSheet } from 'react-native';
import { spacing } from '@/theme/layout';

/** Spec section 6.3: item grid, margin-top 16 (`ItemsScreen` owns that), `gap 12`. */
export const styles = StyleSheet.create({
  grid: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  cell: {
    flex: 1,
  },
});
