import { StyleSheet } from 'react-native';
import { pageInlineIntent, spacing, tracking, typography } from '@/theme/layout';
import { colors } from '@/theme/colors';

// QA-69: the horizontal padding sits on the title bar, the scroll content and
// the footer - not on `content`, which wraps the `ScrollView` and would pull
// its vertical indicator in from the edge.
export const styles = StyleSheet.create({
  content: {
    marginTop: 'auto',
    backgroundColor: colors.surface,
    flexShrink: 1,
  },

  content__fullScreen: {
    flex: 1,
  },

  // Inside the `useModal()` sheet: the sheet's own `colors.sheet` ground shows
  // through, so grabber and body read as one panel (QA-68), not two.
  content__sheet: {
    backgroundColor: 'transparent',
  },

  top_bar: {
    paddingBlock: spacing.gutter,
    paddingInline: pageInlineIntent,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },

  // Full screen: fill what the title bar leaves. In a sheet: hug the content
  // when it is short, shrink and scroll when it is taller than the cap.
  scroll__fullScreen: {
    flexGrow: 1,
    flexShrink: 1,
  },

  scroll__sheet: {
    flexGrow: 0,
    flexShrink: 1,
  },

  scrollContent: {
    paddingInline: pageInlineIntent,
  },

  scrollContent__fullScreen: {
    flexGrow: 1,
  },

  footer: {
    paddingInline: pageInlineIntent,
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
