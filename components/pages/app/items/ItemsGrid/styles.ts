import { StyleSheet } from 'react-native';
import { pageInlineIntent } from '@/theme/layout';
import { colors } from '@/theme/colors';

export const GRID_GAP = 12;

export const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  columnWrapper: {
    gap: GRID_GAP,
    paddingHorizontal: pageInlineIntent,
  },
  contentContainer: {
    gap: GRID_GAP,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
    paddingHorizontal: pageInlineIntent,
  },
  skeletonContainer: {
    gap: GRID_GAP,
    paddingBottom: 100,
  },
});
