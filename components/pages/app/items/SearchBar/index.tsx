import { TextInput, View } from 'react-native';
import React from 'react';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
}

export default function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        testID="items-search-input"
        placeholder={'Search...'}
        style={styles.input}
        value={value}
        clearButtonMode={'always'}
        onChangeText={onChangeText}
        placeholderTextColor={colors.placeholder}
      />
      <IconSymbol
        size={iconSize.xl}
        name="magnifyingglass"
        color={colors.placeholder}
        style={styles.icon}
      />
    </View>
  );
}
