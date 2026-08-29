---
category: Feedback
---

Inline error banner — a tinted block on `--wa-error-background` with
`--wa-error` text. Render it conditionally; it has no empty state of its own.

```jsx
{error && <UiError errorMessage={error} />}
```

For field-level errors use `UiFormField`'s `errorMessage` instead; this one is for
form- or screen-level failures.
