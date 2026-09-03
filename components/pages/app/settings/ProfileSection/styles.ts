import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  // Spec 4.3's "button" role - the same 50 px primary-action label as every
  // other `UiButton` in the app.
  saveButtonText: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.accentText,
  },
});
