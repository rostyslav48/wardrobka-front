import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageFrame: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 2 / 3,
  },
  // Sits over the bottom of the image so a failed regeneration never hides the
  // photo the item still has.
  failedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(17, 17, 17, 0.85)',
  },
  failedOverlayText: {
    flexShrink: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  placeholder: {
    width: '100%',
    aspectRatio: 2 / 3,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  retryButtonText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    padding: 8,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
