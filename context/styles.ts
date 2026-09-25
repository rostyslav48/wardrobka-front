import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

export const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  // Same shell `LogEntrySheet` draws by hand (`colors.sheet`, `radius.sheet`
  // on the top corners, a 36x4 grabber) - this is the generic version every
  // `useModal()` consumer gets. `maxHeight` is deliberately absent here -
  // QA-63 found `'88%'` resolves against this sheet's own indefinite-height
  // wrapper, not the screen, so it's applied inline in `ModalContext.tsx` as
  // a concrete pixel value instead.
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.hair,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
});

