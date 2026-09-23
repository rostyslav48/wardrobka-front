import { Pressable, RefreshControl, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWardrobe } from '@/context/WardrobeContext';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantOutfitSuggestionDto } from '@/types/ai-assistant';
import { colors } from '@/theme/colors';
import { PROMPT_SHORTCUTS } from '@/constants/promptShortcuts';
import OutfitSuggestionCard from '@/components/ui/OutfitSuggestionCard';
import UiEmptyState from '@/components/ui/UiEmptyState';
import UiPage from '@/components/ui/UiPage';
import UiSkeletonCard from '@/components/ui/UiSkeletonCard';
import UiTitle from '@/components/ui/UiTitle';
import UiToast, { UiToastRef } from '@/components/ui/UiToast';
import PromptShortcutChips from '@/components/ui/PromptShortcutChips';
import QuickChatInput from '@/components/ui/QuickChatInput';
import UpcomingOccasions from '@/components/pages/app/home/UpcomingOccasions';
import { styles } from './styles';

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${salutation}, ${name}` : salutation;
}

export default function HomeScreen() {
  const { userData } = useAuth();
  const { items: wardrobeItems } = useWardrobe();
  const toastRef = useRef<UiToastRef>(null);

  const [suggestions, setSuggestions] = useState<AssistantOutfitSuggestionDto[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sub = aiAssistantService.getRecentSuggestions().subscribe({
      next: (data) => {
        setSuggestions(data);
        setIsLoadingSuggestions(false);
      },
      error: () => setIsLoadingSuggestions(false),
    });
    return () => sub.unsubscribe();
  }, []);

  // QA-25: suggestions were only ever fetched once, on mount, so a chat
  // started from Home (or from Chat directly) never showed up back on Home
  // without a full logout/login. Every focus *after* the first (the mount
  // effect above owns that one) now re-fetches, silently — no skeleton flash
  // on a screen the user already saw.
  const hasMountedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      const sub = aiAssistantService.getRecentSuggestions().subscribe({
        next: (data) => setSuggestions(data),
        error: () => {},
      });
      return () => sub.unsubscribe();
    }, []),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    aiAssistantService.getRecentSuggestions().subscribe({
      next: (data) => {
        setSuggestions(data);
        setIsRefreshing(false);
      },
      error: () => setIsRefreshing(false),
    });
  }, []);

  const handleSubmit = useCallback(
    (overridePrompt?: string) => {
      const prompt = (overridePrompt ?? inputValue).trim();
      if (!prompt || isSubmitting) return;

      setIsSubmitting(true);
      aiAssistantService.chat({ prompt }).subscribe({
        next: ({ sessionId }) => {
          setInputValue('');
          setIsSubmitting(false);
          router.push(`/chat/${sessionId}`);
        },
        error: () => {
          setIsSubmitting(false);
          // QA-54: every other screen surfaces failures through the in-app
          // toast; a native Alert here was the one exception.
          toastRef.current?.show('Failed to start a chat. Please try again.', 'error');
        },
      });
    },
    [inputValue, isSubmitting],
  );

  const handleChipSelect = useCallback(
    (prompt: string) => {
      setInputValue(prompt);
      handleSubmit(prompt);
    },
    [handleSubmit],
  );

  const resolvedSuggestions = suggestions.map((s) => ({
    ...s,
    thumbnails: s.wardrobeItemIds.map(
      (id) => wardrobeItems.find((item) => item.id === id)?.img_url ?? null,
    ),
  }));

  return (
    <View style={styles.root}>
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
      <View style={styles.greetingSection}>
        <UiTitle sizeL testID="home-greeting">
          {getGreeting(userData?.name)}
        </UiTitle>
        <UiTitle style={styles.greetingSubtitle} testID="home-greeting-subtitle">
          What are you wearing today?
        </UiTitle>
      </View>

      <UpcomingOccasions />

      {/* Spec section 6.2 orders the ask block above recent suggestions. */}
      <View style={styles.askSection}>
        <View style={styles.sectionHeader}>
          <UiTitle style={styles.sectionEyebrow} testID="home-ask-wardropka-header">
            ASK WARDROPKA
          </UiTitle>
        </View>
        <PromptShortcutChips
          shortcuts={PROMPT_SHORTCUTS}
          onSelect={handleChipSelect}
        />
        <QuickChatInput
          value={inputValue}
          onChangeText={setInputValue}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <UiTitle
            style={styles.sectionEyebrow}
            testID="home-recent-suggestions-header"
          >
            RECENT SUGGESTIONS
          </UiTitle>
          <Pressable
            onPress={() => router.push('/outfit-history')}
            hitSlop={8}
            testID="home-see-all-suggestions"
          >
            <UiTitle style={styles.seeAll}>SEE ALL →</UiTitle>
          </Pressable>
        </View>

        {isLoadingSuggestions ? (
          <>
            <UiSkeletonCard />
            <UiSkeletonCard />
            <UiSkeletonCard />
          </>
        ) : resolvedSuggestions.length === 0 ? (
          <UiEmptyState
            icon="sparkles"
            title="No suggestions yet"
            subtitle="Start a chat above to get personalised outfit ideas from your wardrobe."
          />
        ) : (
          resolvedSuggestions.map((s) => (
            <OutfitSuggestionCard
              key={s.id}
              suggestion={s}
              thumbnails={s.thumbnails}
              onPress={() => router.push(`/chat/${s.sessionId}`)}
            />
          ))
        )}
      </View>
    </UiPage>
    <UiToast ref={toastRef} />
    </View>
  );
}
