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
  topic: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumb: {
    width: 70,
    height: 105,
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
    width: 70,
    height: 105,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summary: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
