import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import {
  border,
  pageInlineIntent,
  radius,
  spacing,
  tracking,
  typography,
} from '@/theme/layout';

const CELL_GAP = spacing.sm;
const LIST_MAX_HEIGHT = Dimensions.get('window').height * 0.52;

export const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
  },
  list: {
    maxHeight: LIST_MAX_HEIGHT,
  },
  header: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: spacing['3xs'],
    paddingBottom: spacing.xl,
    gap: spacing['3xs'],
  },
  // This is a bottom sheet, so its heading is section 4.3's sheet-title role
  // rather than 8.3's by-the-number 17px row. Recorded in 8.8.
  title: {
    ...typography.sheetTitle,
    letterSpacing: tracking.sheetTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },

  grid: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: spacing.xl,
  },
  row: {
    gap: CELL_GAP,
    marginBottom: CELL_GAP,
  },
  cell: {
    flex: 1,
    borderRadius: radius.tile,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: border.hairline,
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
    top: spacing.xs,
    right: spacing.xs,
    // 22 x 22 is box geometry (8.5); the radius is `round` because the badge is
    // a circle by construction, the same reading 8.2 gives its 17/22/28/32 rows.
    width: 22,
    height: 22,
    borderRadius: radius.round,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    ...typography.cardName,
    letterSpacing: tracking.cardName,
    color: colors.textPrimary,
    padding: spacing.xs,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
  },

  confirmButton: {
    marginHorizontal: pageInlineIntent,
    marginTop: spacing['3xs'],
    backgroundColor: colors.accent,
    borderRadius: radius.tileLg,
    paddingVertical: spacing.cardPad,
    alignItems: 'center',
  },
  confirmLabel: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.accentText,
  },
});
