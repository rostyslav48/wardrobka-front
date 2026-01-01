import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.placeholder,
    borderRadius: 10,
  },
  input: {
    color: colors.text,
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  icon: {
    paddingRight: 15,
  },
});
