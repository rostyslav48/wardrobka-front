import { Image, Pressable, Text, View } from 'react-native';
import { AssistantOutfitSuggestionDto } from '@/types/ai-assistant';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { styles } from './styles';

const THUMB_MAX = 4;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / 86400000,
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  suggestion: AssistantOutfitSuggestionDto;
  thumbnails: (string | null | undefined)[];
  onPress: () => void;
}

export default function OutfitSuggestionCard({
  suggestion,
  thumbnails,
  onPress,
}: Props) {
  const hasOverflow = thumbnails.length > THUMB_MAX;
  const visibleThumbs = hasOverflow
    ? thumbnails.slice(0, THUMB_MAX - 1)
    : thumbnails.slice(0, THUMB_MAX);
  const overflowCount = thumbnails.length - (THUMB_MAX - 1);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {suggestion.sessionTopic ? (
        <Text style={styles.topic} numberOfLines={1}>
          {suggestion.sessionTopic}
        </Text>
      ) : null}

      {thumbnails.length > 0 && (
        <View style={styles.thumbRow}>
          {visibleThumbs.map((url, i) => (
            <View key={i} style={styles.thumb}>
              {url ? (
                <Image
                  source={{ uri: url }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <IconSymbol
                    name="tshirt.fill"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
            </View>
          ))}

          {hasOverflow && (
            <View style={styles.overflowBadge}>
              <Text style={styles.overflowText}>+{overflowCount}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.summary} numberOfLines={2}>
        {suggestion.summary}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(suggestion.createdAt)}</Text>
      </View>
    </Pressable>
  );
}
