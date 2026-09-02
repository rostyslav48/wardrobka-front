import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { PropsWithChildren, ReactElement } from 'react';
import { RefreshControlProps, StyleProp, ViewStyle } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { styles } from './styles';
import { spacing } from '@/theme/layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  /**
   * Extra top padding above the safe-area inset. Defaults to the scroll
   * region's measured top padding in spec section 6.1.
   */
  topInset?: number;
  /** Passed straight through to the underlying scroll view. */
  refreshControl?: ReactElement<RefreshControlProps>;
  /**
   * Clear the bottom tab bar. Off by default because `useBottomTabBarHeight()`
   * throws outside a bottom-tab navigator.
   */
  tabBarInset?: boolean;
  /** Applied to the scroll content container, after the defaults. */
  contentStyle?: StyleProp<ViewStyle>;
}>;

type ScrollProps = Omit<Props, 'tabBarInset'> & { bottomInset: number };

function PageScrollView({
  children,
  topInset = spacing.statusBar,
  refreshControl,
  contentStyle,
  bottomInset,
}: ScrollProps) {
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      // The top offset sits on the scroll frame so it stays put while the
      // content moves under it, which is what the screens already relied on.
      // The bottom inset belongs to the content, so it scrolls into view.
      style={[styles.container, { paddingTop: insets.top + topInset }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + bottomInset },
        contentStyle,
      ]}
      refreshControl={refreshControl}
      keyboardDismissMode="on-drag"
    >
      {children}
    </Animated.ScrollView>
  );
}

// Hooks cannot be called conditionally, and `useBottomTabBarHeight()` throws
// outside a bottom-tab navigator - so it lives in its own component that is
// only ever mounted when `tabBarInset` is set.
function TabBarInsetPage(props: Omit<ScrollProps, 'bottomInset'>) {
  return <PageScrollView {...props} bottomInset={useBottomTabBarHeight()} />;
}

export default function UiPage({ tabBarInset = false, ...rest }: Props) {
  return tabBarInset ? (
    <TabBarInsetPage {...rest} />
  ) : (
    <PageScrollView {...rest} bottomInset={0} />
  );
}
