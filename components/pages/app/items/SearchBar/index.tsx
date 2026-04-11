import { TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@/theme/colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { styles } from './styles';

export default function SearchBar() {
  const [searchString, setSearchString] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={'Search...'}
        style={styles.input}
        value={searchString}
        clearButtonMode={'always'}
        onChangeText={(value) => setSearchString(value)}
        placeholderTextColor={colors.placeholder}
      />
      <IconSymbol
        size={20}
        name="magnifyingglass"
        color={colors.placeholder}
        style={styles.icon}
      />
    </View>
  );
}
