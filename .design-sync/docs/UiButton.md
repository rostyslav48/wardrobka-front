---
category: Actions
---

The only button in the system. Filled accent by default; `secondary` gives the
outlined treatment. There is no size prop — sizing comes from the layout around it.

```jsx
<UiButton onPress={() => save()}>
  <UiTitle sizeS>Save changes</UiTitle>
</UiButton>
```

`children` is free-form, so the label is normally a `UiTitle`. For async work, set
`enableLoader` and drive the spinner from the event handle:

```jsx
<UiButton
  enableLoader={false}
  onPress={(e) => {
    e.loader();
    submit().finally(() => e.stopLoader());
  }}
>
  <UiTitle sizeS>Submit</UiTitle>
</UiButton>
```

While loading the button is disabled and swaps its children for a spinner.
