import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { ReactNode } from 'react';
import { styles } from './styles';

interface Props {
  indented?: boolean;
  children: ReactNode;
}

export default function UiPage({ children, indented = true}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={[styles.container, indented && styles.container__indented]}
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
    >
      {children}
    </Animated.ScrollView>
  );
}
