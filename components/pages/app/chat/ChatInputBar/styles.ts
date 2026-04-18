import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingTop: 10,
    paddingHorizontal: pageInlineIntent,
    gap: 8,
  },

  // Context chips
  chipsScroll: {
    flexGrow: 0,
  },
  chipsContent: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 160,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    flexShrink: 1,
  },

  // Input row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  sendButtonActive: {
    backgroundColor: colors.accent,
  },
});
