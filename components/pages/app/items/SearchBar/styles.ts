import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 25,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    paddingBlock: 10,
    paddingRight: 20,
    marginRight: 10,
    paddingLeft: 35,
    fontSize: 16,
  },
  icon: {
    position: 'absolute',
    left: 10,
  },
});
