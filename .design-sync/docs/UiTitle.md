---
category: Typography
---

Every piece of text in the app. The size is picked by a boolean flag rather than a
scale value — pass exactly one; with none, the default (24px) applies.

| Prop | Size |
|---|---|
| `sizeXS` | 14px |
| `sizeS` | 16px |
| `sizeM` | 20px |
| `sizeL` | 28px |
| _(none)_ | 24px |

```jsx
<UiTitle sizeL>Your wardrobe</UiTitle>
<UiTitle sizeS numberOfLines={2}>
  Everything you own, in one place.
</UiTitle>
```

Colour comes from the token `--wa-text-primary`; override per-instance through
`style` rather than wrapping the text in another element.
