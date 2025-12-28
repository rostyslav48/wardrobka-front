import { Text, View } from 'react-native';
import { styles } from './styles';

interface Props {
  errorMessage: string;
}

export default function UiError({ errorMessage }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{errorMessage}</Text>
    </View>
  );
}
