import { Pressable, ScrollView, Text } from 'react-native';
import { styles } from './styles';

interface Shortcut {
  label: string;
  prompt: string;
}

interface Props {
  shortcuts: ReadonlyArray<Shortcut>;
  onSelect: (prompt: string) => void;
}

export default function PromptShortcutChips({ shortcuts, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {shortcuts.map((s) => (
        <Pressable key={s.label} style={styles.chip} onPress={() => onSelect(s.prompt)}>
          <Text style={styles.chipText}>{s.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
