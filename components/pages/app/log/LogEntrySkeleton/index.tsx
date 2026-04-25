import { View } from 'react-native';
import { styles } from './styles';

export default function LogEntrySkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.dateBar} />
      <View style={styles.thumbRow}>
        <View style={styles.thumb} />
        <View style={styles.thumb} />
        <View style={styles.thumb} />
      </View>
      <View style={styles.noteBar} />
    </View>
  );
}
