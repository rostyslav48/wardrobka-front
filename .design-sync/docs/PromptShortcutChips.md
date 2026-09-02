---
category: Actions
---

A single horizontally scrolling row of tappable prompt suggestions — the "Ask
Wardropka" affordance. Each chip shows a short `label` and hands back a longer
`prompt` when tapped.

```jsx
<PromptShortcutChips
  shortcuts={[
    { label: 'Rainy day', prompt: 'What should I wear if it rains today?' },
    { label: 'Office', prompt: 'Put together something for a day of meetings.' },
  ]}
  onSelect={(prompt) => setInput(prompt)}
/>
```

`onSelect` fires with the `prompt`, not the `label`. The row never wraps; it scrolls,
so the list can be as long as you like. Keep labels to two or three words — the chip
is sized by its text.
