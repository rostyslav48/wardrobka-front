# CLAUDE.md — wardrobe-assistant-front

## Project Overview
React Native / Expo app for wardrobe management. Targets iOS, Android, and Web via Expo Router.

## Tech Stack
- **Framework**: Expo 57 + React Native 0.86.3 + React 19.2.3
- **Routing**: Expo Router 57 (file-based, `app/` directory)
- **State**: React Context + RxJS Observables (no Redux/Zustand)
- **Forms**: Formik + Yup validation
- **HTTP**: RxJS Ajax (`services/http.service.ts`)
- **Styling**: React Native `StyleSheet` only — no CSS-in-JS libraries
- **Animations**: `react-native-reanimated`
- **Storage**: `expo-secure-store` (auth tokens); `@react-native-async-storage/async-storage` (non-secret device state, e.g. push token cache, notification prefs)
- **Icons**: `@expo/vector-icons` + `expo-symbols`
- **Language**: TypeScript (strict mode)
- **New Architecture**: enabled (`newArchEnabled: true` in `app.json`)

## Commands
```
npm install          # install deps
expo start           # start dev server (prompts for iOS/Android/Web)
expo start --ios     # iOS simulator
expo start --android # Android emulator
expo start --web     # browser
expo lint            # ESLint (eslint-config-expo, flat config)
npm run test:e2e     # Playwright e2e against the web build (see Testing)
```
No build script defined yet. `scripts/reset-project.js` resets to a clean Expo scaffold.

## Directory Structure
```
app/          # Expo Router routes (file = route)
  (app)/      # authenticated routes
  (auth)/     # login/register
components/
  ui/         # reusable UI primitives (UiButton, UiInput, UiPage, UiPopup, …)
  pages/      # page-specific components, organized by route
context/      # React Context providers (AuthContext, ModalContext)
services/     # API layer (http.service.ts, auth.service.ts)
theme/        # app-wide design tokens (colors.ts, layout.ts)
constants/    # app constants (e.g. notifications.ts)
hooks/        # custom hooks; platform variants use `.web.ts` suffix
assets/       # fonts, images
config.ts     # reads EXPO_PUBLIC_* env vars
```

## Code Style
- **TypeScript strict** — no `any`, no ignoring type errors
- **Prettier**: `singleQuote: true`, `trailingComma: "all"` (`.prettierrc`)
- **Imports**: use `@/` alias (maps to repo root, set in `tsconfig.json`)
- **ESLint**: runs via `expo lint`; VSCode auto-fixes on save (`.vscode/settings.json`)
- **Modules**: ESM throughout — no `require()` except in config files
- **Exports**: default export from `index.tsx` per component folder

## Forms & Validation
- Formik + Yup validation schemas live in a co-located `validators/` subfolder, never inline in the component
- Named export from the validator file (e.g. `export const profileSchema = Yup.object(…)`)
- File extension is `.ts` (no JSX), e.g. `ProfileSection/validators/profileValidation.ts`

## Component Conventions
- Each UI component lives in its own folder: `components/ui/ComponentName/index.tsx` + `styles.ts`
- Styles are always in a co-located `styles.ts` using `StyleSheet.create()`
- Use `theme/colors.ts` for all color values — do not hardcode hex strings
- `theme/layout.ts` holds the full redesign scale — spacing, radius, type
  (`typography`/`tracking`/`fontFamily`), `border` and `iconSize` — transcribed
  from `.design-sync/redesign-spec.md`; `pageInlineIntent` is the page gutter
- Props type named `Props` or `PropsWithChildren<Props>`, defined locally in the component file
- Platform-specific files: use `.ios.tsx` / `.web.ts` suffixes

## Services & Data Fetching
- All HTTP goes through `services/http.service.ts` (RxJS Ajax)
- HTTP services return `Observable<T>` — subscribe at the call site (usually in context or component)
- Device-facing services that wrap Promise-based Expo SDKs (e.g. `services/notifications.service.ts`) are plain async modules; when they need an HTTP call, they go through the Observable services via `firstValueFrom`
- Auth token is managed by `context/AuthContext.tsx` via `expo-secure-store`
- Add auth header via `AuthApiService.addAuthHeader(token)` — it mutates `httpService` defaults
- API base URL is `EXPO_PUBLIC_API_BASE_URL` (see `.env.example`)

## Routing
- Expo Router file-based: `app/(app)/(tabs)/index.tsx` → home tab
- Auth guard lives in `app/(app)/_layout.tsx` — redirects unauthenticated users to `(auth)/login`
- Typed routes enabled (`experiments.typedRoutes: true` in `app.json`)
- Expo Router 57 vendors React Navigation — import `Tabs`, `useBottomTabBarHeight`,
  `BottomTabBarHeightContext` and `BottomTabBarButtonProps` from `expo-router/js-tabs`,
  and `PlatformPressable` / `ThemeProvider` / `DarkTheme` from `expo-router/react-navigation`.
  Do **not** add `@react-navigation/*` packages back: their contexts are separate instances
  from the ones Expo Router renders, so hooks read from them return nothing at runtime.

## State & Context
- `useAuth()` — auth state + login/register/logout (Observables)
- `useModal()` — show/hide animated bottom sheet modal

## Testing
End-to-end tests drive the Expo Router **web** build with Playwright
(`playwright.config.ts`, specs in `e2e/*.e2e.ts`). Run with `npm run test:e2e`
(`npm run test:e2e:report` opens the last HTML report). They require the
backend stack running and read `EXPO_WEB_PORT`/`API_BASE_URL` — see
`e2e/README.md`. No unit test runner is configured for this repo.

## Environment Variables
Copy `.env.example` → `.env.local` and set `EXPO_PUBLIC_API_BASE_URL`.
Only `EXPO_PUBLIC_*` variables are exposed to the client bundle by Expo.

## Gotchas & Things to Avoid
- `react-native-worklets` is in deps — likely required by `react-native-reanimated`; do not remove
- `newArchEnabled: true` — avoid libraries that are not compatible with the React Native New Architecture
- `StyleSheet.absoluteFillObject` was removed in RN 0.86 — use `StyleSheet.absoluteFill`, which is now the plain object
- `expo lint` currently reports pre-existing `react-hooks` errors (`refs`, `set-state-in-effect`,
  `immutability`) newly enabled by eslint-plugin-react-hooks 7 in SDK 57; they predate the SDK 57 upgrade
- The app is **portrait-only** (`"orientation": "portrait"` in `app.json`)
- No global error boundary is set up yet — RxJS errors must be caught per-subscription
- No CI/CD or build pipeline is configured yet *(fill in if added)*
