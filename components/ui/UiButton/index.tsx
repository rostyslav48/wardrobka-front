import { PropsWithChildren } from 'react';
import { TouchableOpacity } from 'react-native';
import { styles } from './styles';

type Props = PropsWithChildren<{
  onPress?: () => void;
  secondary?: boolean;
}>;

export default function UiButton({ onPress, children, secondary }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, secondary && styles.button__secondary]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}
