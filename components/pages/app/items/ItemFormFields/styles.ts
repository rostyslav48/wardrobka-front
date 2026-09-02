import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.7's Add/Edit item sheet: "REQUIRED"/"OPTIONAL" eyebrow
 * sections over `UiFormField` + `UiInput`/`UiSelect`. Field labels are the
 * 11/500 ls 1.1 `fieldLabel` role, spec section 4.3, named verbatim ("Type",
 * "Colour", "Season").
 */
export const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  optionalLabel: {
    marginTop: spacing.sm,
  },
  fieldLabel: {
    ...typography.fieldLabel,
    letterSpacing: tracking.fieldLabel,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  // Spec 6.7: "30 x 30 circular swatches (r15), each ringed". RN has no
  // multi-ring box-shadow - approximated with a 34 x 34 wrapper ring, same as
  // `FiltersPopup`'s colour row.
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchRing: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: border.hairline,
    borderColor: colors.border,
  },
  swatchRing__active: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: radius.round,
  },
  favouriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3xs'],
  },
  favouriteLabel: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textPrimary,
  },
});
