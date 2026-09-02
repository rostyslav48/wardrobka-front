---
category: Forms
---

The one-line "ask a question" composer: a growing multiline field and a square send
button. Pair it with `PromptShortcutChips` above.

```jsx
<QuickChatInput
  value={value}
  onChangeText={setValue}
  onSubmit={send}
  isLoading={isSubmitting}
/>
```

It is a controlled input — it holds no state of its own. `onSubmit` fires from the
send button and from the return key, and is suppressed while the value is blank or
`isLoading` is set; the button dims in both cases. While `isLoading` the field is
read-only and the glyph is replaced by a spinner.

The field grows with its content up to 100px, then scrolls.
