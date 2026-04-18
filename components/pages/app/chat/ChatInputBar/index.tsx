import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { WardrobeItem } from '@/types/wardrobe';
import { colors } from '@/theme/colors';
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
    <View style={[styles.wrapper, { paddingBottom: bottomInset + 8 }]}>
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
                <IconSymbol name="xmark" size={11} color={colors.textSecondary} />
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
            size={22}
            color={selectedItems.length > 0 ? colors.accent : colors.textSecondary}
          />
        </Pressable>

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
          blurOnSubmit={false}
        />

        <Pressable
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={onSend}
          disabled={!canSend}
          hitSlop={8}
        >
          <IconSymbol
            name="arrow.up"
            size={18}
            color={canSend ? colors.accentText : colors.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}
