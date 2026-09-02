import type { TextStyle } from 'react-native';

/**
 * The redesign scale. Every value here is transcribed from
 * `.design-sync/redesign-spec.md` sections 2-4 - the computed-style sweep of the
 * Wardropka artboard. Nothing is rounded to a "nicer" number, and nothing is
 * invented: section 8 of that document maps each existing style literal onto the
 * token that replaces it.
 */

/**
 * Spacing - spec section 2. Key names are the "Proposed token" column of that
 * table, so `spacing.lg` reads back to the 12 px card rhythm row.
 */
export const spacing = {
  hair: 2,
  micro: 3,
  '3xs': 4,
  '2xs': 5,
  xs: 6,
  chipY: 7,
  sm: 8,
  smPlus: 9,
  md: 10,
  mdPlus: 11,
  lg: 12,
  chipX: 13,
  cardPad: 14,
  rowY: 15,
  xl: 16,
  section: 18,
  gutter: 20,
  sectionLg: 22,
  '2xl': 24,
  sheetSection: 26,
  '3xl': 28,
  statusBar: 62,
  tabBarClearance: 96,
} as const;

/**
 * Radius - spec section 3. `pill` and `round` share the value 999 on purpose:
 * every 13/15/24/28 px radius in the sweep is a stadium or a circle *by
 * construction* (the artboard authored `border-radius: 50%` or 999 and the
 * browser reported half the box), and React Native clamps 999 to half the box
 * the same way. `tile`, `tileLg` and `photo` are the `<image-slot radius="N">`
 * values that live in shadow DOM and never reach a computed-style sweep; they
 * are recorded in prose under the section 3 table.
 */
export const radius = {
  hair: 1,
  dot: 3,
  badge: 9,
  control: 10,
  tile: 10,
  tileLg: 12,
  cardSm: 14,
  photo: 14,
  card: 16,
  sheet: 24,
  pill: 999,
  round: 999,
} as const;

/**
 * Type - spec section 4.3, one entry per text role the artboard renders in
 * Archivo or Newsreader. Roles the mockup leaves on the React Native default
 * family (`-apple-system` in the sweep) are deliberately absent: pinning them
 * would change a design the mockup never restyled.
 *
 * `lineHeight` is the measured value where section 4.3 records one. Where it
 * records `normal`, the value is `round(fontSize x normalFactor)` using the
 * shipped font's own vertical metrics - Archivo 1.088 ((878 + 210) / 1000),
 * Newsreader 1.000 ((1470 + 530) / 2000). Section 8.3 lists both derivations.
 */
export const typography = {
  // Newsreader 400
  screenTitle: { fontSize: 28, fontWeight: '400', lineHeight: 32 },
  hero: { fontSize: 26, fontWeight: '400', lineHeight: 30 },
  sheetTitle: { fontSize: 22, fontWeight: '400', lineHeight: 22 },

  // Archivo
  statNumeral: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  button: { fontSize: 18, fontWeight: '600', lineHeight: 20 },
  sessionTitle: { fontSize: 14.5, fontWeight: '500', lineHeight: 16 },
  rowLabel: { fontSize: 14, fontWeight: '400', lineHeight: 15 },
  valueEmphasis: { fontSize: 14, fontWeight: '500', lineHeight: 15 },
  overflowChip: { fontSize: 13, fontWeight: '600', lineHeight: 14 },
  pillLabel: { fontSize: 12.5, fontWeight: '600', lineHeight: 14 },
  cardName: { fontSize: 12.5, fontWeight: '500', lineHeight: 16 },
  chipLabel: { fontSize: 12, fontWeight: '500', lineHeight: 13 },
  chipLabelSelected: { fontSize: 12, fontWeight: '600', lineHeight: 13 },
  slotCaption: { fontSize: 11.5, fontWeight: '400', lineHeight: 15 },
  body: { fontSize: 11.5, fontWeight: '400', lineHeight: 13 },
  chipLabelApplied: { fontSize: 11.5, fontWeight: '500', lineHeight: 13 },
  wordmark: { fontSize: 11, fontWeight: '600', lineHeight: 12 },
  avatarInitials: { fontSize: 11, fontWeight: '600', lineHeight: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '500', lineHeight: 12 },
  temperature: { fontSize: 11, fontWeight: '500', lineHeight: 12 },
  eyebrow: { fontSize: 10, fontWeight: '600', lineHeight: 11 },
  dateChip: { fontSize: 10, fontWeight: '500', lineHeight: 11 },
  meta: { fontSize: 10, fontWeight: '500', lineHeight: 11 },
  matchScore: { fontSize: 10, fontWeight: '500', lineHeight: 11 },
  badgeNumeral: { fontSize: 10, fontWeight: '700', lineHeight: 11 },
  statusLabel: { fontSize: 9.5, fontWeight: '600', lineHeight: 10 },
  tabLabel: { fontSize: 9, fontWeight: '600', lineHeight: 10 },
  statLabel: { fontSize: 9, fontWeight: '500', lineHeight: 10 },
  swatchLabel: { fontSize: 9, fontWeight: '600', lineHeight: 10 },
} as const satisfies Record<string, TextStyle>;

/**
 * Letter-spacing in px, keyed by the same roles as `typography` - the `ls`
 * column of spec section 4.3. It is a separate export so that every
 * `typography` entry stays a clean `fontSize` / `fontWeight` / `lineHeight`
 * triple.
 */
export const tracking = {
  screenTitle: -0.3,
  hero: -0.2,
  sheetTitle: 0,
  statNumeral: 0,
  button: 0,
  sessionTitle: 0.145,
  rowLabel: 0,
  valueEmphasis: 0,
  overflowChip: 0,
  pillLabel: 0,
  cardName: 0.125,
  chipLabel: 0.12,
  chipLabelSelected: 0,
  slotCaption: 0.115,
  body: 0.115,
  chipLabelApplied: 0,
  wordmark: 1.76,
  avatarInitials: 0,
  fieldLabel: 1.1,
  temperature: 0.66,
  eyebrow: 1.4,
  dateChip: 1,
  meta: 0.8,
  matchScore: 1.6,
  badgeNumeral: 0,
  statusLabel: 0.57,
  tabLabel: 1.08,
  statLabel: 0.9,
  swatchLabel: 0,
} as const satisfies Record<keyof typeof typography, number>;

/**
 * Families - spec section 4.4. Neither ships in `assets/fonts/` yet; the phase
 * that lands typography has to add both before these resolve to anything but
 * the platform fallback.
 */
export const fontFamily = {
  display: 'Newsreader',
  body: 'Archivo',
} as const;

/**
 * Borders - spec section 3, closing note: "Border widths are uniform: 1 px
 * solid everywhere, plus one 1 px dashed". There is no second width in the
 * mockup, so there is no second token.
 */
export const border = {
  hairline: 1,
} as const;

/**
 * Icon sizes - spec section 5, the `Size` column. The chevron is the one
 * non-square glyph (7 x 12); it draws inside the `sm` box.
 */
export const iconSize = {
  xxs: 8,
  xs: 10,
  sm: 12,
  smPlus: 13,
  md: 14,
  mdPlus: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
} as const;

/**
 * The page gutter. Kept as a bare number export because six files already
 * import it by this name and `--wa-page-inline-intent` is published in
 * `conventions.md`, the `ds-bundle` README and every artboard on the canvas.
 * Equal to `spacing.gutter`; spec section 2 confirms the mockup uses 20.
 */
export const pageInlineIntent = 20;
