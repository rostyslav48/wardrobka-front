import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
