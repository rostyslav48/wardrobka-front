import { useEffect, useState } from 'react';
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
  // QA-34: attached items alone make a sendable message.
  const canSend =
    (value.trim().length > 0 || selectedItems.length > 0) && !isSending;

  // QA-31: after sending, the multiline input kept its grown height for a
  // moment (RN's own content-size layout pass lags a frame or two behind the
  // text clearing), leaving the placeholder top-aligned in a still-tall box.
  // Tracking the measured height ourselves lets us snap it back to `null`
  // (the field's natural single-line height) the instant `value` clears,
  // instead of waiting on that layout pass.
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  useEffect(() => {
    if (value === '') setMeasuredHeight(null);
  }, [value]);

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
              <Pressable
                onPress={() => onRemoveItem(item.id)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
              >
                <IconSymbol name="xmark" size={iconSize.sm} color={colors.textSecondary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.row}>
        <Pressable
          testID="chat-attach-button"
          style={styles.iconButton}
          onPress={onOpenPicker}
          disabled={isSending}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Attach items"
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
            style={[styles.input, measuredHeight != null && { height: measuredHeight }]}
            value={value}
            onChangeText={onChangeText}
            onContentSizeChange={(e) =>
              setMeasuredHeight(e.nativeEvent.contentSize.height)
            }
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
          accessibilityRole="button"
          accessibilityLabel="Send message"
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
