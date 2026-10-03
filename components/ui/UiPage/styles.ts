import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  // The frame around the scroll view. It carries only the top offset: the
  // horizontal page padding is on `header` and `content` instead, so the
  // scroll view spans the full width and its indicator sits on the screen
  // edge (QA-69) - see `index.tsx`.
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingInline: pageInlineIntent,
  },

  scroll: {
    flex: 1,
  },

  // `flexGrow`, not `height: '100%'`: the old value capped scroll content at
  // exactly one viewport, so anything taller than the screen was unreachable.
  content: {
    flexGrow: 1,
    paddingInline: pageInlineIntent,
  },
});
