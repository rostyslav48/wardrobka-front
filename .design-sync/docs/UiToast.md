---
category: Feedback
---

Transient confirmation, pinned above the tab bar. Imperative rather than
declarative — hold a ref and call `show`; it fades in, holds ~2.5s, fades out.

```jsx
const toast = useRef(null);

<UiToast ref={toast} />
<UiButton onPress={() => toast.current.show('Saved', 'success')}>
  <UiTitle sizeS>Save</UiTitle>
</UiButton>
```

`type` is `'success'` or `'error'` and only changes the background. The toast reads
the bottom-tab height from context, so it sits correctly on tabbed and untabbed
screens alike. It is `pointerEvents="none"` — never put controls inside it.
