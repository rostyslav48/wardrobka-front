import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from './styles';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  /** When false (default), tapping the active chip deselects it */
  required?: boolean;
  horizontal?: boolean;
}

export default function UiSelect<T extends string>({
  options,
  value,
  onChange,
  required = false,
  horizontal = false,
}: Props<T>) {
  const handlePress = (optionValue: T) => {
    if (!required && value === optionValue) {
      onChange(undefined);
    } else {
      onChange(optionValue);
    }
  };

  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.chip, active && styles.chip__active]}
              onPress={() => handlePress(opt.value)}
            >
              <Text style={[styles.chipText, active && styles.chipText__active]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.chip, active && styles.chip__active]}
            onPress={() => handlePress(opt.value)}
          >
            <Text style={[styles.chipText, active && styles.chipText__active]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
