---
category: Forms
---

The wrapper every form control goes in. It owns the full width and the error slot, so
inputs themselves never render their own error text.

```jsx
<UiFormField errorMessage={touched.email ? errors.email : undefined}>
  <UiInput value={values.email} onChange={handleChange('email')} placeholder="Email" />
</UiFormField>
```

With Formik, pass `errors.<field>` only once the field is touched — otherwise the form
shows errors before the user has typed anything.
