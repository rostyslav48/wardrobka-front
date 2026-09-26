import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, fontFamily, radius, spacing, tracking, typography } from '@/theme/layout';

/**
 * Spec section 6.7's bottom-sheet body: sections separated by `spacing.sheetSection`
 * (26). The chip row itself (padding 6/11, `radius.pill`) is the sheet preamble's
 * own figure, not a table 8 literal - `spacing.xs`/`spacing.mdPlus` are the nearest
 * scale entries and match exactly (6 and 11).
 */
export const styles = StyleSheet.create({
  // The last section keeps the section gap (`sheetSection`) above the footer
  // it used to sit next to, now that the footer is pinned outside the scroll
  // body (QA-67).
  content: {
    gap: spacing.sheetSection,
    paddingBottom: spacing.sheetSection,
  },

  section: {
    gap: spacing.md,
  },

  // Spec 4.3's section-eyebrow role names "TYPE" among the strings it covers.
  sectionLabel: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },

  // Chip row (seasons, statuses)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Horizontal scroll chip row (types)
  chipScroll: {
    gap: spacing.sm,
  },

  chip: {
    paddingHorizontal: spacing.mdPlus,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: border.hairline,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },

  chip__active: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  // Snap table 8.7: same untokenised native role `UiSelect`'s own chip label
  // carries (13/500 textSecondary) - this chip is the same design.
  chipText: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },

  // Spec 4.3: "12/600 accentText - selected filter-chip label".
  chipText__active: {
    ...typography.chipLabelSelected,
    letterSpacing: tracking.chipLabelSelected,
    color: colors.accentText,
  },

  // Colour swatches - spec 6.7: 30 x 30 circles (`radius.round`), ringed. RN has
  // no multi-ring `box-shadow`, so the ring is approximated with a 34 x 34
  // wrapper: an unselected hairline ring, a 2px `brand` ring when selected.
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

  swatchAny: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    borderWidth: border.hairline,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  swatchAny__active: {
    borderColor: colors.textPrimary,
  },

  // Spec 4.3: "'Any' swatch label" role, verbatim.
  swatchAnyText: {
    ...typography.swatchLabel,
    letterSpacing: tracking.swatchLabel,
    color: colors.textSecondary,
  },

  // Favourite toggle row
  favouriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Not a heading - the settings-row label role (14/400).
  favouriteLabel: {
    ...typography.rowLabel,
    letterSpacing: tracking.rowLabel,
    color: colors.textPrimary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  footerButtonWrapper: {
    flex: 1,
  },

  // Spec 6.7: "two 176 x 50 buttons". `UiButton` only accepts `style`
  // overrides (section 7.4), which is spec-sanctioned per 6.2's own hero
  // buttons.
  // QA-73: a floor, not a fixed height - at the accessibility text sizes the
  // label's line outgrew the fixed 50 and was clipped. The vertical padding
  // is one hairline under `UiButton`'s 15 so that the secondary button's
  // border fits too: at the default size its 20 pt label line + 2 x 14 + 2 x 1
  // is exactly 50, and the borderless primary (48 of content) is held at 50
  // by the floor with its label centred where it was. `flexGrow` keeps both
  // buttons the same height when only one label wraps.
  footerButton: {
    minHeight: 50,
    paddingVertical: spacing.rowY - border.hairline,
    flexGrow: 1,
    justifyContent: 'center',
  },

  buttonLabel__primary: {
    color: colors.accentText,
  },

  buttonLabel__secondary: {
    color: colors.textPrimary,
  },
});
