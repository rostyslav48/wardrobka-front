import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  // QA-23: this was `justifyContent: 'center'` with `height: '100%'`, so
  // every time an error line or the server-error banner appeared/disappeared
  // the taller/shorter content re-centred, jumping the whole form by
  // 15-20 pt. Anchoring from the top instead keeps everything above the
  // error in a fixed position; `paddingTop` approximates where centred
  // content used to land at the form's usual (no-error) height.
  container: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: spacing.statusBar + spacing['3xl'],
  },
  // 30 - not on the redesign scale (spacing tops out at spacing['3xl']=28
  // below spacing.statusBar=62). This screen was never restyled onto the
  // scale (Phase 7 explicitly left it as a regression-check only), so the
  // literal is kept verbatim rather than snapped to a nearby token.
  title: {
    marginBottom: 30,
  },
  formContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  switchButton: {
    marginTop: spacing.sm,
  },
  // fontSize 16 / weight 'bold' - not on the typography scale (nearest role,
  // `typography.button`, is 18/600). Same "never restyled" reasoning as
  // `title` above.
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: spacing.rowY,
    color: colors.textSecondary,
    // fontSize 14 / weight '500' with no lineHeight: this matches
    // `typography.valueEmphasis`'s size/weight, but that role also pins
    // lineHeight:15, which this text never had (it was RN's default auto
    // line height). Spreading the role would tighten the line box and
    // change rendered height, so only the exact-value spacing swap above
    // is applied and these two stay bare literals.
    fontSize: 14,
    fontWeight: '500',
  },
});
