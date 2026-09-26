import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantSessionDto } from '@/types/ai-assistant';
import SessionListItem from '@/components/pages/app/chat/SessionListItem';
import UiPage from '@/components/ui/UiPage';
import UiTitle from '@/components/ui/UiTitle';
import UiEmptyState from '@/components/ui/UiEmptyState';
import UiInlineError from '@/components/ui/UiInlineError';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { iconSize, spacing } from '@/theme/layout';
import { styles } from './styles';

export default function ChatListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [sessions, setSessions] = useState<AssistantSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // QA-53/62: this screen never had a `RefreshControl` at all, so a pull
  // triggered nothing - no fetch, no spinner, no error. `silent` keeps a
  // pull from swapping the list for the full-page spinner below.
  const fetchSessions = useCallback((silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    const sub = aiAssistantService.getSessions().subscribe({
      next: (data) => {
        setSessions(data);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      error: () => {
        setError('Failed to load chats.');
        setIsLoading(false);
        setIsRefreshing(false);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => fetchSessions(), [fetchSessions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSessions(true);
  };

  // QA-35: the row stays until the server confirms the delete; on failure it
  // stays and the inline banner says so.
  const deleteSession = (session: AssistantSessionDto) => {
    setDeleteError(null);
    aiAssistantService.deleteSession(session.id).subscribe({
      next: () =>
        setSessions((prev) => prev.filter((s) => s.id !== session.id)),
      error: () => setDeleteError("Couldn't delete the chat. Please try again."),
    });
  };

  // `Alert.alert` is a no-op on react-native-web, so the browser build asks
  // through the browser's own confirm dialog instead.
  const confirmDelete = (session: AssistantSessionDto) => {
    const title = 'Delete this chat?';
    const message =
      'Its messages and any outfit suggestions made in it will be removed. This cannot be undone.';

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) deleteSession(session);
      return;
    }

    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session) },
    ]);
  };

  const openSession = (session: AssistantSessionDto) => {
    router.push({
      pathname: '/chat/[sessionId]',
      params: { sessionId: session.id, topic: session.topic },
    });
  };

  return (
    <View style={styles.root} testID="chat-screen">
      <UiPage
        tabBarInset
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
      >
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
        ) : error && sessions.length === 0 ? (
          <UiEmptyState
            testID="chat-error-state"
            icon="exclamationmark.triangle.fill"
            title="Couldn't load your chats"
            subtitle="Check your connection and try again."
            actionLabel="Retry"
            onAction={() => fetchSessions()}
          />
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
            {error ? (
              <UiInlineError
                testID="chat-error-banner"
                message="Couldn't refresh your chats."
                onRetry={() => fetchSessions()}
              />
            ) : deleteError ? (
              <UiInlineError testID="chat-delete-error-banner" message={deleteError} />
            ) : null}
            {sessions.map((session) => (
              <SessionListItem
                key={session.id}
                session={session}
                onPress={() => openSession(session)}
                onDelete={() => confirmDelete(session)}
              />
            ))}
          </View>
        )}
      </UiPage>

      <Pressable
        testID="chat-new-session-button"
        style={[styles.fab, { bottom: tabBarHeight + spacing.gutter }]}
        onPress={() => router.push('/chat/new')}
        accessibilityRole="button"
        accessibilityLabel="New chat"
      >
        <IconSymbol name="plus" size={iconSize.xl} color={colors.accentText} />
      </Pressable>
    </View>
  );
}
