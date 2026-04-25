import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/theme/colors';
import { styles } from './styles';

interface Props {
  onAdd: () => void;
}

export default function LogEmptyState({ onAdd }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="calendar-today" size={28} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>No outfit logs yet</Text>
      <Text style={styles.subtitle}>
        Tap <Text style={styles.highlight} onPress={onAdd}>+ Add entry</Text> to start recording what you wear each day.
      </Text>
    </View>
  );
}
