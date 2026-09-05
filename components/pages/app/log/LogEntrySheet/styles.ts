import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, pageInlineIntent, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.7's shared bottom-sheet shell, applied to the one sheet in
 * this phase that stays a raw `Modal` rather than `UiPopup` (it needs a
 * second sub-view, a reanimated slide-up and a `KeyboardAvoidingView` that
 * `UiPopup` doesn't offer): scrim `colors.scrim`, sheet ground `colors.sheet`,
 * `radius.sheet` on the top corners only, a 36 x 4 grabber, header padding
 * 10/20/12/20 with a 30 x 30 circular close button, body padding 18/20/28/20
 * with `spacing.sheetSection` between sections. The "Log entry" sub-pattern
 * (6.7's third bullet) supplies the DATE/ITEMS/NOTES section vocabulary.
 */
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    maxHeight: '88%',
  },
  // Snap table 8.7: §3 maps both 1 and 2px radii to `radius.hair`, whose
  // token carries 1 - so the grabber's authored r2 renders at 1px here.
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.hair,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pageInlineIntent,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.sheetTitle,
    letterSpacing: tracking.sheetTitle,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.body,
    letterSpacing: tracking.body,
    color: colors.textSecondary,
    marginTop: spacing.hair,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
    borderWidth: border.hairline,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formContent: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: spacing.lg,
    gap: spacing.sheetSection,
  },

  section: {
    gap: spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Spec 4.3's section-eyebrow role names "DATE" among the strings it covers.
  sectionLabel: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  // Spec 4.3: "actionable eyebrow - 'CLEAR ALL', 'CHANGE'" (10/600 ls 1.4 `brand`).
  changeLink: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.brand,
    textTransform: 'uppercase',
  },

  iosPicker: {
    marginHorizontal: -pageInlineIntent,
    height: 160,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.cardPad,
  },
  // Spec 4.3: "settings row label, log-sheet date value" role, verbatim.
  dateButtonText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textPrimary,
  },

  loadingText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
  },
  selectedRow: {
    gap: spacing.sm,
    paddingVertical: spacing['3xs'],
  },
  selectedThumb: {
    width: 60,
    alignItems: 'center',
    gap: spacing['3xs'],
  },
  selectedThumbImage: {
    width: 60,
    height: 90,
    borderRadius: radius.tile,
  },
  selectedThumbPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: radius.tile,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThumbName: {
    ...typography.meta,
    color: colors.textSecondary,
    textAlign: 'center',
    width: 60,
  },
  // Spec 6.7: the one dashed control in the design - 88 tall, `radius.control`,
  // 1px dashed `hairlineDashed`, a 16px plus centred. Re-derived here for the
  // "no items yet" state; the log-entry grid's own dashed "add another" cell
  // is `ItemPickerSheet`'s, out of this component's scope.
  emptyItemsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    paddingVertical: spacing.cardPad,
    paddingHorizontal: spacing.cardPad,
    borderWidth: border.hairline,
    borderColor: colors.hairlineDashed,
    borderStyle: 'dashed',
  },
  emptyItemsText: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textSecondary,
  },

  // Spec 4.3's "log-entry notes textarea" role: 16/400, native family - left
  // untokenised, the one text role the mockup keeps on the system font.
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.control,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.cardPad,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 80,
  },

  errorText: {
    ...typography.overflowChip,
    color: colors.error,
    textAlign: 'center',
  },

  // Snap table 8.2: the pre-existing 12px radius here maps to `radius.tileLg`,
  // not `radius.control` - the sweep found no separate 12px button role.
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.tileLg,
    paddingVertical: spacing.cardPad,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    // Not a design value - snap table 8.6.
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.accentText,
  },

  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  deleteButtonText: {
    ...typography.valueEmphasis,
    color: colors.error,
  },
});
