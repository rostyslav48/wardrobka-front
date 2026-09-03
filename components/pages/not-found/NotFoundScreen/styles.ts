import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: pageInlineIntent,
  },
  title: {
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
  buttonText: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.textPrimary,
  },
});
