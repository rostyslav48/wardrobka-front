---
category: Forms
---

Multi-line variant of `UiInput`, same controlled contract.

```jsx
<UiFormField>
  <UiTextArea
    value={notes}
    onChange={setNotes}
    placeholder="Anything worth remembering about this piece?"
    numberOfLines={6}
  />
</UiFormField>
```

`numberOfLines` (default 4) sets the resting height; the field scrolls past it rather
than growing.
