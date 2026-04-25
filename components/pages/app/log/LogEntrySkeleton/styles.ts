import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  dateBar: {
    height: 16,
    width: 100,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumb: {
    width: 64,
    height: 96,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  noteBar: {
    height: 12,
    width: '60%',
    borderRadius: 6,
    backgroundColor: colors.border,
  },
});
