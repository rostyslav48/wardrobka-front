import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Animated, StyleProp, Text, ViewStyle } from 'react-native';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { spacing } from '@/theme/layout';
import { styles } from './styles';

export interface UiToastRef {
  show: (message: string, type: 'success' | 'error') => void;
}

interface Props {
  style?: StyleProp<ViewStyle>;
}

const UiToast = forwardRef<UiToastRef, Props>(({ style }, ref) => {
  // Read the tab-bar height via context so the toast can also be used on
  // screens rendered outside a bottom-tab navigator (where the hook throws).
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const opacity = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useImperativeHandle(ref, () => ({
    show(msg: string, t: 'success' | 'error') {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationRef.current) animationRef.current.stop();
      setMessage(msg);
      setType(t);
      opacity.setValue(0);
      animationRef.current = Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
    },
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: tabBarHeight + spacing.xl },
        type === 'error' ? styles.container__error : styles.container__success,
        { opacity },
        style,
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

UiToast.displayName = 'UiToast';
export default UiToast;
