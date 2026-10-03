import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { border, radius, spacing, tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.rowY,
    width: '100%',
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: border.hairline,
    borderRadius: radius.card,
  },
  errorText: {
    ...typography.valueEmphasis,
    letterSpacing: tracking.valueEmphasis,
    color: colors.error,
  },
});
