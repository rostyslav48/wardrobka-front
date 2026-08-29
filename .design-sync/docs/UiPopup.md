---
category: Layout
---

The body of a bottom-sheet modal: a titled top bar with a close button, over a
scrollable content area. It does not present itself — `useModal().show()` does that,
and the popup's close button calls `hide()` from the same context.

```jsx
const { show } = useModal();

show({
  content: (
    <UiPopup title="Add item">
      <UiFormField>
        <UiInput value={name} onChange={setName} placeholder="Name" />
      </UiFormField>
    </UiPopup>
  ),
});
```

`fullScreen` (default `true`) makes the sheet fill the viewport; set it to `false`
for a short sheet that hugs its content.
