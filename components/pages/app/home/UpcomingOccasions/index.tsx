import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCalendar } from '@/context/CalendarContext';
import { buildOccasionPrompt } from '@/constants/calendar';
import { UpcomingOccasion } from '@/types/calendar';
import { styles } from './styles';

function formatOccasionMeta(occasion: UpcomingOccasion): string {
  const time = occasion.allDay
    ? 'All day'
    : new Date(occasion.start).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
  return occasion.location ? `${time} · ${occasion.location}` : time;
}

export default function UpcomingOccasions() {
  const { status, occasions, isLoading } = useCalendar();

  const handleOccasionPress = (occasion: UpcomingOccasion) => {
    router.push({
      pathname: '/chat/[sessionId]',
      params: { sessionId: 'new', prompt: buildOccasionPrompt(occasion) },
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle} testID="home-occasions-header">
          Upcoming Occasions
        </Text>
      </View>

      {isLoading ? (
        <>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </>
      ) : status === 'disconnected' ? (
        <Pressable
          onPress={() => router.push('/settings')}
          testID="home-occasions-disconnected"
        >
          <Text style={styles.hint}>
            Connect Google Calendar in Settings to see your upcoming occasions
            here.
          </Text>
        </Pressable>
      ) : status === 'revoked' ? (
        <Pressable
          onPress={() => router.push('/settings')}
          testID="home-occasions-revoked"
        >
          <Text style={styles.hint}>
            Google revoked access to your calendar. Reconnect in Settings to
            see your upcoming occasions here.
          </Text>
        </Pressable>
      ) : occasions.length === 0 ? (
        <Text style={styles.hint} testID="home-occasions-empty">
          Nothing on your calendar for the next two days
        </Text>
      ) : (
        occasions.map((occasion) => (
          <Pressable
            key={occasion.id}
            style={styles.card}
            onPress={() => handleOccasionPress(occasion)}
          >
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {occasion.title}
              </Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {formatOccasionMeta(occasion)}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}
