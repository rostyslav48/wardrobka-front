---
category: Wardrobe
---

Row in the outfit-history list: the originating chat topic, item thumbnails, the
assistant's summary, the item names, and a relative date.

```jsx
<OutfitSuggestionCard
  suggestion={suggestion}
  thumbnails={suggestion.wardrobeItemIds.map((id) => itemsById[id]?.img_url)}
  itemNames={suggestion.wardrobeItemIds.map((id) => itemsById[id]?.name)}
  onPress={() => router.push(`/assistant/${suggestion.sessionId}`)}
  onDelete={() => remove(suggestion.id)}
/>
```

Both arrays are index-aligned with `wardrobeItemIds` and tolerate holes — a missing
thumbnail shows the placeholder glyph, a missing name reads "Deleted item". That is
deliberate: suggestions outlive the items they reference.

At most four thumbnails render; the rest collapse into a `+n` badge. Omitting
`onDelete` hides the delete affordance entirely.
