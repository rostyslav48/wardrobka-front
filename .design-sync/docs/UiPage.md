---
category: Layout
---

The scroll container every screen starts with. It applies the safe-area insets and
the standard horizontal page padding (`--wa-page-inline-intent`, 20px).

```jsx
<UiPage>
  <UiTitle sizeL>Wardrobe</UiTitle>
  {items.map((item) => <ItemRow key={item.id} item={item} />)}
</UiPage>
```

**`indented` currently has no observable effect.** It is meant to add a 60px top
offset, but the component's style array ends with `{ paddingTop: insets.top }`,
which overrides that value whether the prop is true or false. Both settings render
identically. Treat the prop as inert until the component is fixed upstream — do not
reach for it to control spacing, and do not assume `indented={false}` removes the
horizontal page padding, which it never did.
