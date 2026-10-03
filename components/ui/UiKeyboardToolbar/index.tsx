import { Platform } from 'react-native';
import { KeyboardToolbar } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toolbarTheme } from './styles';

/**
 * The toolbar's height where it renders, 0 where it doesn't. Mirrors the
 * library's internal `KEYBOARD_TOOLBAR_HEIGHT` (42, not exported). The
 * library's `KeyboardAwareScrollView` measures only the keyboard, so pages
 * that mount this toolbar add this to its offsets - see `UiPage`.
 */
export const KEYBOARD_TOOLBAR_HEIGHT = Platform.OS === 'web' ? 0 : 42;

/**
 * QA-06: the Prev / Next / Done bar above the keyboard for multi-field forms
 * (auth, Settings, Add item). Prev/Next walk the screen's text inputs in
 * order; Done dismisses the keyboard. Mount it once per form screen, as the
 * last child of the screen's root view - it positions itself absolutely and
 * rides the keyboard.
 *
 * Not rendered on web: a browser has no software-keyboard accessory, and the
 * library's toolbar would only ever sit parked just below the viewport there.
 */
export default function UiKeyboardToolbar() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'web') return null;

  return <KeyboardToolbar theme={toolbarTheme} insets={insets} />;
}
