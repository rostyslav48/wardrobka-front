// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, type SFSymbol } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SFSymbol, ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'xmark': 'close',
  'tshirt.fill': 'checkroom',
  'magnifyingglass': 'search',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'line.3.horizontal.decrease': 'tune',
  'plus': 'add',
  'chevron.left': 'arrow-back',
  'camera.fill': 'camera-alt',
  'photo.on.rectangle': 'photo-library',
  'trash': 'delete',
  'sparkles': 'auto-awesome',
  'arrow.up': 'arrow-upward',
  'bubble.left.and.bubble.right.fill': 'chat',
  // Redesign additions - redesign-spec.md section 5.
  'sun.max': 'wb-sunny',
  'arrow.right': 'arrow-forward',
  'calendar': 'calendar-today',
  'drop.fill': 'water-drop',
  // QA-53/62: the shared "failed to load" state on Chat/Items/Log.
  'exclamationmark.triangle.fill': 'error-outline',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const glyph = MAPPING[name];

  if (__DEV__ && glyph === undefined) {
    // An unmapped name renders as a blank square on Android and web, which is
    // invisible in review. Say so instead.
    console.warn(
      `IconSymbol: "${String(name)}" has no MAPPING entry in components/ui/IconSymbol.tsx; ` +
        'it will render as an empty box on Android and web.',
    );
  }

  return <MaterialIcons color={color} size={size} name={glyph} style={style} />;
}
