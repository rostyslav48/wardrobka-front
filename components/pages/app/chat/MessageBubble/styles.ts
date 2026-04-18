import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  row: {
    marginBottom: 12,
    maxWidth: '80%',
    gap: 4,
  },
  rowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },

  content: {
    fontSize: 15,
    lineHeight: 21,
  },
  contentUser: {
    color: colors.accentText,
  },
  contentAssistant: {
    color: colors.textPrimary,
  },

  time: {
    fontSize: 11,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  timeUser: {
    // inherits from time
  },
  timeAssistant: {
    // inherits from time
  },
});
