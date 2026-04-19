import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  topicLine: {
    width: 80,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumb: {
    width: 70,
    height: 105,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  summaryLine1: {
    width: '100%',
    height: 13,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  summaryLine2: {
    width: '70%',
    height: 13,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dateLine: {
    alignSelf: 'flex-end',
    width: 48,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
});
