import { Platform, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { AssistantSessionDto } from '@/types/ai-assistant';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
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
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / 86400000,
  );
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  session: AssistantSessionDto;
  onPress: () => void;
  /** QA-35: asked for once the row is swiped open and Delete is tapped. The
   * caller confirms before deleting anything. */
  onDelete: () => void;
}

export default function SessionListItem({ session, onPress, onDelete }: Props) {
  const dateString = formatSessionDate(session.createdAt);

  const preview =
    session.latestMessage?.role !== 'system'
      ? session.latestMessage?.content
      : undefined;

  const row = (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityActions={[{ name: 'delete', label: 'Delete chat' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'delete') onDelete();
      }}
    >
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

  // QA-35 on web: a pointer cannot drive the swipeable (react-native-gesture-
  // handler's pan never opens it from mouse events on react-native-web), so
  // the browser build shows Delete as a trailing button on every row instead.
  if (Platform.OS === 'web') {
    return (
      <View testID={`chat-session-row-${session.id}`} style={styles.webRow}>
        <View style={styles.webRowBody}>{row}</View>
        <Pressable
          testID={`chat-session-delete-${session.id}`}
          style={styles.webDeleteButton}
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete chat"
        >
          <IconSymbol
            name="trash"
            size={iconSize.md}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>
    );
  }

  // QA-35: swipe left to reveal Delete. The row closes again as soon as
  // Delete is tapped - the confirm dialog decides what happens next, and a
  // cancelled or failed delete must leave an ordinary, closed row behind.
  // VoiceOver/TalkBack users cannot swipe, so the same action is offered as
  // an accessibility action on the row.
  return (
    <ReanimatedSwipeable
      testID={`chat-session-row-${session.id}`}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <Pressable
          testID={`chat-session-delete-${session.id}`}
          style={styles.deleteAction}
          onPress={() => {
            swipeable.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel="Delete chat"
        >
          <IconSymbol
            name="trash"
            size={iconSize.lg}
            color={colors.textPrimary}
          />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
}
