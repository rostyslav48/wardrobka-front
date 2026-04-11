import { TextInput } from 'react-native';
import { colors } from '@/theme/colors';
import { styles } from './styles';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  numberOfLines?: number;
}

export default function UiTextArea({
  value,
  onChange,
  placeholder,
  numberOfLines = 4,
}: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      multiline
      numberOfLines={numberOfLines}
    />
  );
}
