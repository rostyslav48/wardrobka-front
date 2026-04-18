import { Pressable, Text, View } from 'react-native';
import { AssistantSessionDto } from '@/types/ai-assistant';
import { styles } from './styles';

interface Props {
  session: AssistantSessionDto;
  onPress: () => void;
}

export default function SessionListItem({ session, onPress }: Props) {
  const dateString = new Date(session.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const preview =
    session.latestMessage?.role !== 'system'
      ? session.latestMessage?.content
      : undefined;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.body}>
        <Text style={styles.topic} numberOfLines={1}>
          {session.topic || 'Chat'}
        </Text>
        {preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      <Text style={styles.date}>{dateString}</Text>
    </Pressable>
  );
}
