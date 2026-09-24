import Animated, { useAnimatedRef } from 'react-native-reanimated';
import {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
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
   * (a fraction of the viewport height, default 0.3) of the bottom, and is
   * also re-checked whenever the content's own intrinsic height changes, so
   * a page that doesn't overflow the viewport still triggers - the same
   * shape and semantics as `FlatList`'s own prop, for a screen that
   * paginates but can't use a `FlatList` because it lives inside this scroll
   * view (nesting one virtualized list inside another is invalid RN).
   */
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}>;

/** Imperative handle for screens that need to reset scroll position, e.g. on
 * tab focus (QA-11: tab screens stay mounted, so a screen left mid-scroll
 * shows that same offset - with the scrollable title gone - on return). */
export interface UiPageHandle {
  scrollToTop: () => void;
}

type ScrollProps = Omit<Props, 'tabBarInset'> & {
  bottomInset: number;
  innerRef: ForwardedRef<UiPageHandle>;
};

function PageScrollView({
  children,
  topInset = spacing.statusBar,
  refreshControl,
  contentStyle,
  bottomInset,
  header,
  onEndReached,
  onEndReachedThreshold = 0.3,
  innerRef,
}: ScrollProps) {
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useImperativeHandle(innerRef, () => ({
    scrollToTop: () => scrollRef.current?.scrollTo({ y: 0, animated: false }),
  }));
  const hasFiredRef = useRef(false);
  // Mirrors FlatList's own onEndReached, which also fires on content-size
  // change (not only on scroll) - a page of results short enough not to
  // overflow the viewport would otherwise never trigger the next page.
  const layoutHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollYRef = useRef(0);

  const checkEndReached = () => {
    if (!onEndReached) return;
    const distanceFromEnd =
      contentHeightRef.current - layoutHeightRef.current - scrollYRef.current;
    const nearEnd = distanceFromEnd <= layoutHeightRef.current * onEndReachedThreshold;

    if (nearEnd && !hasFiredRef.current) {
      hasFiredRef.current = true;
      onEndReached();
    } else if (!nearEnd) {
      hasFiredRef.current = false;
    }
  };

  const handleScroll = onEndReached
    ? (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        scrollYRef.current = contentOffset.y;
        contentHeightRef.current = contentSize.height;
        layoutHeightRef.current = layoutMeasurement.height;
        checkEndReached();
      }
    : undefined;

  const handleLayout = onEndReached
    ? (event: LayoutChangeEvent) => {
        layoutHeightRef.current = event.nativeEvent.layout.height;
        checkEndReached();
      }
    : undefined;

  // The scroll view's own `contentSize` (what `onScroll`/`onContentSizeChange`
  // report) is the flexGrow:1 content container's *rendered* height, which is
  // stretched to fill the viewport whenever real content is shorter than it -
  // see `styles.ts`'s note on why `content` uses flexGrow. That means it can
  // never be measured as "shorter than the viewport", which defeats this
  // check for exactly the case it exists for. This inner wrapper has no
  // flexGrow, so its `onLayout` reports children's true intrinsic height -
  // content/layout changes are rare, unlike scroll, so each one re-evaluates
  // fresh rather than the scroll path's "fired once, wait for nearEnd to
  // clear" coalescing.
  const handleInnerLayout = onEndReached
    ? (event: LayoutChangeEvent) => {
        contentHeightRef.current = event.nativeEvent.layout.height;
        hasFiredRef.current = false;
        checkEndReached();
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
        onLayout={handleLayout}
        keyboardDismissMode="on-drag"
        // Not React Native's 'never' default, under which a child does not
        // receive the tap that dismisses the keyboard. Every screen built on
        // UiPage puts its inputs and buttons in this scroll view, so the first
        // tap on a send button would otherwise be swallowed on iOS/Android.
        keyboardShouldPersistTaps="handled"
      >
        {
          // The inner-height wrapper only mounts for onEndReached callers -
          // it would otherwise sit between the flexGrow content container and
          // its direct children for every screen, breaking any `contentStyle`
          // that uses `gap` between multiple children (ItemDetailScreen and
          // NewItemScreen's `form` style both do).
          onEndReached ? (
            <View onLayout={handleInnerLayout}>{children}</View>
          ) : (
            children
          )
        }
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

function UiPage(
  { tabBarInset = false, ...rest }: Props,
  ref: ForwardedRef<UiPageHandle>,
) {
  return tabBarInset ? (
    <TabBarInsetPage {...rest} innerRef={ref} />
  ) : (
    <PageScrollView {...rest} bottomInset={0} innerRef={ref} />
  );
}

export default forwardRef(UiPage);
