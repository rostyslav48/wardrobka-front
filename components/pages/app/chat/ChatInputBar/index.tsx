import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WardrobeItem } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
import { iconSize, spacing } from '@/theme/layout';
import { styles } from './styles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onOpenPicker: () => void;
  selectedItems: WardrobeItem[];
  onRemoveItem: (id: number) => void;
  isSending: boolean;
  bottomInset: number;
}

export default function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onOpenPicker,
  selectedItems,
  onRemoveItem,
  isSending,
  bottomInset,
}: Props) {
  const canSend = value.trim().length > 0 && !isSending;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset + spacing.sm }]}>
      {selectedItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.chip}>
              <Text style={styles.chipLabel} numberOfLines={1}>
                {item.name}
              </Text>
              <Pressable onPress={() => onRemoveItem(item.id)} hitSlop={6}>
                <IconSymbol name="xmark" size={iconSize.sm} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.row}>
        <Pressable
          style={styles.iconButton}
          onPress={onOpenPicker}
          disabled={isSending}
          hitSlop={8}
        >
          <IconSymbol
            name="paperclip"
            size={iconSize.xl}
            color={selectedItems.length > 0 ? colors.accent : colors.textSecondary}
          />
        </Pressable>

        {/* Spec 7.2: compose with the Home ask-input verbatim - `UiInput` r10
            51px + a 48px r24 `accent` send button. */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Message your stylist…"
            placeholderTextColor={colors.placeholder}
            multiline
            editable={!isSending}
            returnKeyType="send"
            onSubmitEditing={canSend ? onSend : undefined}
            // QA-29: for a multiline TextInput, RN only fires `onSubmitEditing`
            // on Return when `submitBehavior` says so - `blurOnSubmit={false}`
            // alone resolves to `submitBehavior: 'newline'` (RN's default for
            // multiline), so Return silently inserted a line break and the
            // handler above never ran. `"submit"` fires it and keeps the
            // keyboard open, matching the "send" label without blurring.
            submitBehavior="submit"
          />
        </View>

        <Pressable
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={onSend}
          disabled={!canSend}
          hitSlop={8}
        >
          <IconSymbol
            name="arrow.right"
            size={iconSize.lg}
            color={canSend ? colors.accentText : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}
