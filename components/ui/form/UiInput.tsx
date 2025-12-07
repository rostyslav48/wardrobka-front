import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

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
          <MaterialCommunityIcons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.placeholder,
    borderRadius: 10,
  },
  input: {
    color: colors.text,
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  icon: {
    paddingRight: 15,
  },
});
