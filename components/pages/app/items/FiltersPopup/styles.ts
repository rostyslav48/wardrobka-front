import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

export const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingBottom: 16,
  },

  section: {
    gap: 10,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },

  // Chip row (seasons, statuses)
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Horizontal scroll chip row (types)
  chipScroll: {
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },

  chip__active: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },

  chipText__active: {
    color: colors.accentText,
  },

  // Color swatches
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  swatch__active: {
    borderColor: colors.textPrimary,
  },

  swatchAny: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Favourite toggle row
  favouriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  favouriteLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
  },

  footerButtonWrapper: {
    flex: 1,
  },

  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  buttonLabel__primary: {
    color: colors.accentText,
  },

  buttonLabel__secondary: {
    color: colors.textPrimary,
  },
});
