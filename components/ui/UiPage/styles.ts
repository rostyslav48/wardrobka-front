import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 20,
  },

  container__indented: {
    paddingTop: 60,
  },

  content: {
    height: '100%'
  },
});
