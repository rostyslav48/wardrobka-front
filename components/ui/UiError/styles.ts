import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    padding: 15,
    width: '100%',
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 15,
  },
  errorText: {
    color: colors.error,
    fontWeight: '500',
  },
});
