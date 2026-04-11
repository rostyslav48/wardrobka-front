import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useModal } from '@/context/ModalContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';
import { colors } from '@/theme/colors';

type Props = PropsWithChildren<{
  fullScreen?: boolean;
  title?: string;
}>;

export default function UiPopup({ children, fullScreen = true, title }: Props) {
  const insets = useSafeAreaInsets();

  const { hide } = useModal();

  return (
    <View
      style={[
        styles.content,
        fullScreen && styles.content__fullScreen,
        { paddingBottom: insets.bottom, marginTop: insets.top },
      ]}
    >
      <View style={styles.top_bar}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={() => hide()}>
          <IconSymbol name={'xmark'} color={colors.textPrimary} size={24} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
