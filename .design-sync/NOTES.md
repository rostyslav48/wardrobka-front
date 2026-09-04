# design-sync notes — wardrobe-assistant-front

This repo is an **Expo app**, not a published design-system package. It has no
`dist/`, no library entry, and `"private": true`. Everything below exists because
of that.

## Setup a fresh clone needs

- `node .design-sync/gen-tokens.mjs` — regenerates the synthetic `wardrobe-tokens`
  package inside the scratch `node_modules` from `theme/colors.ts` +
  `theme/layout.ts`. **Run it before every build**; `cfg.tokensPkg` points at it and
  the build fails to find tokens without it. It type-strips both theme files with
  `typescript` — a tracked devDependency of this repo, resolved from the repo
  root's `node_modules`, so `npm ci` alone is enough. It deliberately does **not**
  use `esbuild` from the `.design-sync/node_modules` symlink: that target is
  gitignored, appears in no tracked manifest here, and ships a platform-specific
  binary, so a clone on another OS gets `You installed esbuild for another
  platform`. This script must keep running on a bare `npm ci`.
  **Expected token count: 194.** The script prints what it emitted and exits
  non-zero if it emits fewer than this number, or if this line is missing. Raise
  the number here whenever `theme/` legitimately grows.
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
  `.ds-sync/` is not part of this repo: it is the design-sync toolkit
  (`resync.mjs`, `lib/`, `storybook/`, and its own `ds-sync-deps` `package.json`
  pinning `esbuild` + `ts-morph`) that the design-sync tool materialises into the
  working tree, and `.gitignore` excludes both it and the symlink. It exists only
  after that tool has run at least once, which is why nothing on the
  `npm ci` → build path may depend on it — only the bundle step, which needs the
  tool anyway.
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
- 15 of 16 components are `cardMode: "column"` (`cfg.overrides`). They render wider
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

**One, expected: `[FONT_MISSING]`.** The validate run reports `"Newsreader"
(--wa-font-family-display)` and `"Archivo" (--wa-font-family-body)` as referenced by the
shipped CSS with no `@font-face` shipping them. That is the fonts decision of 2026-09-02
stated back by the tool: the app renders in the platform default face and no similar family
is substituted, so the DS pane substituting system fonts is the intended result, not a
defect. Do not "fix" it by adding `cfg.extraFonts`. All 17 previews render cleanly and the
warning is non-blocking.

**Token counts, so a future reader does not mistake one for a loss.** `gen-tokens.mjs`
writes **194** tokens and `ds-bundle/tokens/tokens.css` ships exactly 194 `--wa-*`
definitions — those two must always agree, and 194 is the number to watch. The validate line
prints `tokens: 198 defined, 2 referenced`; its "defined" count is four higher than anything
in the shipped CSS (the two `var()` uses in `base.css` are what "2 referenced" counts). The
extra four were not traced to a source at the Phase 8 gate. Treat a change in *194* as
signal; the 198 is the tool's own accounting.

## Findings worth acting on (app source, not sync config)

- The three `UiPage` findings recorded here through Phases 3-5 (an inert `indented` prop, a
  content container capped at one viewport, and page padding applied twice under
  `refreshControl`) are all fixed, shipped and verified in later phases' QA rounds. Removed
  from this list at the Phase 8 gate; the fixes themselves are described in
  `docs/UiPage.md`, `conventions.md` and `cfg.dtsPropsFor.UiPage`.
- **`IconSymbol` warns on an unmapped name.** `MAPPING[name]` being `undefined`
  used to render as a blank box on Android and web with no other signal. It now
  emits a `__DEV__`-guarded `console.warn`. The `.ios.tsx` variant goes through
  `expo-symbols` and needs no mapping, so it is unchanged.
- `components/ui/UiStatusBadge/` and `components/ui/WardrobeItemCard/` are empty,
  untracked directories. Left in place, excluded from the sync.

## Deliberately out of scope

- `IconSymbol` and `TabBarBackground` are not synced. `TabBarBackground` is native
  chrome (`expo-blur`, `@react-navigation/bottom-tabs`); `IconSymbol` is an internal
  dependency of six synced components and bundles fine, but is not a design-system
  component in its own right. Its `.ios.tsx` variant (`expo-symbols`) is never
  bundled — esbuild picks the plain `.tsx`, which uses `@expo/vector-icons`.

## Re-sync risks

- **`gen-tokens.mjs` type-strips and imports `theme/*.ts`; it no longer reads them
  with a regex.** `ts.transpileModule` erases the types, the script `import()`s the
  result from a `data:` URL and walks the exports — so nested objects, double
  quotes and computed values are all fine, and a restructure that the old regex
  would have silently dropped now either works or throws. Three things can still
  bite:
  - **A runtime import in a theme file.** Type-stripping does not resolve or
    bundle, so `theme/*.ts` must import nothing but types. The script checks the
    stripped output and throws `has a runtime import; theme files must stay
    dependency-free` rather than importing a module that cannot load.
  - **A new export shape.** The walker handles a string, a number, a one-level
    object of those, and `typography`'s two-level `fontSize`/`fontWeight`/
    `lineHeight` entries. Anything else (an array, a function, a three-level
    nest) throws `unsupported token value` rather than emitting nothing.
  - **A dropped export.** Deleting or renaming a `theme/` export removes its
    tokens without any error. That is what the expected token count above is
    for: the script exits non-zero when the run emits fewer than 194 tokens.
    Still worth checking the build log for `tokens: 1 files from
    wardrobe-tokens`.
- **Token names are a published contract.** Every artboard already on the canvas
  references `--wa-background`, `--wa-page-inline-intent` and the rest by name;
  renaming one silently blanks that part of a design. `theme/colors.ts` emits
  unprefixed (`--wa-brand`), `theme/layout.ts` emits `--wa-<group>-<key>`
  (`--wa-radius-card`), and `typography` emits `--wa-type-<role>-size` /
  `-weight` / `-line-height`. `pageInlineIntent` stays a bare number export
  precisely so it keeps emitting as `--wa-page-inline-intent`.
- **`dtsPropsFor` holds all 16 prop contracts by hand**, because there is no shipped
  `.d.ts` to extract from. They will rot the moment a component's props change and
  nothing will warn you. Diff `components/ui/**` against
  `cfg.dtsPropsFor` on any re-sync where component source moved. A component's
  contract is written down in four places — `cfg.componentSrcMap`,
  `cfg.dtsPropsFor`, `docs/<Name>.md` and `previews/<Name>.tsx`, plus its
  `entry.tsx` export — and nothing cross-checks them. Change all five together.
  Audited in full on the Phase 3 pass: all 16 entries match their component's props,
  with one deliberate omission — `testID` (on `UiButton`, `UiTitle` and `UiInput`) is
  a React Native test hook, not a design-system prop, and is left out of every entry.
- **The `bundle.mjs` fork is a full copy.** Diff it against the staged
  `.ds-sync/lib/bundle.mjs` on every re-sync and merge upstream changes; only
  `sharedBuildOptions` should differ.
- The Babel worklets pass depends on `@babel/core` and `react-native-worklets/plugin`
  resolving from the scratch `node_modules`. An Expo or reanimated major bump can
  move either; the fork degrades to "no worklets compiled", which fails loudly.
- `initialMetrics` in `cfg.provider` pins a 390×844 frame with zero insets. Previews
  therefore show no safe-area padding, which is correct for the web target but is not
  what a device renders.
