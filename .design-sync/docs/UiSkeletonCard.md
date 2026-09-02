---
category: Feedback
---

The loading stand-in for `OutfitSuggestionCard`. Its box is identical — same ground,
same 16px radius, same 12px padding and 12px bottom margin — so a list does not shift
when the real cards arrive.

```jsx
{isLoading
  ? <><UiSkeletonCard /><UiSkeletonCard /><UiSkeletonCard /></>
  : suggestions.map((s) => <OutfitSuggestionCard key={s.id} suggestion={s} … />)}
```

It takes no props and does not animate. Render one per card-shaped row you are
waiting on — three is the house count for a first load.
