import { KeyboardTypeOptions, Pressable, TextInput, View } from 'react-native';
import { colors } from '@/theme/colors';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSecureText?: boolean;
  readonly?: boolean;
  testID?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  /** QA-08: marks the border red without needing the caller to pass a style. */
  hasError?: boolean;
}

export default function UiInput({
  value,
  onChange,
  placeholder,
  isSecureText,
  readonly,
  testID,
  autoCapitalize,
  keyboardType,
  maxLength,
  hasError,
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // QA-09: focused input looked identical to unfocused - same grey border.
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.container__focused,
        hasError && styles.container__error,
        readonly && styles.container__readonly,
      ]}
    >
      <TextInput
        style={[styles.input, readonly && styles.input__readonly]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isSecureText && !isPasswordVisible}
        editable={!readonly}
        testID={testID}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={autoCapitalize === 'none' ? false : undefined}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {isSecureText && (
        <Pressable
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.icon}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
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
