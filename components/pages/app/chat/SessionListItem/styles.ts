import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  topic: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  preview: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 0,
  },
});
