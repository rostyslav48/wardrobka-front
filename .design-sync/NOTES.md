# design-sync notes — wardrobe-assistant-front

This repo is an **Expo app**, not a published design-system package. It has no
`dist/`, no library entry, and `"private": true`. Everything below exists because
of that.

## Setup a fresh clone needs

- `node .design-sync/gen-tokens.mjs` — regenerates the synthetic `wardrobe-tokens`
  package inside the scratch `node_modules` from `theme/colors.ts` +
  `theme/layout.ts`. **Run it before every build**; `cfg.tokensPkg` points at it and
  the build fails to find tokens without it.
- The scratch `node_modules` is the whole trick: every entry of the real
  `node_modules` symlinked, except `react-native`, which points at
  `react-native-web`. Rebuild it with:

  ```sh
  SCRATCH=.design-sync/.cache/nm-scratch/node_modules
  rm -rf .design-sync/.cache/nm-scratch && mkdir -p "$SCRATCH"
  for e in "$PWD"/node_modules/*; do b=$(basename "$e"); [ "$b" = react-native ] && continue; ln -s "$e" "$SCRATCH/$b"; done
  ln -s "$PWD/node_modules/react-native-web" "$SCRATCH/react-native"
  node .design-sync/gen-tokens.mjs
  ```
- `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules` — the `bundle.mjs`
  fork imports `esbuild` by bare name and can't resolve it from `overrides/` otherwise.
- Build command (there is no `buildCmd`; the entry is hand-written):

  ```sh
  node .ds-sync/resync.mjs --config .design-sync/config.json \
    --node-modules .design-sync/.cache/nm-scratch/node_modules \
    --entry .design-sync/entry.tsx --out ./ds-bundle
  ```

## Gotchas

- **Run every render/capture/validate step outside the Bash sandbox.** Chromium
  fails to start under it with `Target page, context or browser has been closed`,
  and `npx playwright install` fails with `EPERM … mkdir '__dirlock'`.
- The repo's pinned playwright (1.62.1) wants `chromium_headless_shell-1234`; the
  machine's `~/Library/Caches/ms-playwright` held only 64K of stubs from a newer
  layout. `npx playwright install chromium-headless-shell` fixed it — this also
  un-broke the repo's own `e2e/` suite, which could not have launched a browser either.
- Driving the user's installed Google Chrome via `DS_CHROMIUM_PATH` does **not**
  work while Chrome is running: `Failed to create a ProcessSingleton for your
  profile directory`.
- `.design-sync/entry.tsx` imports must name `/index` explicitly. The converter's
  tsconfig-paths plugin tries `existsSync(stem + '')` first, so a bare directory
  specifier resolves to the directory and esbuild errors with
  `Cannot read file "…": is a directory`.
- Preview cards hardcode `body{background:#fff}` in their own `<style>`, after the
  stylesheet links. Every preview wrapper therefore sets
  `background: 'var(--wa-background)'` itself, or the light-on-dark text is invisible.
- Previews must not `import` from `react-native`. They compose with DS components
  inside plain `<div>`s; the DS package specifier is shimmed to `window.WardrobeUi`,
  but `react-native` would pull a second copy of react-native-web into the card.
- Thumbnail images in previews are inline SVG data URIs. The headless render has no
  network, so a remote URL silently renders as the placeholder glyph.
- `UiToast` fades itself out ~2.7s after `show()`, well before the screenshot. Its
  preview pins `style={{ opacity: 1 }}` — the component applies `style` last in its
  style array, so this holds it open without touching the animation.
- 11 of 12 components are `cardMode: "column"` (`cfg.overrides`). They render wider
  than a grid cell at their natural width; only `UiTitle` fits the default grid.

## The `.design-sync/overrides/bundle.mjs` fork

Declared in `cfg.libOverrides`. Only `sharedBuildOptions` differs from the bundled
`lib/bundle.mjs`; the emit/header contract is untouched. Four changes, each of which
was a hard build or runtime failure:

1. `resolveExtensions` with `.web.*` first. Without it, `react-native-safe-area-context`,
   `react-native-reanimated`, and `@react-navigation/bottom-tabs` resolve to their
   native entries and esbuild chokes on `react-native/Libraries/**`'s Flow syntax.
2. Loaders: `.ttf`/`.otf` as `dataurl` and `.js` as `jsx`, for `@expo/vector-icons`.
3. Defines: the whole `process.env` chain folded away (`EXPO_OS`, `NODE_DEBUG`,
   `JEST_WORKER_ID`), plus `global: 'globalThis'` and `__DEV__`. A bare `process` or
   `global` is a ReferenceError that kills the IIFE before it assigns
   `window.WardrobeUi` — which surfaces as `[BUNDLE_EXPORT] 12/12 not a component`,
   not as an obvious crash.
4. A Babel `onLoad` pass running `react-native-worklets/plugin` over the repo's own
   TS/TSX **and** over `node_modules/react-native-{worklets,reanimated}`. Metro
   compiles those packages too; skipping them leaves the worklets runtime's own
   `initializeRNRuntime()` throwing `Failed to create a worklet` at module-eval time.

## Known render warns

None. The final validate run is warning-free.

## Findings worth acting on (app source, not sync config)

- **`UiPage`'s `indented` prop is inert.** `components/ui/UiPage/index.tsx` ends its
  style array with `{ paddingTop: insets.top, … }`, which overrides
  `container__indented`'s `paddingTop: 60` whether the prop is true or false. Both
  settings render identically. Documented as a known defect in `conventions.md` and
  `UiPage.prompt.md`; the preview ships one cell instead of two because a second
  would be pixel-identical.
- `components/ui/UiStatusBadge/` and `components/ui/WardrobeItemCard/` are empty,
  untracked directories. Left in place, excluded from the sync.

## Deliberately out of scope

- `IconSymbol` and `TabBarBackground` are not synced. `TabBarBackground` is native
  chrome (`expo-blur`, `@react-navigation/bottom-tabs`); `IconSymbol` is an internal
  dependency of four synced components and bundles fine, but is not a design-system
  component in its own right. Its `.ios.tsx` variant (`expo-symbols`) is never
  bundled — esbuild picks the plain `.tsx`, which uses `@expo/vector-icons`.

## Re-sync risks

- **`gen-tokens.mjs` parses `theme/colors.ts` with a regex.** It matches
  `key: 'value',` lines only. Restructure that file — nested objects, double quotes,
  a computed value — and tokens silently vanish from the upload. Check the build log
  for `tokens: 1 files from wardrobe-tokens` and the token count.
- **`dtsPropsFor` holds all 12 prop contracts by hand**, because there is no shipped
  `.d.ts` to extract from. They will rot the moment a component's props change and
  nothing will warn you. Diff `components/ui/**` against
  `cfg.dtsPropsFor` on any re-sync where component source moved.
- **The `bundle.mjs` fork is a full copy.** Diff it against the staged
  `.ds-sync/lib/bundle.mjs` on every re-sync and merge upstream changes; only
  `sharedBuildOptions` should differ.
- The Babel worklets pass depends on `@babel/core` and `react-native-worklets/plugin`
  resolving from the scratch `node_modules`. An Expo or reanimated major bump can
  move either; the fork degrades to "no worklets compiled", which fails loudly.
- `initialMetrics` in `cfg.provider` pins a 390×844 frame with zero insets. Previews
  therefore show no safe-area padding, which is correct for the web target but is not
  what a device renders.
