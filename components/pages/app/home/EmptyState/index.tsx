import { Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

export default function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <IconSymbol
          name="sparkles"
          size={28}
          color={colors.textSecondary}
        />
      </View>
      <Text style={styles.title}>No suggestions yet</Text>
      <Text style={styles.subtitle}>
        Start a chat below to get personalised outfit ideas from your wardrobe.
      </Text>
    </View>
  );
}
