import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { styles } from './styles';

export default function TypingIndicator() {
  const dot0 = useRef(new Animated.Value(0.3)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createDotAnim = (dot: Animated.Value, delay: number) => {
      const restAfter = 600 - delay;
      const sequence: Animated.CompositeAnimation[] = [];

      if (delay > 0) {
        sequence.push(
          Animated.timing(dot, { toValue: 0.3, duration: delay, useNativeDriver: true }),
        );
      }
      sequence.push(
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      );
      if (restAfter > 0) {
        sequence.push(
          Animated.timing(dot, { toValue: 0.3, duration: restAfter, useNativeDriver: true }),
        );
      }

      return Animated.loop(Animated.sequence(sequence));
    };

    const anim = Animated.parallel([
      createDotAnim(dot0, 0),
      createDotAnim(dot1, 200),
      createDotAnim(dot2, 400),
    ]);

    anim.start();
    return () => anim.stop();
  }, [dot0, dot1, dot2]);

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { opacity: dot0 }]} />
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      </View>
    </View>
  );
}
