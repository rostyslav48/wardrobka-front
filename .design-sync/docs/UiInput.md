---
category: Forms
---

Single-line text field. Controlled: `onChange` receives the string, not an event.

```jsx
<UiInput value={email} onChange={setEmail} placeholder="Email" />
<UiInput value={password} onChange={setPassword} placeholder="Password" isSecureText />
```

`isSecureText` masks the value and adds the eye toggle. `readonly` dims the field and
blocks editing — use it for values the user can see but not change, not for disabled
form state.

Always wrap in `UiFormField` so validation errors have somewhere to go.
