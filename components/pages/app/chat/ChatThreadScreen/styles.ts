import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, pageInlineIntent, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * No spec surface (7.2: "genuinely absent"). Reuses the chat-row type ramp
 * that role already names - `sessionTitle` for the header title, `body` for
 * empty-state text - and the page gutter everywhere else already uses.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    paddingVertical: spacing.cardPad,
    borderBottomWidth: border.hairline,
    borderBottomColor: colors.hairline,
    gap: spacing.sm,
  },
  backButton: {
    marginRight: spacing['3xs'],
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 28, // mirrors the back-button glyph box for centering
  },

  // Messages
  messageList: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },

  // Empty / loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: pageInlineIntent,
  },
  emptyTitle: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Error toast
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: pageInlineIntent,
    marginBottom: spacing.sm,
    backgroundColor: colors.errorBackground,
    borderRadius: radius.control,
    paddingHorizontal: spacing.cardPad,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    ...typography.overflowChip,
    color: colors.error,
  },
});
