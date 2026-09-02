import Animated, { useAnimatedRef } from 'react-native-reanimated';
import { PropsWithChildren, ReactElement, ReactNode, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
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
  /**
   * Rendered above the scroll view, inside the same top-padded frame, so it
   * stays fixed while the body scrolls. For the back-button + title bar a
   * pushed route (e.g. the item form) needs; tab-root screens have none.
   */
  header?: ReactNode;
  /**
   * Fires once when the scroll position gets within `onEndReachedThreshold`
   * (a fraction of the viewport height, default 0.3) of the bottom - the same
   * shape as `FlatList`'s own prop, for a screen that paginates but can't use
   * a `FlatList` because it lives inside this scroll view (nesting one
   * virtualized list inside another is invalid RN).
   */
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}>;

type ScrollProps = Omit<Props, 'tabBarInset'> & { bottomInset: number };

function PageScrollView({
  children,
  topInset = spacing.statusBar,
  refreshControl,
  contentStyle,
  bottomInset,
  header,
  onEndReached,
  onEndReachedThreshold = 0.3,
}: ScrollProps) {
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const hasFiredRef = useRef(false);

  const handleScroll = onEndReached
    ? (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromEnd =
          contentSize.height - layoutMeasurement.height - contentOffset.y;
        const nearEnd = distanceFromEnd <= layoutMeasurement.height * onEndReachedThreshold;

        if (nearEnd && !hasFiredRef.current) {
          hasFiredRef.current = true;
          onEndReached();
        } else if (!nearEnd) {
          hasFiredRef.current = false;
        }
      }
    : undefined;

  return (
    // The page padding lives on this wrapper, not on the scroll view's own
    // `style`: react-native-web clones a `refreshControl` with `style:
    // props.style` and keeps it on the scroll view too, so anything put there
    // is applied twice on web. It stays outside the scroller for the same
    // reason it always did - the top offset must not scroll away under the
    // content. The bottom inset belongs to the content, so it scrolls in.
    <View style={[styles.container, { paddingTop: insets.top + topInset }]}>
      {header}
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + bottomInset },
          contentStyle,
        ]}
        refreshControl={refreshControl}
        onScroll={handleScroll}
        scrollEventThrottle={handleScroll ? 100 : undefined}
        keyboardDismissMode="on-drag"
        // Not React Native's 'never' default, under which a child does not
        // receive the tap that dismisses the keyboard. Every screen built on
        // UiPage puts its inputs and buttons in this scroll view, so the first
        // tap on a send button would otherwise be swallowed on iOS/Android.
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Animated.ScrollView>
    </View>
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
