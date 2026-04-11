import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { PropsWithChildren } from 'react';
import { styles } from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  indented?: boolean;
}>;

export default function UiPage({ children, indented = true }: Props) {
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={[
        styles.container,
        indented && styles.container__indented,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
    >
      {children}
    </Animated.ScrollView>
  );
}
