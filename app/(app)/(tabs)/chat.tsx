import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantSessionDto } from '@/types/ai-assistant';
import SessionListItem from '@/components/pages/app/chat/SessionListItem';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export default function ChatList() {
  const insets = useSafeAreaInsets();
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

  const removeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const openSession = (session: AssistantSessionDto) => {
    router.push({
      pathname: '/chat/[sessionId]',
      params: { sessionId: session.id, topic: session.topic },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
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
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No chats yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with your AI stylist
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <SessionListItem
              session={item}
              onPress={() => openSession(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
        onPress={() => router.push('/chat/new')}
      >
        <IconSymbol name="plus" size={28} color={colors.accentText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: pageInlineIntent,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: pageInlineIntent,
  },
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
  },
  retryLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
