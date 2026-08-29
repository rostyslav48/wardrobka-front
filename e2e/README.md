# Web e2e (Playwright + Chromium)

Drives the Expo Router **web** build against the live backend. The config starts
`expo start --web` itself (`EXPO_OFFLINE=1`, `reuseExistingServer: true`), so the
backend stack is the only thing you need running first — see
`planning/qa/E2E-TEST-COVERAGE.md`.

```bash
npx playwright install chromium   # once
npm run test:e2e
npx playwright test --ui          # interactive
```

## Layout

| file | purpose |
|---|---|
| `support/app.ts` | account creation via the API, `openApp()` (console-error capture), `loginThroughUi()` (429-aware) |
| `known-bugs.e2e.ts` | one `test.fail()` reproduction per open defect |
| `journeys.e2e.ts` | the real user journeys — login, tabs, session persistence |

## Current state

`journeys.e2e.ts` **skips itself at runtime** while the web build cannot boot
(BUG-F01): each test's `beforeEach` checks for the login screen and skips with
*"blocked by BUG-F01"*. Fix the boot crash and all twelve run unchanged — they
were verified green against a locally patched build during the QA pass.

## Gotchas

- `EXPO_PUBLIC_API_BASE_URL` in `.env` **overrides** the shell environment, and
  it currently points at a LAN address. Use `.env.local` to retarget.
- `POST /auth/login` is rate limited to 10/60s; use `loginThroughUi()`, which
  waits out the window rather than failing.
- The backend sends no CORS headers (BUG-008), so a browser cannot reach the API
  until that is fixed — journeys will still skip on BUG-F01 first.
