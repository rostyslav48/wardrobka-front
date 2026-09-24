import { Pressable, Text, View } from 'react-native';
import { AssistantSessionDto } from '@/types/ai-assistant';
import { styles } from './styles';

// QA-36: every row showed a full "22 Sep 2026" date, even for sessions from
// today - not useful once there are more than one or two rows for the same
// day. Today shows a time (the finest-grained thing worth knowing at a
// glance), yesterday/this week fall back to a name, older rows keep the date.
function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, now)) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((todayStart.getTime() - dateStart.getTime()) / 86400000);
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  session: AssistantSessionDto;
  onPress: () => void;
}

export default function SessionListItem({ session, onPress }: Props) {
  const dateString = formatSessionDate(session.createdAt);

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
