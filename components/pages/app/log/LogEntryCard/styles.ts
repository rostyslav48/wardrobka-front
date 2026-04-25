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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumb: {
    width: 64,
    height: 96,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  note: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
