import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    zIndex: 100,
  },
  container__success: {
    backgroundColor: colors.statusActive,
  },
  container__error: {
    backgroundColor: colors.error,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
