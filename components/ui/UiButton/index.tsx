import { PropsWithChildren, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  TouchableOpacity,
} from 'react-native';
import { styles } from './styles';
import { colors } from '@/theme/colors';

type Props = PropsWithChildren<{
  onPress: (event?: UiButtonClickEvent) => void;
  secondary?: boolean;
  enableLoader?: boolean;
}>;

export type UiButtonClickEvent = GestureResponderEvent & {
  loader: () => void;
  stopLoader: () => void;
};

export default function UiButton({ onPress, children, secondary, enableLoader = false }: Props) {
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
      style={[styles.button, secondary && styles.button__secondary]}
      onPress={handleClick}
      disabled={isLoading}
    >
      {isLoading ? <ActivityIndicator color={colors.accentText} /> : children}
    </TouchableOpacity>
  );
}
