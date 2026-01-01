import { Pressable, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSecureText?: boolean;
}

export default function UiInput({
  value,
  onChange,
  placeholder,
  isSecureText,
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isSecureText && !isPasswordVisible}
      />
      {isSecureText && (
        <Pressable
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.icon}
        >
          <IconSymbol
            name={isPasswordVisible ? 'eye.slash' : 'eye'}
            size={24}
            color={colors.placeholder}
          />
        </Pressable>
      )}
    </View>
  );
}
