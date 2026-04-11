import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingInline: pageInlineIntent,
  },

  container__indented: {
    paddingTop: 60,
  },

  content: {
    height: '100%'
  },
});
