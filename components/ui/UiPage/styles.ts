import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingInline: pageInlineIntent,
  },

  // `flexGrow`, not `height: '100%'`: the old value capped scroll content at
  // exactly one viewport, so anything taller than the screen was unreachable.
  content: {
    flexGrow: 1,
  },
});
