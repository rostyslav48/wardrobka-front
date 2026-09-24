import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
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
  // QA-27: a whitespace-only value must still reach `onSubmit` (rather than
  // be gated out here) so the caller can clear the field and give feedback -
  // gating on `canSubmit` here left a whitespace-only attempt with no way to
  // ever run, so the field just sat there holding the spaces forever.
  const canAttemptSubmit = value.length > 0 && !isLoading;

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
          onSubmitEditing={canAttemptSubmit ? () => onSubmit() : undefined}
          blurOnSubmit
          editable={!isLoading}
        />
      </View>
      <Pressable
        style={[styles.sendButton, canSubmit && styles.sendButtonActive]}
        onPress={canAttemptSubmit ? () => onSubmit() : undefined}
        disabled={!canAttemptSubmit}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.accentText} />
        ) : (
          <IconSymbol
            name="arrow.right"
            size={iconSize.lg}
            color={canSubmit ? colors.accentText : colors.textSecondary}
          />
        )}
      </Pressable>
    </View>
  );
}
