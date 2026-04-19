import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 46,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
    maxHeight: 100,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.accentText,
    fontWeight: '700',
  },
});
