import { Text, StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  errorMessage?: string;
}

export default function UiFormField({ children, errorMessage }: Props) {
  return (
    <View style={styles.container}>
      <View>{children}</View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorText: {
    marginTop: 5,
    marginLeft: 15,
    color: colors.error,
    fontWeight: '500',
  },
});
