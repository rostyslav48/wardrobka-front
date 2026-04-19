import { View } from 'react-native';
import { styles } from './styles';

export default function SuggestionSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.topicLine} />
      <View style={styles.thumbRow}>
        <View style={styles.thumb} />
        <View style={styles.thumb} />
        <View style={styles.thumb} />
      </View>
      <View style={styles.summaryLine1} />
      <View style={styles.summaryLine2} />
      <View style={styles.dateLine} />
    </View>
  );
}
