import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec 6.4: "one row per session at padding 15 / 2 ... Rows are separated by
 * 1 px hairlines, not cards." Title is the `sessionTitle` role (14.5/500);
 * preview and date share the `body` role (11.5/400) spec 4.3 names for
 * "chat preview" verbatim.
 */
export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.rowY,
    paddingHorizontal: spacing.hair,
    gap: spacing.lg,
    borderBottomWidth: border.hairline,
    borderBottomColor: colors.hairline,
    // Opaque, so the swipe's Delete action stays hidden behind a closed row.
    backgroundColor: colors.background,
  },
  // QA-35: the action a left swipe reveals. No spec surface; uses the app's
  // destructive colour and the row's own body type role.
  deleteAction: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.micro,
    backgroundColor: colors.statusMissing,
  },
  deleteLabel: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textPrimary,
  },
  body: {
    flex: 1,
    gap: spacing.micro,
  },
  topic: {
    ...typography.sessionTitle,
    letterSpacing: tracking.sessionTitle,
    color: colors.textPrimary,
  },
  preview: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
  },
  date: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
    flexShrink: 0,
  },
});
