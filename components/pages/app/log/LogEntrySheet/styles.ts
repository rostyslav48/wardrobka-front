import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { pageInlineIntent } from '@/theme/layout';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Fixed height so flex children (FlatList + confirm button) always have a bounded container
    height: '88%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: pageInlineIntent,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  formContent: {
    paddingHorizontal: pageInlineIntent,
    paddingBottom: 12,
    gap: 20,
  },

  section: {
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeLink: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },

  iosPicker: {
    marginHorizontal: -pageInlineIntent,
    height: 160,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dateButtonText: {
    fontSize: 15,
    color: colors.textPrimary,
  },

  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedRow: {
    gap: 8,
    paddingVertical: 4,
  },
  selectedThumb: {
    width: 60,
    alignItems: 'center',
    gap: 4,
  },
  selectedThumbImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  selectedThumbPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThumbName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    width: 60,
  },
  emptyItemsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyItemsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 80,
  },

  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },

  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentText,
  },

  deleteButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 15,
    color: colors.error,
    fontWeight: '500',
  },
});
