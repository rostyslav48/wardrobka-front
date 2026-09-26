import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { fontFamily, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    gap: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  body: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.sm,
  },
  // fontSize 16 / weight 'bold' - not on the typography scale (nearest role,
  // `typography.button`, is 18/600). This screen was never restyled onto
  // the scale (Phase 7 explicitly left it as a regression-check only), so
  // the literal is kept verbatim rather than snapped to a nearby token.
  buttonText: {
    fontWeight: 'bold',
    fontFamily: fontFamily.body,
    fontSize: 16,
  },
});
