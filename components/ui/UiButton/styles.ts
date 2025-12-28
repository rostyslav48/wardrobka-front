import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: colors.accent,
  },
  button__secondary: {
    backgroundColor: colors.secondary,
  },
});
