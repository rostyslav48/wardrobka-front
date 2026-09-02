import { StyleSheet } from 'react-native';
import { pageInlineIntent, spacing, tracking, typography } from '@/theme/layout';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  content: {
    paddingInline: pageInlineIntent,
    marginTop: 'auto',
    backgroundColor: colors.surface,
    flexShrink: 1
  },

  content__fullScreen: {
    flex: 1,
  },

  top_bar: {
    paddingBlock: spacing.gutter,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },

  // Spec section 4.3's sheet-title role ("Filters", "Add item", "Edit entry"),
  // which is what this bar always carries. Snap table 8.8 records the deviation
  // from 8.3's by-the-number 20px row.
  title: {
    ...typography.sheetTitle,
    letterSpacing: tracking.sheetTitle,
    color: colors.textPrimary
  },
});
