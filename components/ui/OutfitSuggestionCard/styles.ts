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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 16,
  },
  topic: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginRight: 8,
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
  namesRow: {
    gap: 0,
    flexDirection: 'row',
  },
  itemName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  itemNameDeleted: {
    color: colors.border,
    fontStyle: 'italic',
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
