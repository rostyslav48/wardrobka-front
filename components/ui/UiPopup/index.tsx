import { PropsWithChildren, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useModal } from '@/context/ModalContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';
import { colors } from '@/theme/colors';

type Props = PropsWithChildren<{
  fullScreen?: boolean;
  title?: string;
  /**
   * Pinned below the scrolling body, e.g. a sheet's Apply / Clear all row -
   * it stays on screen however tall the body is (QA-67).
   */
  footer?: ReactNode;
}>;

export default function UiPopup({ children, fullScreen = true, title, footer }: Props) {
  const insets = useSafeAreaInsets();

  const { hide, contentMaxHeight } = useModal();

  return (
    <View
      style={[
        styles.content,
        { paddingBottom: insets.bottom },
        // QA-68: the top inset is for a popup that covers the whole screen,
        // status bar included. Inside the bottom sheet it only opened an empty
        // band under the grabber.
        fullScreen
          ? [styles.content__fullScreen, { marginTop: insets.top }]
          : // QA-67: bounded by the sheet's cap right here, one level above the
            // `ScrollView`, so the body scrolls inside the cap and the footer
            // stays visible.
            [styles.content__sheet, { maxHeight: contentMaxHeight }],
      ]}
    >
      <View style={styles.top_bar}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={() => hide()}>
          <IconSymbol name={'xmark'} color={colors.textPrimary} size={24} />
        </Pressable>
      </View>
      <ScrollView
        style={fullScreen ? styles.scroll__fullScreen : styles.scroll__sheet}
        contentContainerStyle={[styles.scrollContent, fullScreen && styles.scrollContent__fullScreen]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}
