import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function QuickChatInput({
  value,
  onChangeText,
  onSubmit,
  isLoading,
}: Props) {
  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <View style={styles.row}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask Wardropka anything…"
          placeholderTextColor={colors.placeholder}
          multiline
          returnKeyType="send"
          onSubmitEditing={canSubmit ? () => onSubmit() : undefined}
          blurOnSubmit
          editable={!isLoading}
        />
      </View>
      <Pressable
        style={[styles.sendButton, !canSubmit && styles.sendButtonDisabled]}
        onPress={canSubmit ? () => onSubmit() : undefined}
        disabled={!canSubmit}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accentText} />
        ) : (
          <IconSymbol name="arrow.up" size={20} color={colors.accentText} />
        )}
      </Pressable>
    </View>
  );
}
