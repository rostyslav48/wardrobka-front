import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  KeyboardChatScrollView,
  KeyboardEvents,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
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
import ItemPickerSheet from '@/components/ui/ItemPickerSheet';
import { IconSymbol } from '@/components/ui/IconSymbol';
import UiTitle from '@/components/ui/UiTitle';
import { colors } from '@/theme/colors';
import { iconSize } from '@/theme/layout';
import { styles } from './styles';

const NEW_SESSION_PARAM = 'new';

// Not a `UiPage` screen: this is a chat list with a keyboard-pinned input bar,
// not a scroll page - `UiPage`'s own `ScrollView` + safe-area wrapper would
// fight the keyboard handling below rather than help it, so this screen keeps
// its own direct `useSafeAreaInsets()` call. Deliberate exception, recorded in
// state.md.
export default function ChatThreadScreen() {
  const {
    sessionId,
    topic: topicParam,
    prompt: promptParam,
  } = useLocalSearchParams<{
    sessionId: string;
    topic?: string;
    prompt?: string;
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
  const [inputText, setInputText] = useState(promptParam ?? '');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);

  const listRef = useRef<FlatList>(null);
  const hasAutoSentRef = useRef(false);
  // QA-56: opening a long thread populated `messages` from the top and then
  // animated all the way to the bottom. The first scroll for a given session
  // (its history arriving, or its first optimistic message) jumps instantly;
  // only messages added after that animate.
  const hasScrolledOnMountRef = useRef(false);

  // QA-37: a session opened without a `topic` param (e.g. one just created
  // from the Home ask field/chips, whose `ChatResponse` carries no topic)
  // showed "Chat" forever. `GET /ai-assistant/sessions` - already used by
  // ChatListScreen - has it once the backend has generated one; this
  // backfills it without a backend change. If the topic isn't ready yet
  // either, this quietly stays "Chat" for the rest of the visit.
  useEffect(() => {
    if (!activeSessionId || sessionTopic) return;
    const sub = aiAssistantService.getSessions().subscribe({
      next: (sessions) => {
        const match = sessions.find((s) => s.id === activeSessionId);
        if (match?.topic) setSessionTopic(match.topic);
      },
      error: () => {},
    });
    return () => sub.unsubscribe();
  }, [activeSessionId, sessionTopic]);

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

  // A different session's history is a different starting point to jump to.
  useEffect(() => {
    hasScrolledOnMountRef.current = false;
  }, [activeSessionId]);

  useEffect(() => {
    if (messages.length === 0) return;
    const animated = hasScrolledOnMountRef.current;
    hasScrolledOnMountRef.current = true;
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 80);
  }, [messages]);

  // QA-30: focusing the composer must keep the newest reply in view above
  // it. The list's `KeyboardChatScrollView` (below) lifts its content frame by
  // frame with the keyboard, so a list already at its end stays there for the
  // whole animation. This covers the remaining case - the list scrolled up
  // when the composer is focused - by settling on the end once the keyboard
  // is up; for a list already at the end it is a no-op.
  useEffect(() => {
    const sub = KeyboardEvents.addListener('keyboardDidShow', () =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
    return () => sub.remove();
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────────

  const handleSend = () => {
    const prompt = inputText.trim();
    // QA-34: attached items alone are a sendable message - the assistant
    // comments on them or asks what the user wants to know.
    if ((!prompt && selectedItems.length === 0) || isSending) return;

    setSendError(null);
    setInputText('');

    const contextItemIds = selectedItems.map((i) => i.id);
    setSelectedItems([]);

    // Optimistic user message
    const optimisticId = `temp-${Date.now()}`;
    // An attachment-only message shows the same stand-in the server stores
    // for it ("Attached 2 items") until the refetch below replaces it.
    const optimistic: AssistantMessageDto = {
      id: optimisticId,
      role: 'user',
      content: prompt || describeAttachments(contextItemIds.length),
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

  // Auto-sends a `prompt` route param exactly once — used when an occasion
  // card on Home routes here with sessionId "new" already asking about it,
  // matching how the Home prompt shortcut chips submit on select rather than
  // waiting for the user to tap send.
  useEffect(() => {
    if (hasAutoSentRef.current) return;
    if (!promptParam || activeSessionId) return;

    hasAutoSentRef.current = true;
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Item context picker ───────────────────────────────────────────────────────

  const openPicker = () => {
    show({
      content: (
        // QA-63: the sheet background falling short of the screen edge was
        // `ModalContext`'s `maxHeight: '88%'` clamp, fixed there (see that
        // file). This wrapper's own `paddingBottom: insets.bottom` - real
        // padding, included in the sheet's content height, unlike
        // `ItemPickerSheet`'s `bottomInset` prop which applies as a margin
        // on the confirm button - is kept so the inset itself still lands
        // inside the sheet now that the clamp isn't clipping content.
        <View style={[styles.pickerSheetWrapper, { paddingBottom: insets.bottom }]}>
          <ItemPickerSheet
            items={wardrobeItems}
            selectedIds={selectedItems.map((i) => i.id)}
            confirmTestID="chat-picker-confirm-button"
            onConfirm={(ids) => {
              setSelectedItems(wardrobeItems.filter((i) => ids.includes(i.id)));
              hide();
            }}
          />
        </View>
      ),
    });
  };

  const removeSelectedItem = (id: number) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const visibleMessages = messages; // system messages filtered at fetch time

  // QA-57 / BUG-iOS-06: the list and the composer both follow the keyboard
  // frame by frame (react-native-keyboard-controller) instead of RN's
  // `KeyboardAvoidingView`, which jumped the composer to its final spot in one
  // frame and left it ~42pt above the keyboard. The composer pads itself by
  // `insets.bottom` for the home indicator; the keyboard covers that area, so
  // both views move by the keyboard height *less* that inset, which puts the
  // composer's own bottom padding directly on the keyboard.
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <IconSymbol name="chevron.left" size={iconSize.xxl} color={colors.textPrimary} />
        </Pressable>
        <UiTitle sizeXS style={styles.headerTitle} numberOfLines={1}>
          {sessionTopic || (activeSessionId ? 'Chat' : 'New Chat')}
        </UiTitle>
        <View style={styles.headerSpacer} />
      </View>

      {/* Message list */}
      {isLoadingMessages ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textPrimary} size="large" />
        </View>
      ) : visibleMessages.length === 0 && !isSending ? (
        <View style={styles.centered}>
          <IconSymbol
            name="bubble.left.and.bubble.right.fill"
            size={iconSize.xxl}
            color={colors.hairline}
          />
          <Text style={styles.emptyTitle}>Send your first message</Text>
          <Text style={styles.emptySubtitle}>
            Ask for outfit advice, styling tips, or wardrobe help
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          renderScrollComponent={(props) => (
            <KeyboardChatScrollView {...props} offset={insets.bottom} />
          )}
          data={visibleMessages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      )}

      <KeyboardStickyView offset={{ opened: insets.bottom }}>
      {/* Error toast */}
      {sendError ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{sendError}</Text>
          <Pressable onPress={() => setSendError(null)} hitSlop={8}>
            <IconSymbol name="xmark" size={iconSize.md} color={colors.textPrimary} />
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
      </KeyboardStickyView>
    </View>
  );
}

// Mirrors the backend's stand-in text for an attachment-only message
// (ConversationService.handleChat), so the optimistic bubble matches the
// persisted one.
const describeAttachments = (count: number) =>
  `Attached ${count} ${count === 1 ? 'item' : 'items'}`;
