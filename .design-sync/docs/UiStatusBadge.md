---
category: Feedback
---

The item-status pill: a stadium badge whose ground is the status colour at 13% and
whose label matches it. Extracted in Phase 5 from the item grid card and the item
form, where the same ad-hoc badge markup appeared twelve times in the mockup
(spec section 7.3).

```jsx
<UiStatusBadge label="Ready" tone="active" />
<UiStatusBadge label="Washing" tone="washing" onPress={() => {}} />
```

`tone` is one of `active | washing | missing | needRepair`, matching the four
`status*` keys in `theme/colors.ts`. Pass `onPress` for the inline quick-change
affordance the item grid uses — the badge renders as a `Pressable` instead of a
`View`; omit it for a read-only badge.
