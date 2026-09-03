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

`icon`, `title` and `subtitle` are required: an empty state without a next step reads
as a bug. `actionLabel` + `onAction` are optional and must be provided together — when
set, they render a filled pill button below the subtitle:

```jsx
<UiEmptyState
  icon="tshirt.fill"
  title="Your wardrobe is empty"
  subtitle="Add a few pieces and the assistant can start putting outfits together."
  actionLabel="+ Add your first item"
  onAction={() => router.push('/item/new')}
/>
```

Omit the action only when a screen already has an equivalent affordance elsewhere
(e.g. a FAB) and a second one would be redundant.
