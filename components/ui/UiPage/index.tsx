import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { ReactNode } from 'react';
import { styles } from './styles';

interface Props {
  children: ReactNode;
}

export default function UiPage({ children }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
    >
      {children}
    </Animated.ScrollView>
  );
}
