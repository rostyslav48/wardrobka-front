import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

const CELL_GAP = 8;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 8,
  },
  list: {
    flex: 1,
  },
  header: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  grid: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: 16,
  },
  row: {
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cellSelected: {
    borderColor: colors.accent,
  },
  image: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textPrimary,
    padding: 6,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  confirmButton: {
    marginHorizontal: pageInlineIntent,
    marginTop: 4,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentText,
  },
});
