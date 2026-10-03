import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { tracking, typography } from '@/theme/layout';

export const styles = StyleSheet.create({
  // Spec 6.6's "Sign out" label - the `button` role (18/600), `error` colour.
  signOutText: {
    ...typography.button,
    letterSpacing: tracking.button,
    color: colors.error,
  },
});
