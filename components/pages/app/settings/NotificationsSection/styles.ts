import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 40,
  },
  rowLabel: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  blockedNotice: {
    gap: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textDecorationLine: 'underline',
  },
});
