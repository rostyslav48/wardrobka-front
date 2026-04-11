import { StyleSheet } from 'react-native';
import { pageInlineIntent } from '@/theme/layout';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  content: {
    paddingInline: pageInlineIntent,
    marginTop: 'auto',
    backgroundColor: colors.surface,
    flexShrink: 1
  },

  content__fullScreen: {
    height: '100%',
    flex: 1
  },

  top_bar: {
    paddingBlock: 20,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.textPrimary
  },
});
