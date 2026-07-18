import { Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

export default function HistoryEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <IconSymbol name="sparkles" size={32} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>No outfit suggestions yet</Text>
      <Text style={styles.subtitle}>
        Try asking the assistant for outfit ideas in the chat.
      </Text>
    </View>
  );
}
