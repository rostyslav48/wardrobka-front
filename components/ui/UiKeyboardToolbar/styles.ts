import type { KeyboardToolbarProps } from 'react-native-keyboard-controller';
import { colors } from '@/theme/colors';

// The app ships one dark palette (theme/colors.ts), so both keyboard
// appearances get the same toolbar. `background` must be a 6-digit hex: the
// library appends its own opacity byte to it.
const theme = {
  primary: colors.textPrimary,
  disabled: colors.textSecondary,
  background: colors.surface,
  ripple: colors.border,
};

export const toolbarTheme: NonNullable<KeyboardToolbarProps['theme']> = {
  light: theme,
  dark: theme,
};
