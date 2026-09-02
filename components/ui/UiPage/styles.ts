import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  // The padded frame. It wraps the scroll view rather than being the scroll
  // view, so that a `refreshControl` cannot duplicate it - see `index.tsx`.
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingInline: pageInlineIntent,
  },

  scroll: {
    flex: 1,
  },

  // `flexGrow`, not `height: '100%'`: the old value capped scroll content at
  // exactly one viewport, so anything taller than the screen was unreachable.
  content: {
    flexGrow: 1,
  },
});
