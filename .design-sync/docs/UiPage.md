---
category: Layout
---

The scroll container every screen starts with. It applies the safe-area insets and
the standard horizontal page padding (`--wa-page-inline-intent`, 20px).

```jsx
<UiPage>
  <UiTitle sizeL>Wardrobe</UiTitle>
  {items.map((item) => <ItemRow key={item.id} item={item} />)}
</UiPage>
```

**`topInset` controls the space above the title.** It defaults to 62px — the scroll
region's measured top padding — and is added to the safe-area top inset, so a screen
that should sit flush under the status bar passes `topInset={0}`:

```jsx
<UiPage topInset={0}>…</UiPage>
```

It replaces the old `indented` boolean, which never had an observable effect.

Three more props exist for tab screens:

- `refreshControl` — a `<RefreshControl/>`, handed straight to the scroll view. The
  page padding deliberately lives on a wrapper around the scroll view, because
  react-native-web clones a refresh control with the scroll view's own `style` and
  would otherwise apply that padding twice.
- `tabBarInset` — adds the bottom tab bar's height to the content's bottom padding.
  It defaults to `false` and is **only valid inside a bottom-tab navigator**; setting
  it anywhere else throws.
- `contentStyle` — a React Native style object applied to the scroll content
  container after the defaults.
- `header` — rendered above the scroll view, inside the same top-padded frame, so
  it stays fixed while the body scrolls. For a pushed route's back-button + title
  bar (the item form uses this); tab-root screens have none and omit it.
- `onEndReached` / `onEndReachedThreshold` — fires once when scroll position gets
  within `onEndReachedThreshold` (a fraction of the viewport height, default 0.3) of
  the bottom. Same shape as `FlatList`'s own prop, for a screen that paginates but
  renders its list as a plain `View` inside this scroll view rather than nesting a
  second virtualized list (outfit history uses this).

Taps reach children while the keyboard is up: the scroll view sets
`keyboardShouldPersistTaps="handled"` rather than React Native's `'never'` default, so
a screen can put a text input and its submit button in the same page without the first
tap being swallowed. It still dismisses the keyboard on drag.

Content taller than the viewport scrolls: the content container grows rather than
being pinned to one screen height.
