import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { tracking, typography } from '@/theme/layout';

/**
 * The five flags are the five text roles the app actually asks `UiTitle` for -
 * see spec section 4.2 for the artboard's usage and 8.3 for the mapping. Four
 * land on the row 8.3 names for their literal; `sizeXS` is the one deviation
 * (recorded in 8.8): its only caller is the chat header, which section 4.3
 * measures as the `sessionTitle` role.
 */
export const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
  sizeXS: {
    ...typography.sessionTitle,
    letterSpacing: tracking.sessionTitle,
  },
  sizeS: {
    ...typography.button,
    letterSpacing: tracking.button,
  },
  sizeM: {
    ...typography.statNumeral,
    letterSpacing: tracking.statNumeral,
  },
  sizeDefault: {
    ...typography.sheetTitle,
    letterSpacing: tracking.sheetTitle,
  },
  sizeL: {
    ...typography.screenTitle,
    letterSpacing: tracking.screenTitle,
  },
});
