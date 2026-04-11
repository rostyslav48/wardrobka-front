# CLAUDE.md — wardrobe-assistant-front

## Project Overview
React Native / Expo app for wardrobe management. Targets iOS, Android, and Web via Expo Router.

## Tech Stack
- **Framework**: Expo 54 + React Native 0.81.5 + React 19.1.0
- **Routing**: Expo Router 6 (file-based, `app/` directory)
- **State**: React Context + RxJS Observables (no Redux/Zustand)
- **Forms**: Formik + Yup validation
- **HTTP**: RxJS Ajax (`services/http.service.ts`)
- **Styling**: React Native `StyleSheet` only — no CSS-in-JS libraries
- **Animations**: `react-native-reanimated`
- **Storage**: `expo-secure-store` (tokens)
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
```
No build/test scripts defined yet. `scripts/reset-project.js` resets to a clean Expo scaffold.

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
constants/    # Colors.ts (light/dark scheme — legacy, prefer theme/)
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

## Component Conventions
- Each UI component lives in its own folder: `components/ui/ComponentName/index.tsx` + `styles.ts`
- Styles are always in a co-located `styles.ts` using `StyleSheet.create()`
- Use `theme/colors.ts` for all color values — do not hardcode hex strings
- `theme/layout.ts` holds spacing constants (e.g. `pageInlineIntent`)
- Props type named `Props` or `PropsWithChildren<Props>`, defined locally in the component file
- Platform-specific files: use `.ios.tsx` / `.web.ts` suffixes

## Services & Data Fetching
- All HTTP goes through `services/http.service.ts` (RxJS Ajax)
- Services return `Observable<T>` — subscribe at the call site (usually in context or component)
- Auth token is managed by `context/AuthContext.tsx` via `expo-secure-store`
- Add auth header via `AuthApiService.addAuthHeader(token)` — it mutates `httpService` defaults
- API base URL is `EXPO_PUBLIC_API_BASE_URL` (see `.env.example`)

## Routing
- Expo Router file-based: `app/(app)/(tabs)/index.tsx` → home tab
- Auth guard lives in `app/(app)/_layout.tsx` — redirects unauthenticated users to `(auth)/login`
- Typed routes enabled (`experiments.typedRoutes: true` in `app.json`)

## State & Context
- `useAuth()` — auth state + login/register/logout (Observables)
- `useModal()` — show/hide animated bottom sheet modal

## Testing
No tests exist yet. No test runner is configured. *(Fill in when tests are added.)*

## Environment Variables
Copy `.env.example` → `.env.local` and set `EXPO_PUBLIC_API_BASE_URL`.
Only `EXPO_PUBLIC_*` variables are exposed to the client bundle by Expo.

## Gotchas & Things to Avoid
- `constants/Colors.ts` is a legacy file from the Expo template; prefer `theme/colors.ts` for new code
- `react-native-worklets` is in deps — likely required by `react-native-reanimated`; do not remove
- `newArchEnabled: true` — avoid libraries that are not compatible with the React Native New Architecture
- The app is **portrait-only** (`"orientation": "portrait"` in `app.json`)
- No global error boundary is set up yet — RxJS errors must be caught per-subscription
- No CI/CD or build pipeline is configured yet *(fill in if added)*
