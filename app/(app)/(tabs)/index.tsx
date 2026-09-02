import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/context/AuthContext';
import { useWardrobe } from '@/context/WardrobeContext';
import { aiAssistantService } from '@/services/ai-assistant.service';
import { AssistantOutfitSuggestionDto } from '@/types/ai-assistant';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';
import { PROMPT_SHORTCUTS } from '@/constants/promptShortcuts';
import OutfitSuggestionCard from '@/components/ui/OutfitSuggestionCard';
import UiSkeletonCard from '@/components/ui/UiSkeletonCard';
import UpcomingOccasions from '@/components/pages/app/home/UpcomingOccasions';
import UiEmptyState from '@/components/ui/UiEmptyState';
import PromptShortcutChips from '@/components/ui/PromptShortcutChips';
import QuickChatInput from '@/components/ui/QuickChatInput';

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${salutation}, ${name}` : salutation;
}

export default function HomeScreen() {
  const { userData } = useAuth();
  const { items: wardrobeItems } = useWardrobe();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

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
          Alert.alert('Error', 'Failed to start a chat. Please try again.');
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greeting} testID="home-greeting">
            {getGreeting(userData?.name)}
          </Text>
          <Text style={styles.greetingSubtitle} testID="home-greeting-subtitle">
            What are you wearing today?
          </Text>
        </View>

        <UpcomingOccasions />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} testID="home-recent-suggestions-header">
              Recent Suggestions
            </Text>
            <Pressable onPress={() => router.push('/outfit-history')} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
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
              subtitle="Start a chat below to get personalised outfit ideas from your wardrobe."
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} testID="home-ask-wardropka-header">
              Ask Wardropka
            </Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: pageInlineIntent,
    paddingTop: 8,
  },
  greetingSection: {
    paddingTop: 16,
    paddingBottom: 28,
    gap: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 38,
  },
  greetingSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
