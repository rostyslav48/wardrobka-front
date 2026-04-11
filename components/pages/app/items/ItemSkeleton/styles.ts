import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photo: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.border,
  },
  info: {
    padding: 8,
    gap: 6,
  },
  nameLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    width: '70%',
  },
  badgeLine: {
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    width: '45%',
  },
});
