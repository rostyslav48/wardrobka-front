---
category: Forms
---

Chip group — the system's only picker. Values are strings, so enum members go in
directly.

```jsx
<UiSelect
  options={[
    { label: 'Winter', value: 'winter' },
    { label: 'Spring', value: 'spring' },
  ]}
  value={season}
  onChange={setSeason}
/>
```

By default it is deselectable: tapping the active chip calls `onChange(undefined)`.
Pass `required` when the field must always hold a value.

`horizontal` swaps the wrapping grid for one scrolling row — use it when the option
list is long and the order matters more than seeing all of it at once.
