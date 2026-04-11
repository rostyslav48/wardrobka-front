import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 8,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
