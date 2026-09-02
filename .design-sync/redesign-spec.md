# Wardropka redesign — specification

> plan-13 Phase 0 output. Written 2026-09-02 from the Claude Design canvas project
> `9d043b8c-80ee-4cb9-8586-4183e8657503` ("Mobile map design improvement", `type:
> PROJECT_TYPE_PROJECT`, owner Rostyslav, `canEdit: true`).
>
> Every number in sections 1–5 is a **computed** style read out of a real browser, not a
> value read off the source. Where the two disagree, the computed value is the design and
> the disagreement is called out.

---

## 0. Provenance and how to reproduce

### What was imported

`.design-sync/design/` holds the canvas verbatim:

| Path | What it is |
|---|---|
| `Wardropka Home.dc.html` | the single artboard, 82 KB, 740 lines |
| `_ds/wardrobe-assistant-front-c62e46a9-…/tokens/tokens.css` | the 15 CSS custom properties, generated from `theme/colors.ts` + `theme/layout.ts` |
| `_ds/wardrobe-assistant-front-c62e46a9-…/styles.css` | two `@import`s — tokens, then `_ds_bundle.css` |
| `_ds/wardrobe-assistant-front-c62e46a9-…/_ds_bundle.css` | the only static CSS the DS ships (body ground) |
| `_ds/wardrobe-assistant-front-c62e46a9-…/_ds_manifest.json` | the 12 published components, their cards and the token list |
| `_ds/wardrobe-assistant-front-c62e46a9-…/README.md` | the DS usage guide as published |
| `_ds/wardrobe-assistant-front-c62e46a9-…/_adherence.oxlintrc.json` | per-component allowed-prop lint rules — the authoritative prop list |
| `_ds/tokens.css`, `_ds/styles.css` | copies at the flat paths plan-13 Phase 0 names |
| `image-slot.js`, `ios-frame.jsx`, `support.js` | the canvas runtime and starters the artboard imports |
| `artboards/*.png` | 11 PNG exports at 2× — every screen and sheet the artboard contains |

**`_ds_bundle.js` is deliberately not vendored.** It is 2.68 MB and it is a build product
of this very repository — the compiled `WardrobeUi` library that `/design-sync` pushed
*out* to the canvas. `get_file` caps at 256 KiB and could not have returned it anyway.
Regenerate it with the `/design-sync` skill; the working copy lives at `ds-bundle/`
(gitignored). Everything else needed to read the artboard is committed here.

The project also holds one unused upload, `uploads/draw-e491cb36-….png`. The artboard
does not reference it, so it is not vendored.

### How to re-render the artboard

```bash
mkdir -p /tmp/wa-render && cp -R .design-sync/design/. /tmp/wa-render/
cp ds-bundle/_ds_bundle.js /tmp/wa-render/_ds/wardrobe-assistant-front-c62e46a9-1992-4518-964f-d7cbb2a1b8c1/
cd /tmp/wa-render && python3 -m http.server 8199 --bind 127.0.0.1
# then open http://127.0.0.1:8199/Wardropka%20Home.dc.html
```

`support.js` boots itself, pulls React from a CDN if `window.React` is absent, and renders
the `<x-dc>` template. The artboard is interactive: the tab bar switches screens, the
filter and add-item affordances open their sheets. Two artboard props are settable at
runtime — `window.__dcSetProps('Wardropka Home', { showPulse: true, recentCount: 3 })`.

### Measurement method

Chromium, `getComputedStyle` on every element inside the device frame, per screen state.
Frequency tables in sections 1–3 are the union across all nine states. Font metrics in
section 4 are per text node. The device frame is `IOSDevice` at its default **402 × 874**
(iPhone 16 Pro logical size), not 390: `metrics.frame.width` in the artboard script is
402 and the frame component defaults to 402. The content column is therefore
**402 − 2 × 20 = 362 px**. At a 390 px device the same gutters give a 350 px column; every
padding, gap, radius and font size in this document is a fixed pixel value and does not
change with device width. Only the column does.

---

## 1. Palette

**Tolerance rule for "is this a new colour?":** two hexes are the same token when **every
channel differs by ≤ 4/255** (≈1.6 %). Under that rule no colour marked `NEW` below
duplicates an existing `colors.*` key, and two mockup hexes collapse into existing keys.

### 1.1 Colours that already have a key

| Mockup hex | `theme/colors.ts` key | Where it appears |
|---|---|---|
| `#111111` | `background` / `accentText` | app ground; label colour on filled buttons and pills |
| `#1E1E1E` | `surface` | avatar chip, filter chips, recent-suggestion card |
| `#F0F0F0` | `textPrimary` / `accent` | all primary text; filled button and FAB grounds |
| `#888888` | `textSecondary` / `placeholder` | all secondary text, all inactive icons |
| `#2E2E2E` | `border` | avatar ring, input border, settings divider |
| `#16A34A` | `statusActive` | "Ready" badge text |
| `#D97706` | `statusWashing` | "Washing" badge text |
| `#DC2626` | `statusMissing` | "Missing" badge text |
| `#9333EA` | `statusNeedRepair` | "Need Repair" badge text |
| `#EF4444` | `error` | "Sign out" label in Settings |
| `#202020` | `surface` (Δ2 — within tolerance) | one card hairline; use `surface` |
| `#2A2A2A` | `border` (Δ4 — within tolerance) | three hairlines; use `border` |

`errorBackground` (`#1F0606`) is the one existing key the mockup never uses.

### 1.2 NEW colours

| Hex | Δ from nearest key | Count | Role | Proposed key |
|---|---|---|---|---|
| `#D9C7A7` | no grey is close | 23 | **the brand accent.** Wordmark dot, "94 % MATCH", "CLEAR ALL", "CHANGE", the active tab underline, the reminder time, the filter-count badge ground, the logged-state button | `colors.brand` |
| `#EDE2CE` | Δ(20,27,39) from `#D9C7A7` | 1 | hover/pressed lift of the accent (`a:hover` in the artboard head) | `colors.brandHover` |
| `#262626` | Δ8 from `border` | 26 | **the default hairline of the redesign** — every card and chip outline | `colors.hairline` |
| `#232323` | Δ5 from `surface` | 5 | inner divider inside the hero card | `colors.hairlineSoft` |
| `#333333` | Δ5 from `border` | 1 | the dashed "add another item" tile in the log sheet | `colors.hairlineDashed` |
| `#181818` | Δ6 from `surface`, Δ7 from `background` | 5 | raised card ground (hero card, log entries) — one step above the page, one below `surface` | `colors.surfaceRaised` |
| `#161616` | Δ5 from `background` | 6 | bottom-sheet ground, and the ring gap behind a selected swatch | `colors.sheet` |
| `#9A9A9A` | Δ18 from `textSecondary` | 4 | the outfit-strip captions only ("Oxford shirt" under a slot) | `colors.textTertiary` |
| `rgba(0,0,0,0.62)` | — | 3 | sheet scrim | `colors.scrim` |
| `rgba(0,0,0,0.45)` | — | 2 | gradient foot under the scrolling grid | `colors.scrimSoft` |
| `rgba(217,199,167,0.10)` / `(…,0.28)` | — | 2 | the "Logged for today" button ground and its border — `brand` at 10 % / 28 % | derive from `brand` |
| status colour @ 13.3 % alpha | — | 12 | the pill ground behind each status label (`#16A34A@0.133` and the three siblings) | derive from the four `status*` keys |

`#08080A` is the canvas page ground *outside* the device bezel. It is not an app colour.

### 1.3 Content colours, not UI

The item-colour picker ships 13 swatches as data. They are content, and must not become
theme tokens: `#111111 #F5F5F5 #808080 #D4C5A9 #6B4226 #1B2A4A #1565C0 #2E7D32 #C62828
#E91E8C #F9A825 #E65100 #6A1B9A`. The backend already owns this list —
`apps/wardrobe/src/constants/swatches` has a spec for it; reconcile before duplicating.

---

## 2. Spacing scale

Every distinct value, sorted. Counts are authored occurrences in the artboard (padding,
gap and vertical margin, all screens and sheets).

| px | n | Where | Proposed token |
|---|---|---|---|
| 2 | 7 | status-badge inner inset | `space.hair` |
| 3 | 12 | dot inset, numeral nudge under a stat label | `space.micro` |
| 4 | 9 | filter-badge inline padding, chat row nudge | `space.3xs` |
| 5 | 8 | tab-bar icon → label gap | `space.2xs` |
| 6 | 16 | outfit-strip grid gap; chip label → × gap; thumbnail row gap | `space.xs` |
| 7 | 19 | chip padding-block | `space.chipY` |
| 8 | 25 | caption top margin; hero action-row gap; wordmark gap | `space.sm` |
| 9 | 7 | item-card caption margin; "Add entry" pill padding-block | `space.smPlus` |
| 10 | 27 | section header gap; tab padding-top; card body gaps | `space.md` |
| 11 | 9 | filter-chip padding-inline; log summary margin; weather rule padding-top | `space.mdPlus` |
| 12 | 32 | **the card rhythm** — grid gap between item cards, list gap between log entries, card padding-block, header→date gap | `space.lg` |
| 13 | 10 | ask-chip padding-inline; "Add entry" padding-inline | `space.chipX` |
| 14 | 12 | **card padding-inline** (hero card, log entry, recent card) | `space.cardPad` |
| 15 | 6 | chat-row padding-block | `space.rowY` |
| 16 | 4 | items grid top margin; chat list top margin | `space.xl` |
| 18 | 14 | **section gap** — "ASK WARDROPKA" block, log list, camera/gallery row | `space.section` |
| 20 | 15 | **the page gutter** — matches `layout.pageInlineIntent` exactly | `space.gutter` |
| 22 | 7 | settings first block; sheet body top | `space.sectionLg` |
| 24 | 3 | sheet header padding; settings divider margin | `space.2xl` |
| 26 | 2 | sheet section gap | `space.sheetSection` |
| 28 | 2 | sheet body padding-block | `space.3xl` |
| 62 | 1 | content padding-top — clears the iOS status bar | `space.statusBar` |
| 96 | 2 | scroll-content padding-bottom — clears the tab bar | `space.tabBarClearance` |

Device chrome only, not app spacing: `34` (home-indicator strip) and `48` (the canvas page
padding outside the bezel).

**The gutter is already right.** `pageInlineIntent = 20` matches the mockup with no change.
Nothing else in `theme/layout.ts` exists yet; sections 2 and 3 are the whole proposed file.

---

## 3. Radius scale

| px | n | Where | Proposed token |
|---|---|---|---|
| 1 | 4 | active-tab underline (18 × 2) | `radius.hair` |
| 2 | 3 | tiny indicators | `radius.hair` |
| 3 | 5 | the 6 × 6 wordmark dot | `radius.dot` |
| 8 | — (component) | `OutfitSuggestionCard` thumbnails, 70 × 105 — DS-owned, not authored here | leave to component |
| 9 | 1 | filter-count badge (25 × 17) | `radius.badge` |
| 10 | 9 | **controls** — search input, primary/secondary buttons, ask input, and the dashed "add item" tile in the log sheet | `radius.control` |
| 13 | 6 | the settings toggle track (44 × 26) — a pill by construction | `radius.pill` |
| 14 | 1 | the settings/log row card (362 wide, padding 14) | `radius.cardSm` |
| 15 | 17 | 30 × 30 **circles** — the sheet close button and every colour swatch | `radius.round` |
| 16 | 6 | **card** — hero card, recent-suggestion card, log entry, avatar (34 × 34) | `radius.card` |
| 24 | 2 | 48 × 48 send button (a circle by construction) | `radius.round` |
| 28 | 2 | 56 × 56 FAB (a circle by construction) | `radius.round` |
| `24px 24px 0 0` | 3 | **bottom sheet top corners** | `radius.sheet` |
| 999 | 28 | **pills** — every chip, the "Add entry" button, the filter chips | `radius.pill` |

**Photo frames get their radius from a different place.** Every image placeholder in the
artboard is an `<image-slot radius="N">` custom element, and the rounding lives inside its
shadow root, so it never shows up in a computed-style sweep of the page. The authored
values are: **10** for the four outfit slots (79 × 104) and the log thumbnails (84 tall),
**12** for the item-grid photo (175 × 150), **14** for the item-form photo (362 × 200).
Treat those three as `radius.tile`, `radius.tileLg` and `radius.photo`.

Border widths are uniform: **1 px solid** everywhere, plus one **1 px dashed** (`#333333`)
on the "add another item" tile in the log sheet. No other border width appears.

---

## 4. Type scale

### 4.1 `UiTitle` — measured, and the documentation is wrong

Rendered in a browser inside `SafeAreaProvider` at 390 px, one probe per flag:

| Flag | **Rendered** | `components/ui/UiTitle/styles.ts` | DS `README.md` claims |
|---|---|---|---|
| (none) | **22 px / 700** | 22 / '700' | 24 |
| `sizeXS` | **17 px / 600** | 17 / '600' | 14 |
| `sizeS` | **18 px / 600** | 18 / '600' | 16 |
| `sizeM` | **20 px / 600** | 20 / '600' | 20 |
| `sizeL` | **28 px / 700** | 28 / '700' | 28 |

**Every flag renders the real source scale — 17 / 18 / 20 / 28, default 22.** The
documented scale (14 / 16 / 20 / 28, default 24) in the published DS `README.md` is wrong
for three of the five values, and it is the version an agent reading `_ds/README.md` will
believe. Line-height is `normal` and letter-spacing is `normal` on all five; the colour is
`textPrimary`; the family is the RN default (`-apple-system`), **not** Archivo.

### 4.2 How the artboard actually uses `UiTitle`

Twelve usages, and only two shapes:

- **1 × `sizeM`** — the hero outfit line, with a full style override:
  `{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 26, lineHeight: 30, fontWeight: '400', letterSpacing: -0.2, color: '#F0F0F0' }`.
  Measured: **26 px / 400 / 30 px / −0.2 px / Newsreader**. The `sizeM` flag contributes
  nothing — every property is overridden.
- **11 × `sizeS`** — every button label: "Wear this today", "Logged for today", "Swap",
  "Save", "Sign out", "Clear all", "Apply", "Delete", "Save item", "Cancel".
  Measured: **18 px / 600**, family overridden to Archivo, colour `#111111` on filled
  buttons and `#F0F0F0` on secondary ones (`#EF4444` for "Sign out").

`sizeXS` and `sizeL` are never used, and no text in the artboard renders at the default
size. **The redesign's typography is carried almost entirely by raw text nodes, not by
`UiTitle`** — see 4.3. Any phase that "replaces divs with `UiTitle`" will change the
design unless it also passes a style override.

### 4.3 Every text role in the mockup

Archivo unless noted. `ls` is letter-spacing in px as computed.

| Size / weight | line-height | ls | Colour | Family | Role |
|---|---|---|---|---|---|
| 28 / 400 | 32 | −0.3 | `textPrimary` | **Newsreader** | screen title — "Wardrobe", "Chats", "Outfit Log", "Settings" |
| 26 / 400 | 30 | −0.2 | `textPrimary` | **Newsreader** | hero outfit line (the one `UiTitle`) |
| 22 / 400 | normal | normal | `textPrimary` | **Newsreader** | sheet title — "Filters", "Add item", "Edit entry" |
| 20 / 700 | 24 | normal | `textPrimary` | Archivo | pulse stat numeral (38 / 3 / 1), tabular numerals |
| 18 / 600 | normal | normal | `accentText` / `textPrimary` | Archivo | button label (`UiTitle sizeS`) |
| 16 / 400 | normal | normal | `textPrimary` | -apple-system | log-entry notes textarea (`UiTextArea` native) |
| 14.5 / 500 | normal | 0.145 | `textPrimary` | Archivo | chat session title |
| 14 / 400 | normal | normal | `textPrimary` | Archivo | settings row label, log-sheet date value, "Show favourites only" |
| 14 / 400 | 20 | normal | `textPrimary` | -apple-system | recent-suggestion summary (`OutfitSuggestionCard` native) |
| 14 / 500 | normal | normal | `brand` | Archivo | reminder time value ("07:30") |
| 14 / 700 | normal | normal | `textPrimary` | -apple-system | "+ 2" overflow count on a suggestion card |
| 13 / 600 | normal | normal | `textPrimary` | Archivo | "+2" overflow chip in the log list |
| 13 / 500 | normal | normal | `textSecondary` | -apple-system | `UiSelect` option label (native) |
| 12.5 / 600 | normal | normal | `accentText` | Archivo | "Add entry" pill label |
| 12.5 / 500 | 16 | 0.125 | `textPrimary` | Archivo | item-card name in the grid |
| 12 / 500 | normal | 0.12 | `textPrimary` | Archivo | ask-chip label |
| 12 / 600 | normal | normal | `accentText` | Archivo | selected filter-chip label |
| 12 / 500 | normal | normal | `textSecondary` | -apple-system | thumbnail caption inside a suggestion card |
| 11.5 / 400 | 15 | 0.115 | `textTertiary` `#9A9A9A` | Archivo | outfit-slot caption |
| 11.5 / 400 | normal | 0.115 | `textSecondary` | Archivo | body/secondary line — chat preview, log summary, settings help |
| 11.5 / 500 | normal | normal | `textPrimary` | Archivo | applied filter-chip label |
| 11 / 600 | normal | 1.76 | `textPrimary` | Archivo | **wordmark** "WARDROPKA" (0.16 em) |
| 11 / 600 | normal | normal | `textPrimary` | Archivo | avatar initials "RK" |
| 11 / 600 | normal | 0.6 | `textSecondary` | -apple-system | suggestion-card topic (component native) |
| 11 / 500 | normal | 1.1 | `textSecondary` | Archivo | item-form field label ("Type", "Colour", "Season") |
| 11 / 500 | normal | 0.66 | `textPrimary` | Archivo | temperature "17°" |
| 10 / 600 | normal | 1.4 | `textSecondary` | Archivo | **section eyebrow** — "TODAY · 08:41", "ASK WARDROPKA", "RECENT SUGGESTIONS", "54 ITEMS", "TYPE", "REQUIRED", "DATE" (0.14 em) |
| 10 / 600 | normal | 1.4 | `brand` | Archivo | actionable eyebrow — "CLEAR ALL", "CHANGE" |
| 10 / 600 | normal | 1.4 | `textPrimary` | Archivo | log date header — "Yesterday", "Wed, Aug 27" |
| 10 / 500 | normal | 1.0 | `textSecondary` | Archivo | date chip "FRI 29 AUG" |
| 10 / 500 | normal | 1.0 | `textPrimary` | Archivo | "SEE ALL →" |
| 10 / 500 | normal | 0.8 | `textSecondary` | Archivo | meta line — "RAIN 20%", "OFFICE · 3 MEETINGS", "CAMERA", "GALLERY" |
| 10 / 500 | normal | 1.6 | `brand` | Archivo | "94% MATCH" |
| 10 / 700 | normal | normal | `accentText` | Archivo | filter-count badge numeral |
| 9.5 / 600 | normal | 0.57 | status colour | Archivo | status badge label |
| 9 / 600 | normal | 1.08 | `textSecondary` / `textPrimary` | Archivo | **tab-bar label** |
| 9 / 500 | normal | 0.9 | `textSecondary` | Archivo | pulse stat label (CLEAN / WASH / REPAIR / UNWORN) |
| 9 / 600 | normal | normal | `textSecondary` | Archivo | "Any" swatch label |

### 4.4 Two families, and neither is in the app

- **Archivo** (400/500/600/700) — the entire UI.
- **Newsreader** (300–600, optical size 6–72) — every title, and nothing else.

The artboard loads both from Google Fonts. `assets/fonts/` in this repo ships neither, and
`app/_layout.tsx` loads no custom family. Whichever phase lands typography must add both
as real font assets — the fallbacks (`system-ui` and `Georgia`) change the design
materially, especially the serif titles.

Weights actually used: **400, 500, 600, 700** for Archivo; **400 only** for Newsreader.

---

## 5. Icons

Sixteen distinct glyphs, all **hand-drawn inline SVG** in the artboard (23 instances), plus
one icon-font glyph that arrives through a design-system component. Sizes are the SVG's
own `width`; strokes are 1.3–2 px, `round` caps and joins.

| # | Glyph | Size | Colour | Where | SF Symbol | MaterialIcons | In `MAPPING`? |
|---|---|---|---|---|---|---|---|
| 1 | sun (circle + 8 rays) | 13 | `brand` | weather row | `sun.max` | `wb-sunny` | **NO — add** |
| 2 | arrow right (short) | 12 | `textSecondary` | calendar/context row | `arrow.right` | `arrow-forward` | **NO — add** |
| 3 | arrow right (bold) | 18 | `accentText` | ask-input send button | `arrow.right` | `arrow-forward` | **NO — add** (`arrow.up`→`arrow-upward` exists but points the wrong way) |
| 4 | calendar | 20 | `currentColor` | LOG tab | `calendar` | `calendar-today` | **NO — add** |
| 5 | filter (3 rules) | 16 | `textPrimary` | items filter button | `line.3.horizontal.decrease` | `tune` | yes |
| 6 | close × (small) | 8 | `textSecondary` | applied filter chip | `xmark` | `close` | yes |
| 7 | close × (medium) | 10 | `textSecondary` | sheet close button (×3) | `xmark` | `close` | yes |
| 8 | plus | 12 | `accentText` | "Add entry" pill | `plus` | `add` | yes |
| 9 | plus | 16 | `textSecondary` | inline add | `plus` | `add` | yes |
| 10 | plus | 20 | `accentText` | FAB (items, chat) | `plus` | `add` | yes |
| 11 | chevron right | 7 × 12 | `textSecondary` | list rows (×4) | `chevron.right` | `chevron-right` | yes |
| 12 | camera | 14 | `textSecondary` | item form "CAMERA" | `camera.fill` | `camera-alt` | yes |
| 13 | photo/gallery | 14 | `textSecondary` | item form "GALLERY" | `photo.on.rectangle` | `photo-library` | yes |
| 14 | house | 20 | `currentColor` | HOME tab | `house.fill` | `home` | yes |
| 15 | hanger | 20 | `currentColor` | ITEMS tab | `tshirt.fill` | `checkroom` | yes |
| 16 | speech bubble | 20 | `currentColor` | CHAT tab | `bubble.left.and.bubble.right.fill` | `chat` | yes |
| — | hanger (icon font) | 24 | `textSecondary` | thumbnail placeholder inside `OutfitSuggestionCard` | `tshirt.fill` | `checkroom` (U+F19E, verified against the glyph map) | yes |

**Four entries to add to `components/ui/IconSymbol.tsx`'s `MAPPING`:** `sun.max` →
`wb-sunny`, `arrow.right` → `arrow-forward`, `calendar` → `calendar-today`, and — if the
weather block ever shows precipitation as a glyph rather than the text "RAIN 20%" —
`drop.fill` → `water-drop`. The mockup renders rain as text, so the fourth is optional.

The tab-bar icons use `stroke="currentColor"` and inherit `#F0F0F0` when active and
`#888888` when not, which `IconSymbol`'s `color` prop already models. The other glyphs
carry hard-coded strokes.

Two mockup glyphs have no `MAPPING` need because they are pure geometry: the 6 × 6
wordmark dot and the 18 × 2 active-tab underline.

---

## 6. Layout

Coordinates below are **relative to the device frame's top-left**, at 402 × 874. Read them
as "x, y, width × height". The screenshots in `.design-sync/design/artboards/` are the
same states at 2×.

### 6.1 Shell — identical on all five screens

- **Frame** 402 × 874, ground `background` `#111111`, `flex column`.
- **Scroll region** fills to y 779, padding **62 / 20 / 8 / 20**. The 62 clears the iOS
  status bar; 20 is the gutter.
- **Masthead** `20,62 362 × 40`, `flex`, space-between:
  - left cluster, `gap 8`: a 6 × 6 `brand` dot (`r3`) then "WARDROPKA" 11/600, ls 1.76.
  - right cluster, `gap 12`: "FRI 29 AUG" 10/500 `textSecondary`, then the avatar —
    34 × 34, `r16`, `surface` ground, 1 px `border` ring, initials 11/600 centred. The
    avatar is the entry point to Settings.
- **Tab bar** `0,780 402 × 60` + a 34 px home-indicator strip below it. Four equal 97 px
  columns, each `flex column`, `gap 5`, padding `10 / 0 / 8 / 0`: a 20 × 20 stroked icon,
  then a 9/600 label with ls 1.08. The active column adds an **18 × 2 `brand` underline
  with `r1`** directly under its label and switches icon+label to `textPrimary`.
- Scrolling screens pad **96 px** at the bottom so content clears the tab bar.

### 6.2 Home (`artboards/01-home.png`)

1. **Hero card** `20,116 362 × 347`, margin-top 14, `r16`, 1 px `#262626`, ground
   `#181818` (`surfaceRaised`).
   - Header strip, padding `12 / 14 / 0 / 14`: "TODAY · 08:41" 10/600 eyebrow left,
     "94% MATCH" 10/500 `brand` right.
   - Title block, padding `8 / 14 / 12 / 14`: the Newsreader 26/30 outfit line, two lines
     at this width.
   - **Outfit strip** — a 4-column grid, `gap 6`, padding `0 / 14`. Each cell is 79 px
     wide: a 79 × 104 tile (`image-slot radius="10"`, dashed-edge placeholder in the
     mockup) with a slot label centred inside ("Top", "Layer", "Bottom", "Shoes"), then
     the garment caption 11.5/400 `#9A9A9A` at margin-top 8.
   - **Context rule** — margin-top 14, padding-top 11, 1 px top border `#232323`,
     `flex` space-between, `gap 10`: left is the 13 px sun, "17°" 11/500, "RAIN 20%"
     10/500; right is "OFFICE · 3 MEETINGS" 10/500 with the 12 px arrow.
   - **Actions** `flex gap 8`, padding `12 / 14 / 14 / 14`: primary "Wear this today"
     228 × 50 and secondary "Swap" 96 × 50 — both `UiButton` with an explicit
     `{ height: 50, borderRadius: 10 }` override. Pressing the primary swaps it for the
     "Logged for today" state: ground `brand` at 10 %, border `brand` at 28 %, label
     `brand` (`artboards/02-home-logged.png`).
2. **Ask block** `20,481 362 × 107`, margin-top 18.
   - "ASK WARDROPKA" 10/600 eyebrow.
   - Three suggestion chips, `flex gap 6`, each padding `7 / 13`, `r999`, 1 px `#262626`,
     label 12/500. Tapping one fills the input. Gated by the `showShortcutChips` prop.
   - Input row `flex gap 8`: `UiInput` 306 × 51 (`r10`, 1 px `border`) and a 48 × 48
     circular send button, ground `accent`, with the 18 px arrow in `accentText`.
3. **Recent suggestions** `20,608`, margin-top 20.
   - Header row: "RECENT SUGGESTIONS" 10/600 left, "SEE ALL →" 10/500 `textPrimary` right.
   - One `OutfitSuggestionCard` per entry — DS component, `r16`, `surface` ground,
     padding 12, internal `gap 10`: topic 11/600, a row of 70 × 105 thumbnails (`r8`,
     `#2E2E2E`) with a "+ N" overflow tile, then the summary 14/400/20. The `recentCount`
     prop controls how many render (default 2, max 3).
4. **Pulse block** — off by default; set `showPulse: true`
   (`artboards/11-home-pulse.png`). It sits between the hero card and the ask block:
   a "WARDROBE · 54 ITEMS" eyebrow with a "MANAGE →" action, then four stat tiles —
   label 9/500 ls 0.9 `textSecondary` above a 20/700/24 tabular numeral.

### 6.3 Items / Wardrobe (`artboards/03-items.png`)

Title row at `20,112`, margin-top 10: "Wardrobe" 28/400 Newsreader left, "54 ITEMS"
10/600 right. Search row margin-top 14, `gap 8`: `UiInput` 304 × 51 plus a 50 × 50
`r24` outlined filter button carrying a 25 × 17 `r9` `brand` badge with the active-filter
count in 10/700 `accentText`, overhanging the button's top-right. Applied-filter row
margin-top 12, `gap 6`: chips at padding `6 / 11`, `r999`, `surface` ground, label
11.5/500 and an 8 px ×, followed by "CLEAR ALL" 10/600 `brand`. **Item grid** margin-top
16, two columns, `gap 12`: each card is 175 wide — a 175 × 150 photo frame
(`image-slot radius="12"`, dashed placeholder) then a 17 px caption row with the name
12.5/500/16 left and the
status pill right (padding 2/6, `r999`, ground = status colour at 13 %, label 9.5/600
ls 0.57 in the status colour). A 56 × 56 `r28` `accent` FAB with the 20 px plus sits
bottom-right above the tab bar.

### 6.4 Chat (`artboards/07-chat.png`)

"Chats" 28/400 with "6 SESSIONS" 10/600. A single list, margin-top 16, 1 px top border,
one row per session at padding `15 / 2`: title 14.5/500 and preview 11.5/400
`textSecondary` on the left, relative date 11.5/400 right-aligned. Rows are separated by
1 px hairlines, not cards. Same `r28` FAB.

### 6.5 Log (`artboards/08-log.png`)

"Outfit Log" 28/400 with an "Add entry" pill on the right — padding `9 / 13`, `r999`,
`accent` ground, 12 px plus in `accentText` plus a 12.5/600 label. Entries stack in a
`flex column gap 12` at margin-top 18; each is a card at padding 14, `r16`, 1 px
`#262626`, ground `#181818`: a date header 10/600 `textPrimary`, a 4-column thumbnail grid
(`gap 6`, margin-top 11, tiles 84 tall at `image-slot radius="10"`) with a "+2" overflow
tile at 13/600, and the note 11.5/400 `textSecondary`, single-line with ellipsis.

### 6.6 Settings (`artboards/10-settings.png`)

"Settings" 28/400 at margin-top 10. A profile block at margin-top 22 — three 51 px form
rows and a 50 px action. A 1 px `border` divider at margin-top 24, then a
"NOTIFICATIONS" 10/600 eyebrow, a "Daily reminder" row (label 14/400, help 11.5/400) with
a toggle — a **44 × 26 track at `r13`**, ground `brand` when on and `border` `#2E2E2E`
when off — a "Time" row whose value is 14/500 `brand`, then "Sign out" as an 18/600
`error` button label and "Version 1.0.0" 11.5/400 as the last line. The profile rows sit
in 362-wide cards at padding 14, `r14`, 1 px `#262626`, ground `#181818`.

### 6.7 Bottom sheets

All three share one measured pattern: a scrim `rgba(0,0,0,0.62)` over the screen, then a
sheet **402 px wide, up to 770 tall**, ground `#161616` (`colors.sheet`), **`r24` on its
top corners only**. A **36 × 4 grabber at `r2`, `#2E2E2E`**, sits centred above the
header. The header is padding **10 / 20 / 12 / 20** — the title in Newsreader 22/400 on
the left, a **30 × 30 circular close button (`r15`, 1 px `#262626`)** with the 10 px ×
on the right. The body is padding **18 / 20 / 28 / 20** and scrolls; its sections are
separated by 26.

- **Filters** (`artboards/04-sheet-filters.png`) — "TYPE", "SEASON", "STATUS", "COLOUR"
  eyebrows, each over a wrapped chip row (`r999`, padding `6/11`); the selected chip
  inverts to `accent` ground with a 12/600 `accentText` label. Colour is a row of 30 × 30
  circular swatches (`r15`), each ringed `box-shadow: 0 0 0 1px #2E2E2E` and the selected
  one ringed `0 0 0 2px #161616, 0 0 0 4px #D9C7A7`; an "Any" swatch leads the row. A
  "Show favourites only" row, then two 176 × 50 buttons — "Clear all" secondary, "Apply"
  primary.
- **Add / Edit item** (`artboards/05-sheet-item-new.png`, `06-sheet-item-edit.png`) —
  a 362 × 200 photo slot (`image-slot radius="14"`, dashed placeholder) reading "Tap to
  add photo", a CAMERA / GALLERY row (`gap 18`, 14 px icons, 10/500 ls 0.8 labels), then
  "REQUIRED"
  and "OPTIONAL" eyebrow sections over `UiFormField` + `UiInput` / `UiSelect` /
  `UiTextArea`. Field labels are 11/500 ls 1.1. `UiSelect` renders horizontally as chips
  for Type, Season, Status, Fit and Size. A "Mark as favourite" row closes the form above
  "Cancel" / "Save item". The edit variant is the same sheet prefilled, and adds
  "Delete".
- **Log entry** (`artboards/09-sheet-log.png`) — "Edit entry", then "DATE" over a 14/400
  value, "ITEMS · 4" with a "CHANGE" action in `brand` over a 4-column grid (`gap 6`,
  margin-top 10, tiles 88 tall at `image-slot radius="10"`) whose last cell is the one
  dashed control in the design — 88 tall, `r10`, 1 px dashed `#333333`, a 16 px plus
  centred — then "NOTES" over a `UiTextArea` (16/400, native family), and
  "Delete" / "Save".

---

## 7. What the mockup cannot tell us

### 7.1 First, a correction to the phase brief

plan-13 Phase 0 says the mockup "covers Home and not Items, Chat, Log, Settings, the item
form, the chat thread, outfit history or the auth screens". **That is wrong for six of
those.** The single artboard is a small state machine — `sc-if` on `isHome`, `isItems`,
`isAsk`, `isLog`, `isProfile`, `sheetFilters`, `sheetItem`, `sheetLog`, `itemEdit`,
`logged`, `favOn/Off`, `reminderOn/Off`, plus the `showPulse`, `showShortcutChips` and
`recentCount` props. Rendered, it covers:

| Surface | Covered? |
|---|---|
| Home (+ logged state, + pulse variant, + chips off) | **yes** |
| Items / Wardrobe grid, with filter chips and statuses | **yes** |
| Filters sheet | **yes** |
| Add item sheet | **yes** |
| Edit item sheet (prefilled, with Delete) | **yes** |
| Chat session **list** | **yes** |
| Outfit Log list | **yes** |
| Log entry sheet | **yes** |
| Settings / profile | **yes** |

Phases 5–7 are therefore extrapolating far less than the plan assumed. Build these nine
from section 6 and the PNGs, not from invention.

### 7.2 What is genuinely absent

| Missing surface | Route | Extrapolation rule |
|---|---|---|
| **Chat thread** (message list, bubbles, composer) | `app/(app)/chat/[sessionId].tsx` | Reuse the chat-row type ramp: user text 14/400, assistant text 14/400 `textPrimary`, timestamps 10/500 `textSecondary`. Compose with the Home ask-input verbatim — `UiInput` `r10` 51 px + a 48 px `r24` `accent` send button. Bubbles, if any, take `radius.card` and `surfaceRaised`; do not invent a second accent. |
| **Item detail (read-only)** | `app/(app)/item/[id].tsx` | The mockup goes straight from grid card to the **edit sheet**. Either adopt that (tap → edit sheet, no detail route) or build detail as the edit sheet with fields in a read state; do not design a third layout. |
| **Outfit history** | `app/(app)/outfit-history.tsx` | Same card as the Log list (§6.5): `r16`, `#181818`, 1 px `#262626`, date header 10/600, thumbnail grid `gap 6`. |
| **Login / register** | `app/(auth)/login.tsx` | No mockup. Use: page gutter 20, Newsreader 28/400 title, `UiFormField` + `UiInput` at `r10`, one full-width 50 px primary `UiButton`, secondary actions as 11.5/400 `textSecondary`. |
| **Forgot password** | `app/(auth)/forgot-password.tsx` | As login. |
| **Not found** | `app/+not-found.tsx` | Newsreader 22/400 title, 11.5/400 body, one secondary button. |
| **Empty states** | every list | The mockup shows every list populated. Rule: eyebrow-styled 10/600 `textSecondary` line plus one primary action; no illustration (the design ships no imagery at all). |
| **Loading / skeleton** | every list | Not designed. Use `surface` blocks at the real radii (10 or 12 for photo tiles, `r16` for cards); no spinners over content, `UiButton`'s own `enableLoader` for actions. |
| **Errors and toasts** | global | `UiToast` and `UiError` are unstyled by the mockup. `colors.error` `#EF4444` is the only error colour present, on the "Sign out" label; `errorBackground` `#1F0606` is unused. |
| **Light theme** | — | Does not exist and must not be invented. The DS `README.md` is explicit: dark only. |
| **Landscape, dynamic type, tablet** | — | The artboard is one fixed 402 × 874 portrait frame. Nothing here says how the design responds; treat every value as fixed-px and let flex do the rest. |
| **Motion** | — | The artboard defines five keyframes (`waScreen`, `waCard`, `waFade`, `waSheet`, `waFab`) with durations around .34 s and `cubic-bezier(.2,.85,.25,1)`. They are canvas-only CSS; porting them to Reanimated is a decision no one has made. |

### 7.3 Components the mockup implies but the repo does not have

The plan asks specifically about two names. **The artboard references neither
`UiStatusBadge` nor `WardrobeItemCard`** — no such string appears in the artboard, and
`_ds_manifest.json` lists exactly twelve components (`ItemPickerSheet`,
`OutfitSuggestionCard`, `UiButton`, `UiError`, `UiFormField`, `UiInput`, `UiPage`,
`UiPopup`, `UiSelect`, `UiTextArea`, `UiTitle`, `UiToast`). Neither name exists in
`components/` either.

What the mockup *does* is build both as ad-hoc markup:

- the **status pill** — padding 2/6, `r999`, ground = status colour at 13.3 %, label
  9.5/600 ls 0.57 in the status colour — appears 12 times across the grid and the filters
  sheet;
- the **item card** — 175 × 150 `r15` photo frame, 17 px caption row, name 12.5/500/16
  plus the status pill — appears 6 times.

Both are worth extracting, but that is a decision for the phase that builds the Items
screen, not something the mockup decided.

### 7.4 Other gaps worth knowing before building

- **`UiPage.indented` is inert.** The published DS README documents the defect: the
  component's style array ends with `{ paddingTop: insets.top }`, which overrides the
  60 px offset in both directions. The mockup does its own padding (62 top) and never
  relies on it.
- **Only `UiButton`, `UiTitle` and `UiToast` accept `style`.** Every layout change to the
  other nine has to come from their own props — and the artboard proves the redesign needs
  style overrides on buttons (`height: 50`, `borderRadius: 10`) and on titles (family,
  size, weight, tracking). Anything the mockup restyles on `UiInput`, `UiSelect`,
  `UiFormField` or `UiTextArea` will need a component change, not a caller change.
- **`UiButton` does not colour its own label.** The filled variant sits on `accent`
  (near-white); the caller must pass `accentText`. The mockup does this on every primary
  button.
- **Fonts are not in the repo.** See §4.4 — both families must be added as assets before
  any of this renders correctly on device.

---

## 8. Snap table

plan-13 Phase 2 output. Every distinct numeric literal now present in
`components/**/styles.ts` (34 files) and the twelve route files under `app/` — that is,
every `.tsx` in `app/` except the three `_layout.tsx` — with its occurrence count and the
`theme/layout.ts` token that replaces it.

Phases 3–7 consume this table. A phase may not deviate from a mapping without recording
the deviation here, in the same commit that deviates.

Counts come from a `prop: <number>` sweep of those 46 files, so the same literal appears in
more than one row when it plays more than one part (a `14` that is a `paddingHorizontal` and
a `14` that is a `fontSize` are two different design decisions). "n" is the count within
that role, not across the file set.

### 8.1 Spacing — `padding*`, `margin*`, `gap`

| px | n | Target token | Note |
|---|---|---|---|
| −8 | 2 | `-spacing.sm` | negative overlap in the item form |
| 0 | 3 | — | zero stays zero |
| 2 | 6 | `spacing.hair` | |
| 3 | 2 | `spacing.micro` | |
| 4 | 23 | `spacing['3xs']` | |
| 5 | 4 | `spacing['2xs']` | |
| 6 | 9 | `spacing.xs` | |
| 7 | 1 | `spacing.chipY` | |
| 8 | 53 | `spacing.sm` | the most common literal in the repo |
| 9 | 1 | `spacing.smPlus` | |
| 10 | 28 | `spacing.md` | |
| 12 | 22 | `spacing.lg` | the card rhythm |
| 14 | 25 | `spacing.cardPad` | 11 of these are already `paddingHorizontal` on a card |
| 15 | 8 | `spacing.rowY` | |
| 16 | 17 | `spacing.xl` | |
| 18 | 1 | `spacing.section` | |
| 20 | 5 | `spacing.gutter` | equals `pageInlineIntent`; prefer `pageInlineIntent` where it is a page gutter |
| 24 | 2 | `spacing['2xl']` | |
| 28 | 3 | `spacing['3xl']` | |
| 30 | 1 | `spacing['3xl']` | **deviation: −2 px.** Login form block; no 30 px row in §2 |
| 32 | 1 | `spacing['3xl']` | **deviation: −4 px.** Sheet padding-block; §2 tops out at 28 |
| 35 | 1 | — | `SearchBar` left inset for the icon; derive as `spacing.cardPad + iconSize.mdPlus` (30) when the search field is rebuilt against §6.3 |
| 40 | 3 | — | empty-state padding; no §2 row. Re-derive from §6 when those screens land |
| 60 | 3 | `spacing.statusBar` | **+2 px.** §6.1 measures the scroll region's top padding as 62, not 60 — `UiPage` is the one that changes |
| 80 | 1 | — | `ItemsGrid` top padding; no §2 row. §6.3 has the real figure |
| 100 | 2 | `spacing.tabBarClearance` | **−4 px.** §2 records 96 for scroll-content bottom padding |

### 8.2 Radius — `border*Radius`

| px | n | Target token | Note |
|---|---|---|---|
| 3.5 | 1 | `radius.round` | the 7 × 7 typing-indicator dot; a circle, so 999 clamps to the same pixel |
| 4 | 3 | `radius.dot` | chat-bubble tail corners. **The mockup has no message thread** (§6.4 is the session list), so this is the one radius §3 cannot arbitrate |
| 6 | 7 | `radius.pill` | skeleton bars, 11–13 px tall — 6 on an 11 px bar is already a stadium |
| 8 | 11 | `radius.control` | 9 × `borderRadius` → 10. The 2 × `shadowRadius: 8` are blur, not corners — no token |
| 10 | 12 | `radius.control` | |
| 11 | 1 | `radius.tileLg` | `ItemPickerSheet` thumbnail |
| 12 | 5 | `radius.tileLg` | the 175 × 150 item-grid photo |
| 14 | 2 | `radius.cardSm` | |
| 15 | 1 | `radius.card` | `UiError` |
| 16 | 12 | `radius.card` | |
| 17 | 4 | `radius.round` | 34-tall filter chips and the 34 × 34 avatar — circles by construction |
| 18 | 2 | `radius.pill` | the 36-tall chat input capsule |
| 20 | 8 | split | `borderTopLeft/RightRadius` on `LogEntrySheet` → `radius.sheet` (24); the chip and `ItemCard` uses → `radius.pill`; `UiSelect` → `radius.control` |
| 22 | 1 | `radius.round` | 44 × 44 icon button |
| 25 | 1 | `radius.control` | the search input — §3 puts it at 10, so this is a visible change |
| 28 | 3 | `radius.round` | the 56 × 56 FAB and the empty-state circle |
| 32 | 2 | `radius.round` | 64 × 64 empty-state circle |

`OutfitSuggestionCard`'s two `borderRadius: 8` thumbnails are the §3 "leave to component"
row; they land on `radius.control` here only because 8 and 10 collapse. If that component
is rebuilt, its slots are `radius.tile` (10) per §3's prose.

### 8.3 Type — `fontSize`, `lineHeight`, `letterSpacing`, `fontWeight`

| px | n | Prop | Target token |
|---|---|---|---|
| 10 | 2 | `fontSize` | `typography.eyebrow` |
| 11 | 8 | `fontSize` | the 11 px roles — `wordmark`, `avatarInitials`, `fieldLabel`, `temperature`; pick by role, they differ only in tracking |
| 12 | 7 | `fontSize` | `typography.chipLabel` / `chipLabelSelected` |
| 13 | 23 | `fontSize` | `typography.overflowChip` |
| 14 | 18 | `fontSize` | `typography.rowLabel` / `valueEmphasis` |
| 15 | 23 | `fontSize` | `typography.rowLabel` (14). **Deviation: −1 px.** §4.3 has no 15 px role; the redesign drops the size |
| 16 | 17 | `fontSize` | `typography.rowLabel` (14) for body text, `typography.button` (18) for a button label. §4.3's only 16 px row is the native textarea, which stays component-owned |
| 17 | 6 | `fontSize` | `UiTitle sizeXS`. §4.1 confirms 17 is correct and §4.2 shows the mockup never uses the flag — leave until a caller needs it |
| 18 | 2 | `fontSize` | `typography.button` |
| 20 | 6 | `fontSize` | `typography.statNumeral` |
| 22 | 1 | `fontSize` | `typography.sheetTitle` (`UiTitle` default) |
| 28 | 1 | `fontSize` | `typography.screenTitle` (`UiTitle sizeL`) |
| 32 | 1 | `fontSize` | `typography.screenTitle` (28). **Deviation: −4 px.** Home screen title; §4.3 caps at 28 |
| 18 | 2 | `lineHeight` | `typography.body.lineHeight` — settings help text |
| 20 | 6 | `lineHeight` | `typography.button.lineHeight` |
| 21 | 1 | `lineHeight` | take the role's own `lineHeight`; §4.3 has no 21 |
| 38 | 1 | `lineHeight` | `typography.screenTitle.lineHeight` (32) |
| 0.5 | 1 | `letterSpacing` | `tracking.eyebrow` (1.4) — the log-sheet eyebrow is under-tracked today |
| 0.6 | 1 | `letterSpacing` | leave to the component: §4.3's 11/600 ls 0.6 row is `OutfitSuggestionCard`'s own `-apple-system` text |
| 0.8 | 3 | `letterSpacing` | `tracking.meta` (0.8) — exact match |
| 700 | 1 | `fontWeight` | `typography.statNumeral.fontWeight` |

**How the `lineHeight` numbers in `theme/layout.ts` were derived.** §4.3 records a numeric
line-height for five roles only; the rest read `normal`. `normal` is the font's own
ascent + descent + lineGap over its units-per-em, so it was read out of the two shipped
font files rather than guessed:

| Family | upem | hhea asc / desc / gap | `normal` factor |
|---|---|---|---|
| Archivo (`v25`, wght 400) | 1000 | 878 / −210 / 0 | **1.088** |
| Newsreader (`v25`, opsz 6–72, wght 400) | 2000 | 1470 / −530 / 0 | **1.000** |

Both fonts set the OS/2 `USE_TYPO_METRICS` bit and their typo metrics equal their hhea
metrics, so Blink resolves `normal` from the same numbers. Every `normal` row therefore
becomes `round(fontSize × 1.088)` for Archivo and `fontSize` exactly for Newsreader — for
example `button` 18 → 20, `eyebrow` 10 → 11, `sheetTitle` 22 → 22. The five measured rows
(28→32, 26→30, 20→24, 12.5→16, 11.5→15) are used as measured and are *not* what the factor
predicts, because the artboard authors those five explicitly.

### 8.4 Borders

| px | n | Target token | Note |
|---|---|---|---|
| 1 | 14 | `border.hairline` | 11 `borderWidth`, 2 `borderBottomWidth`, 1 `borderTopWidth` |
| 2 | 4 | `border.hairline` | **Deviation: −1 px.** §3's closing note: 1 px solid everywhere, and one 1 px dashed. There is no 2 px border in the mockup |

### 8.5 Box geometry — `width`, `height`, `min*`, `max*`, `top/right/bottom/left`

These are §6 layout figures, not scale tokens; only the icon-sized ones map into
`iconSize`. Listed so the table is exhaustive.

| px | n | Target |
|---|---|---|
| 0 | 5 | — |
| −2 | 2 | `-spacing.hair` (badge offset) |
| 1 | 1 | `border.hairline` (a 1 px rule drawn as a `height`) |
| 4 | 2 | `spacing['3xs']` (badge offset) |
| 6 | 2 | `spacing.xs` (badge offset) |
| 7 | 2 | — typing dot, 7 × 7 |
| 10 | 3 | `spacing.md` (absolute offsets) |
| 11, 12, 13 | 2, 2, 2 | — skeleton bar heights; mirror the role they stand in for |
| 16 | 4 | `iconSize.mdPlus` where it is a glyph box, otherwise § 6 |
| 20 | 5 | `iconSize.xl` for the glyph box; `spacing.gutter` for the 4 absolute offsets |
| 22 | 2 | — |
| 28, 32 | 1, 1 | — |
| 34 | 8 | — §6.1 avatar, 34 × 34: already correct |
| 36 | 5 | — chat input row |
| 40 | 1 | — |
| 44 | 2 | — §3 settings toggle track is 44 × 26: already correct |
| 46 | 3 | — |
| 48 | 1 | — §3 send button is 48 × 48: already correct |
| 56 | 6 | — §3 FAB is 56 × 56: already correct |
| 60 | 4 | — |
| 64 | 7 | — |
| 70 | 3 | — §3 row 8: `OutfitSuggestionCard` thumbnails are 70 × 105: already correct |
| 80 | 2 | — |
| 90 | 2 | — |
| 96 | 2 | `spacing.tabBarClearance` where it is scroll clearance; otherwise § 6 |
| 100 | 3 | — |
| 105 | 3 | — see 70 |
| 120, 160, 260 | 1, 2, 2 | — |

### 8.6 Not design values

Present in the sweep, deliberately untokenised: `flex: 1` (41), `flexShrink: 1` (3),
`flexGrow: 1/0` (3), `aspectRatio: 2` (5) and `3` (2), `shadowOpacity: 0.3` (2),
`shadowRadius: 8` (2), `elevation: 8` (2), `opacity: 0.4` / `0.5` (2), `zIndex: 100` (1),
and `quality: 0.8` (4, an `expo-image-manipulator` compression ratio, not a style).

### 8.7 What this phase deliberately did not tokenise

- **The `-apple-system` rows of §4.3.** Six text roles in the mockup render on the React
  Native default family because the mockup never restyled the component that owns them
  (`UiTextArea`, `UiSelect`, `OutfitSuggestionCard`). Pinning them into `typography` would
  change a design the mockup did not make.
- **The 13 colour swatches of §1.3.** Content, not theme, and the backend already owns the
  list.
- **A second border width.** §3 is explicit that 1 px is the only width, so `border` ships
  one key. The four `borderWidth: 2` call sites in 8.4 are a change, not a gap in the scale.
- **`radius` for the 2 px row of §3.** §3 maps both 1 and 2 to `radius.hair`; the token
  carries 1.

### 8.8 Phase 3 deviations from the table above

Section 8's rule is that a phase may not deviate from a mapping without recording the
deviation here, in the same commit. Phase 3 restyled `components/ui/**` and took eleven
deviations. Every one is a case where the by-the-number row would have produced a
result section 4 or section 5 contradicts, because §8.1–§8.5 map a *literal* while
§4.3 and §5 map a *role*, and one literal can play two roles.

| Where | Table row | Applied instead | Why |
|---|---|---|---|
| `UiTitle.sizeXS` | 8.3, 17px → "leave until a caller needs it" | `typography.sessionTitle` (14.5 / 500) | A caller needs it. Its one usage in the repo is the chat header in `app/(app)/chat/[sessionId].tsx`, which §4.3 measures as the 14.5 / 500 chat-session-title role. The AC also requires all five flags to be `typography.*` spreads, and there is no 17px role |
| `UiPopup.title` | 8.3, 20px → `typography.statNumeral` | `typography.sheetTitle` (22 / 400) | This bar titles a bottom sheet — §4.3's "Filters" / "Add item" / "Edit entry" row — not a pulse stat numeral |
| `ItemPickerSheet.title` | 8.3, 17px | `typography.sheetTitle` (22 / 400) | Same: it is a sheet heading |
| `ItemPickerSheet.subtitle` | 8.3, 13px → `typography.overflowChip` | `typography.body` (11.5 / 400) | `overflowChip` is 13 / **600**; a live "<n> selected" count is a secondary line, and would have been bolded |
| `ItemPickerSheet.itemName` | 8.3, 11px → "pick by role" | `typography.cardName` (12.5 / 500) | The four 11px roles the row offers are wordmark, avatar initials, field label and temperature. None is an item name; §4.3's item-card-name row is |
| `ItemPickerSheet.checkOverlay` radius | 8.2, 11px → `radius.tileLg` | `radius.round` | The row attributes the literal to "`ItemPickerSheet` thumbnail". It is not — it is the 22 × 22 selected-check badge, a circle by construction, which is the reading §8.2 already gives its 17 / 22 / 28 / 32 rows |
| `PromptShortcutChips.chipText` | 8.3, 13px → `typography.overflowChip` | `typography.chipLabel` (12 / 500) | These are the "Ask Wardropka" chips, which §4.3 measures as the 12 / 500 ask-chip role |
| `UiEmptyState.title` | 8.3, 16px → `rowLabel` (body) or `button` (button label) | `typography.button` (18 / 600) | Neither offered role is a heading; `button` is the one that keeps the 600 weight the empty-state title already had |
| `UiEmptyState.subtitle` line-height | 8.3, 20px → `typography.button.lineHeight` | the role's own 15 | §8.3's 21px row sets the principle: take the role's own line-height. Borrowing `button`'s 20 onto body text would pin a number no role asks for |
| `UiEmptyState` icon size | §5 | `iconSize.xxl` (24) | The glyph was drawn at 28. §5's size column tops out at 24 and has no 28px entry |
| `UiToast.text` colour | — | `colors.textPrimary` | Was a hardcoded `#FFFFFF`, which `CLAUDE.md` forbids. §1.1 records no pure white anywhere in the mockup, so the palette gets no new key; `textPrimary` (`#F0F0F0`) is the light-on-dark ink and reads identically on both toast grounds |

Three further choices are *within* the table and are noted only so a later reader does
not mistake them for drift:

- **`UiToast.text` size.** §8.3's 15px row targets `typography.rowLabel` (14). The 14px
  row offers `rowLabel` **or** `valueEmphasis`; `valueEmphasis` was taken because it is
  the same 14px at the 500 weight the toast already carried. Same reasoning for
  `UiError.errorText` and `UiFormField.errorText`, which carried a bare `fontWeight: '500'`
  and no size.
- **`OutfitSuggestionCard` and `UiSkeletonCard` thumbnail radius.** §8.2 lands both on
  `radius.control`; they use `radius.tile`, the token §8.2's own closing note names for
  them. The two tokens carry the same value (10), so nothing renders differently.
- **`OutfitSuggestionCard.header.minHeight`.** §8.5's 16px row reads "`iconSize.mdPlus`
  where it is a glyph box, otherwise § 6". It is a glyph box: it reserves the delete
  icon's height so a card without a topic keeps its rhythm.

**Applied as written, worth flagging because they are visible changes:** `UiButton` and
`UiSelect` radius 8 / 20 → `radius.control` (10), per §8.2; `ItemPickerSheet.cell` and
the four other `borderWidth: 2` sites → `border.hairline`, per §8.4; `UiPage`'s top
padding 60 → `spacing.statusBar` (62), per §8.1.

**Deliberately not done in Phase 3.** `QuickChatInput` still sends with `arrow.up`.
§5 records that the mockup's ask-input send glyph is a bold right arrow and that
`arrow.up` "points the wrong way"; `arrow.right` is now in `MAPPING`, but swapping the
call site is a design change to the Home screen, which is Phase 4's surface.

### 8.9 Phase 4 deviations, and the copy Home now ships

Phase 4 rebuilt Home (`components/pages/app/home/HomeScreen/`) against §6.2. Four
deviations from the table, all the same shape as §8.8's: §8.3 maps a *literal*, §4.3 maps
a *role*, and Home's literals were carrying the wrong role.

| Where | Table row | Applied instead | Why |
|---|---|---|---|
| `sectionEyebrow` ("ASK WARDROPKA", "RECENT SUGGESTIONS") | 8.3, 20px → `typography.statNumeral` | `typography.eyebrow` (10 / 600, ls 1.4) | §4.3's section-eyebrow row names these two strings verbatim. `statNumeral` is the pulse tile's numeral, which Home does not render |
| `seeAll` | 8.3, 14px → `rowLabel` / `valueEmphasis` | `typography.dateChip` (10 / 500, ls 1.0) + `colors.textPrimary` | §4.3 has a row for "SEE ALL →" specifically: 10 / 500, ls 1.0, `textPrimary`. `dateChip` is the same triple at a different colour; adding a second identical role would be an invented token |
| `greeting` | 8.3, 32px → `typography.screenTitle`, "deviation −4 px" | `UiTitle sizeL` | Same landing point, reached through the component: `UiTitle sizeL` *is* `typography.screenTitle` + `tracking.screenTitle` since Phase 3, and the AC requires the headings to render through `UiTitle` |
| `PromptShortcutChips.chip` ground | — | no `backgroundColor` (was `colors.surface`) | §6.2 gives the ask chips "padding 7 / 13, `r999`, 1 px `#262626`" and no ground. The border colour moves from `colors.border` `#2E2E2E` to `colors.hairline` `#262626` for the same reason |

**Applied as written, worth flagging because they are visible changes.**
`PromptShortcutChips` chip padding 14 / 9 → `spacing.chipX` / `spacing.chipY` (13 / 7) and
gap 8 → `spacing.xs` (6), per §6.2. `QuickChatInput`'s field radius 14 →
`radius.control` (10), its height 46 → 51, its send button 46 → 48 at `radius.round`, and
its glyph `arrow.up` 20 → `arrow.right` 18 — the swap §8.8 deferred to this phase.
The ask block is built to §6.2's decomposition of its 107 px — eyebrow 11, chips 29, input
51, 8 between each. Measured in Chromium at 390 px it comes out at **114**: the chip row
carries 2 px of vertical padding either side so the horizontal scroller cannot clip the
chip borders, and the multiline field's intrinsic line box takes it to 54 rather than its
51 px minimum. Both are platform, not scale.

**Section order.** §6.2 numbers the ask block **2** and recent suggestions **3**, so Home
now renders ask above recent. It previously rendered them the other way round.

**`UpcomingOccasions`.** Home's one remaining section without a §6.2 counterpart. Its
header moved onto the same eyebrow role as the other two, and ships as **"UPCOMING
OCCASIONS"**, so the screen reads as one page; its trailing `marginBottom: 28` is gone
because `HomeScreen` now owns the rhythm between its sections. The occasion cards
themselves still carry their pre-redesign literals — they belong to the phase that
rebuilds them.

**A `UiPage` defect this phase surfaced.** Home is the first caller of Phase 3's
`refreshControl` prop, and on web the page rendered at a 40 px gutter and a 124 px top
inset — both exactly double. `react-native-web`'s `ScrollView` clones a `refreshControl`
with `style: props.style` and keeps that style on the scroll view as well
(`ScrollView/index.js`), so anything in the scroll view's own `style` is applied twice.
The padded frame is now a `View` wrapping the scroll view, which applies it once and still
keeps the top offset from scrolling away. Measured after the fix: gutter **20**, top inset
**62**, both §6.1's figures.

**Copy.** §4.3's eyebrow role is set in capitals, so the three section headings ship as
**"ASK WARDROPKA"**, **"RECENT SUGGESTIONS"** and **"UPCOMING OCCASIONS"**, and the
affordance as **"SEE ALL →"** (was "Ask Wardropka", "Recent Suggestions", "Upcoming
Occasions", "See all"). The arrow is a text character:
§5's icon inventory has no entry for it. The suggestions empty state now reads "Start a
chat **above**…" because the ask block moved above it. The `testID`s are unchanged, and
`e2e/support/testIds.ts` carries the rendered strings as comments.

**Not in Home, and why.** §6.2's **hero card** (item 1) and **pulse block** (item 4) are
not built. Both are surfaces for product the app does not have — there is no
outfit-of-the-day, no "Wear this today" logging action and no wardrobe stat aggregate —
so building them would mean inventing behaviour, not applying a design. §6.1's
**masthead** and its avatar entry point to Settings are likewise unbuilt: the tab bar
already routes to Settings and the masthead is shell, not Home. Home's own greeting block
and `UpcomingOccasions` section have no §6.2 counterpart and are kept, restyled onto the
scale. Everything §6.2 records for the ask block and for recent suggestions is applied.
