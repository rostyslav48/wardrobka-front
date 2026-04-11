import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantMessageDto } from '@/types/ai-assistant';
import { WardrobeItem } from '@/types/wardrobe';
import { useModal } from '@/context/ModalContext';
import { useWardrobe } from '@/context/WardrobeContext';
import MessageBubble from '@/components/pages/app/chat/MessageBubble';
import TypingIndicator from '@/components/pages/app/chat/TypingIndicator';
import ChatInputBar from '@/components/pages/app/chat/ChatInputBar';
import ItemPickerSheet from '@/components/pages/app/chat/ItemPickerSheet';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

const NEW_SESSION_PARAM = 'new';

export default function ChatScreen() {
  const { sessionId, topic: topicParam } = useLocalSearchParams<{
    sessionId: string;
    topic?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { show, hide } = useModal();
  const { items: wardrobeItems } = useWardrobe();

  // null → brand-new session, not yet created on the server
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId === NEW_SESSION_PARAM ? null : sessionId,
  );
  const [sessionTopic, setSessionTopic] = useState(topicParam ?? '');
  const [messages, setMessages] = useState<AssistantMessageDto[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(
    sessionId !== NEW_SESSION_PARAM,
  );
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);

  const listRef = useRef<FlatList>(null);

  // ── Fetch message history ────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeSessionId) return;
    setIsLoadingMessages(true);

    const sub = aiAssistantService.getMessages(activeSessionId).subscribe({
      next: (data) => {
        setMessages(data.filter((m) => m.role !== 'system'));
        setIsLoadingMessages(false);
      },
      error: () => {
        setIsLoadingMessages(false);
      },
    });

    return () => sub.unsubscribe();
  }, [activeSessionId]);

  // ── Scroll to bottom when messages change ────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages]);

  // ── Send message ─────────────────────────────────────────────────────────────

  const handleSend = () => {
    const prompt = inputText.trim();
    if (!prompt || isSending) return;

    setSendError(null);
    setInputText('');

    const contextItemIds = selectedItems.map((i) => i.id);
    setSelectedItems([]);

    // Optimistic user message
    const optimisticId = `temp-${Date.now()}`;
    const optimistic: AssistantMessageDto = {
      id: optimisticId,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);

    aiAssistantService
      .chat({
        ...(activeSessionId ? { sessionId: activeSessionId } : {}),
        prompt,
        ...(contextItemIds.length > 0 ? { contextItemIds } : {}),
      })
      .subscribe({
        next: (response) => {
          const sid = response.sessionId;

          if (!activeSessionId) {
            setActiveSessionId(sid);
            router.setParams({ sessionId: sid });
          }

          // Fetch the full message history (user + assistant both saved by now)
          aiAssistantService.getMessages(sid).subscribe({
            next: (msgs) => {
              setMessages(msgs.filter((m) => m.role !== 'system'));
              setIsSending(false);
            },
            error: () => {
              // At minimum the user message was sent; keep it and stop spinner
              setIsSending(false);
            },
          });
        },
        error: () => {
          // Remove optimistic message and surface error
          setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
          setSendError('Failed to send message. Please try again.');
          setIsSending(false);
        },
      });
  };

  // ── Item context picker ───────────────────────────────────────────────────────

  const openPicker = () => {
    show({
      content: (
        <ItemPickerSheet
          items={wardrobeItems}
          selectedIds={selectedItems.map((i) => i.id)}
          onConfirm={(ids) => {
            setSelectedItems(wardrobeItems.filter((i) => ids.includes(i.id)));
            hide();
          }}
        />
      ),
    });
  };

  const removeSelectedItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const visibleMessages = messages; // system messages filtered at fetch time

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <IconSymbol name="chevron.left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {sessionTopic || (activeSessionId ? 'Chat' : 'New Chat')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Message list */}
      {isLoadingMessages ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      ) : visibleMessages.length === 0 && !isSending ? (
        <View style={styles.centered}>
          <IconSymbol name="bubble.left.and.bubble.right" size={40} color={colors.border} />
          <Text style={styles.emptyTitle}>Send your first message</Text>
          <Text style={styles.emptySubtitle}>
            Ask for outfit advice, styling tips, or wardrobe help
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={visibleMessages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      )}

      {/* Error toast */}
      {sendError ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{sendError}</Text>
          <Pressable onPress={() => setSendError(null)} hitSlop={8}>
            <IconSymbol name="xmark" size={14} color={colors.textPrimary} />
          </Pressable>
        </View>
      ) : null}

      {/* Input */}
      <ChatInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onOpenPicker={openPicker}
        selectedItems={selectedItems}
        onRemoveItem={removeSelectedItem}
        isSending={isSending}
        bottomInset={insets.bottom}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: pageInlineIntent,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  backButton: {
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 28, // mirrors back button for centering
  },

  // Messages
  messageList: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Empty / loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: pageInlineIntent,
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

  // Error toast
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: pageInlineIntent,
    marginBottom: 8,
    backgroundColor: colors.errorBackground,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
  },
});
