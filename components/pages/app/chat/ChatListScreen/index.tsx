import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantSessionDto } from '@/types/ai-assistant';
import SessionListItem from '@/components/pages/app/chat/SessionListItem';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiEmptyState from '@/components/ui/UiEmptyState';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize, spacing } from '@/theme/layout';
import { styles } from './styles';

export default function ChatListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [sessions, setSessions] = useState<AssistantSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const sub = aiAssistantService.getSessions().subscribe({
      next: (data) => {
        setSessions(data);
        setIsLoading(false);
      },
      error: () => {
        setError('Failed to load chats.');
        setIsLoading(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => fetchSessions(), [fetchSessions]);

  const openSession = (session: AssistantSessionDto) => {
    router.push({
      pathname: '/chat/[sessionId]',
      params: { sessionId: session.id, topic: session.topic },
    });
  };

  return (
    <View style={styles.root} testID="chat-screen">
      <UiPage tabBarInset>
        {/* Spec 6.4: "Chats" 28/400 left, "N SESSIONS" 10/600 right - the same
            title-row shape as Items' "Wardrobe" / "N ITEMS". */}
        <View style={styles.titleRow}>
          <UiTitle sizeL>Chats</UiTitle>
          <UiTitle style={styles.sessionCount}>{sessions.length} SESSIONS</UiTitle>
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.textPrimary} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchSessions}>
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : sessions.length === 0 ? (
          <UiEmptyState
            icon="bubble.left.and.bubble.right.fill"
            title="No chats yet"
            subtitle="Start a conversation with your AI stylist"
            actionLabel="+ New chat"
            onAction={() => router.push('/chat/new')}
          />
        ) : (
          <View style={styles.list}>
            {sessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                onPress={() => openSession(session)}
              />
            ))}
          </View>
        )}
      </UiPage>

      <Pressable
        style={[styles.fab, { bottom: tabBarHeight + spacing.gutter }]}
        onPress={() => router.push('/chat/new')}
      >
        <IconSymbol name="plus" size={iconSize.xl} color={colors.accentText} />
      </Pressable>
    </View>
  );
}
