---
category: Feedback
---

The "there is nothing here yet" block: a glyph in a 64px disc, a title, and one line
of explanation. Centred, and capped at 260px wide so the subtitle wraps to a readable
measure.

```jsx
<UiEmptyState
  icon="sparkles"
  title="No suggestions yet"
  subtitle="Start a chat below to get personalised outfit ideas from your wardrobe."
/>
```

`icon` is any name the icon set maps — `sparkles`, `calendar`, `tshirt.fill`,
`photo.on.rectangle`. It is drawn at 24px in `--wa-text-secondary`.

All three props are required: an empty state without a next step reads as a bug.
Put the action *after* the component, not inside it.
