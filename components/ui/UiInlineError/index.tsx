import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

interface Props {
  message: string;
  onRetry?: () => void;
  testID?: string;
}

/**
 * QA-53/62: a failed refetch on a list that already has data used to leave
 * the stale list on screen with no sign anything went wrong. This sits above
 * the list instead of replacing it, so the data the user could still read
 * stays readable while they're told the last refresh failed.
 */
export default function UiInlineError({ message, onRetry, testID }: Props) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={styles.retry}
          onPress={onRetry}
          hitSlop={8}
          testID={testID ? `${testID}-action` : undefined}
        >
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
