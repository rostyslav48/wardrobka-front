import { StyleSheet } from 'react-native';
import { spacing } from '@/theme/layout';

/**
 * Section 7.2: outfit history has no mockup surface of its own, so it reuses
 * the Log list's card (`OutfitSuggestionCard`, already restyled in Phase 3)
 * and the pushed-route header pattern `ItemDetailScreen` established -
 * back button + centred title, since this screen is reached from Home's
 * "See all" and not from the tab bar.
 */
export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.cardPad,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  // Sheet-title role (22/400) - `UiTitle`'s own default.
  title: {
    flex: 1,
    textAlign: 'center',
  },
  // Balances `backButton` so `title` centres against the screen, not just
  // the remaining row space - the same fix `NewItemScreen` uses.
  headerSpacer: {
    width: 32,
  },
  content: {
    flexGrow: 1,
  },
  list: {
    marginTop: spacing.sm,
  },
  loadingMore: {
    paddingVertical: spacing.xl,
  },
});
