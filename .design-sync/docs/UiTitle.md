---
category: Typography
---

Every piece of text in the app. The size is picked by a boolean flag rather than a
scale value — pass exactly one; with none, the default applies.

Each flag is one of the type roles measured off the artboard (`redesign-spec.md`
section 4.3), so the flag names carry a size *and* a weight:

| Prop | Size / weight | Role it is the redesign's name for |
|---|---|---|
| `sizeXS` | 14.5px / 500 | chat session title |
| `sizeS` | 18px / 600 | button label |
| `sizeM` | 20px / 700 | stat numeral |
| `sizeL` | 28px / 400 | screen title — "Wardrobe", "Chats", "Settings" |
| _(none)_ | 22px / 400 | sheet title — "Filters", "Add item" |

```jsx
<UiTitle sizeL>Your wardrobe</UiTitle>
<UiTitle sizeS numberOfLines={2}>
  Everything you own, in one place.
</UiTitle>
```

The two largest roles are the serif ones in the mockup, so they are set at weight 400,
not 700 — reach for `sizeL` when you want a screen title, not when you want bold.

Colour comes from the token `--wa-text-primary`; override per-instance through
`style` rather than wrapping the text in another element.
