## How to build with this system

These components are **React Native**, compiled to the browser through
`react-native-web`. That single fact drives every convention below.

### There are no CSS classes

Nothing in this system is styled by class name. Component styles are RN
`StyleSheet` objects compiled into atomic CSS that `react-native-web` injects at
runtime — you cannot target them, extend them, or guess their names. Style through
the `style` prop, with a **React Native style object**: camelCase keys, unitless
numbers, no shorthand strings.

```jsx
// right
<UiButton style={{ marginTop: 24 }} onPress={save}>…</UiButton>

// wrong — no class vocabulary exists, and shorthand strings don't parse
<UiButton className="mt-6">…</UiButton>
<UiButton style={{ margin: '24px 0' }}>…</UiButton>
```

Only `UiButton`, `UiTitle`, and `UiToast` accept `style`, and `UiPage` accepts
`contentStyle` for its scroll content. The rest are styled entirely by their own
props.

### Wrap the tree in both providers

`window.WardrobeUi` exports two providers alongside the components. Mount them once
at the root:

```jsx
const { SafeAreaProvider, ModalProvider, UiPage } = window.WardrobeUi;

<SafeAreaProvider initialMetrics={{
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}}>
  <ModalProvider>
    <UiPage>…</UiPage>
  </ModalProvider>
</SafeAreaProvider>
```

`UiPopup` calls `useModal()` and **throws** outside `ModalProvider`. `UiPage` and
`UiPopup` read `useSafeAreaInsets()`; without `SafeAreaProvider` (or without
`initialMetrics` in a static render) they measure asynchronously and can render
empty on first paint.

### Tokens

The palette ships as CSS custom properties in `tokens/tokens.css`, reachable through
`styles.css`. Component colours are already baked in — use these for **your own**
layout glue, never to restyle a component:

`--wa-background` · `--wa-surface` · `--wa-text-primary` · `--wa-text-secondary` ·
`--wa-border` · `--wa-accent` · `--wa-accent-text` · `--wa-error` ·
`--wa-error-background` · `--wa-placeholder` · `--wa-status-active` ·
`--wa-status-washing` · `--wa-status-missing` · `--wa-status-need-repair` ·
`--wa-page-inline-intent` (20px, the standard page gutter)

The app is **dark only** — there is no light theme. `styles.css` sets the body
ground to `--wa-background`; anything you paint yourself must stay on that footing.

### Text is always UiTitle

There is no separate heading/body/caption component. `UiTitle` is every string, and
its size is a boolean flag. Each flag is one of the measured type roles, so it
carries a weight as well as a size — `sizeXS` (14.5 / 500, chat session title) ·
`sizeS` (18 / 600, button label) · `sizeM` (20 / 700, stat numeral) · `sizeL`
(28 / 400, screen title), or none for the 22 / 400 sheet-title default. Pass
exactly one. The two largest roles are serif in the design and are therefore set
at weight 400: reach for `sizeL` when you want a screen title, not when you want
bold.

### UiButton does not colour its own label

The filled variant sits on `--wa-accent`, which is near-white. Its label must be
inverted by the caller or it renders invisible:

```jsx
<UiButton onPress={save}>
  <UiTitle sizeS style={{ color: 'var(--wa-accent-text)' }}>Save item</UiTitle>
</UiButton>

<UiButton secondary onPress={cancel}>
  <UiTitle sizeS>Cancel</UiTitle>   {/* secondary keeps the default text colour */}
</UiButton>
```

### Two components are imperative, not declarative

`UiToast` renders nothing until you call `ref.current.show(message, 'success' |
'error')`, and fades itself out after ~2.7s. `UiPopup` does not present itself —
`useModal().show({ content: <UiPopup …/> })` does.

### Known defects

None outstanding. `UiPage`'s `indented` prop used to be inert — its 60px top offset
was always overridden by the `paddingTop: insets.top` that followed it in the style
array. It has been replaced by `topInset?: number`, which is *added* to the
safe-area inset and defaults to 62px; pass `topInset={0}` for a flush screen. The
same change lifted the `height: '100%'` cap on the scroll content, so a `UiPage`
taller than one viewport now scrolls.

### Read before styling

`styles.css` and the `tokens/tokens.css` it imports are the whole static surface —
everything else is runtime-injected. For any single component, read
`components/<group>/<Name>/<Name>.prompt.md` (usage) and `<Name>.d.ts` (props).
