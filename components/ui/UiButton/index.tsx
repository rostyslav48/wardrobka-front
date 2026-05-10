import { PropsWithChildren, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { styles } from './styles';
import { colors } from '@/theme/colors';

type Props = PropsWithChildren<{
  onPress: (event?: UiButtonClickEvent) => void;
  secondary?: boolean;
  enableLoader?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export type UiButtonClickEvent = GestureResponderEvent & {
  loader: () => void;
  stopLoader: () => void;
};

export default function UiButton({
  onPress,
  children,
  secondary,
  enableLoader = false,
  style,
}: Props) {
  const [isLoading, setIsLoading] = useState(enableLoader);

  const handleClick = (event: GestureResponderEvent): void => {
    const uiButtonEvent = event as UiButtonClickEvent;
    uiButtonEvent.loader = () => setIsLoading(true);
    uiButtonEvent.stopLoader = () => setIsLoading(false);

    onPress(uiButtonEvent);
  };

  useEffect(() => {
    setIsLoading(enableLoader);
  }, [enableLoader]);

  return (
    <TouchableOpacity
      style={[styles.button, secondary && styles.button__secondary, style]}
      onPress={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <ActivityIndicator color={colors.accentText} /> : children}
    </TouchableOpacity>
  );
}
