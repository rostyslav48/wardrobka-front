import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, tracking, typography } from '@/theme/layout';

/**
 * Only the section header is on the redesign scale so far: it shares Home's
 * eyebrow role (spec section 4.3) so the screen reads as one page, and the
 * block's trailing margin is gone because `HomeScreen` now owns the rhythm
 * between its sections. The cards below belong to the phase that rebuilds
 * them and still carry their pre-redesign literals.
 */
export const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.eyebrow,
    letterSpacing: tracking.eyebrow,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  skeletonCard: {
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
});
