---
category: Wardrobe
---

Three-column picker for choosing wardrobe items, normally rendered inside a `UiPopup`.
Selection is internal: it seeds from `selectedIds`, reports every change through
`onSelectionChange`, and hands the final set to `onConfirm`.

```jsx
<ItemPickerSheet
  items={wardrobeItems}
  selectedIds={outfit.itemIds}
  onConfirm={(ids) => saveOutfit(ids)}
/>
```

Header and confirm label are derived from the live count ("3 selected",
"Confirm 3 items") unless you override `title` / `subtitle` / `confirmLabel`. Items
without `img_url` fall back to a t-shirt glyph, and an empty `items` array renders its
own empty state.

Set `hideHeader` when the surrounding `UiPopup` already carries the title.
