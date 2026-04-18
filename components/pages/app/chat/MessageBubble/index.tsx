import { Text, View } from 'react-native';
import { AssistantMessageDto } from '@/types/ai-assistant';
import { styles } from './styles';

interface Props {
  message: AssistantMessageDto;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const time = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.content, isUser ? styles.contentUser : styles.contentAssistant]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.time, isUser ? styles.timeUser : styles.timeAssistant]}>
        {time}
      </Text>
    </View>
  );
}
