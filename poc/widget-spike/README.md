# Tolgee Widget Spike

POC for the proposed Widget+Plugin architecture for the Tolgee Figma plugin.
**Throwaway code** — answers specific architecture questions and proves a
minimal end-to-end Tolgee Pull/Push flow on top of a widget. Not intended to
ship.

## Why a widget at all

Today's Tolgee plugin stores per-text-node `pluginData` and walks the entire
scenegraph (`findTextNodes(figma.currentPage.children)`) on every operation.
This causes the performance + storage pain we're trying to address.

A widget-based model swaps:

- Tree walk → `figma.root.findWidgetNodesByWidgetId(WIDGET_ID)` (O(K)).
- Per-node JSON `pluginData` → structured `useSyncedState` per widget.
- `formatText.ts` font-loading pipeline → `<Text><Span>…</Span></Text>` with
  declarative `fontWeight` / `italic` / `textDecoration`.
- Plugin-only lifecycle → live re-render on `setWidgetSyncedState` from any
  push/pull, even without the plugin UI open.

## Architecture findings (validated)

### ✅ What works

| Finding | Detail |
|---|---|
| Inline rich text | `<Span>` inside `<Text>` supports `fontWeight`, `italic`, `textDecoration: "underline"`, `fill`. The 250 LOC font-loading pipeline in `formatText.ts` becomes ~30 LOC of HTML-tag parsing + JSX. |
| Bulk re-render performance | 250 widgets, sequential `setWidgetSyncedState`: **67ms** (~0.27ms/widget). Linear; 1000 widgets ≈ 270ms. Push/Pull and live language switching are well within budget. |
| Widget index lookup | `figma.root.findWidgetNodesByWidgetId(WIDGET_ID)` is the indexed lookup we wanted. Combined with `loadAllPagesAsync()` it's the replacement for the full tree walk. |
| Plugin → Widget bridge | `WidgetNode.setWidgetSyncedState(state)` from widget code (incl. UI iframe message handlers) reliably triggers a re-render. The function is gated to `widgetId` matching, so combined widget+plugin manifest is required. |
| Combined manifest | `{ "containsWidget": true, "main": ..., "ui": ... }` works. Widget code and showUI iframe coexist; `figma.showUI` is reachable from widget property menu callbacks. |
| Auto-Layout migration | `parent.insertChild(idx, widget)` after `cloneWidget` preserves Auto-Layout flow when replacing a TextNode in-place. Position, padding, and stretching all behave correctly. |
| Layer-panel naming | Setting `WidgetNode.name = stripMarkup(translation)` via `useEffect` keeps the layer name aligned with the rendered text instead of "Tolgee Widget Spike". `<Text name={keyName}>` names the sub-layer with the Tolgee key. |
| Property-menu UX | Property menu is for *widget-instance* actions (Edit text, Show info). Plugin-level actions (Convert, Sync) belong in the spike UI / plugin UI — the property menu only shows when the widget is selected, which is incompatible with selection-driven actions like "Convert selected TEXT". |
| Tolgee API integration | Pull (`GET /v2/projects/translations`) and Push (`POST /v2/projects/single-step-import-resolvable`) work end-to-end from widget code with `X-API-Key` header and `networkAccess: ["*"]` in manifest. |

### ❌ What does NOT work (API limits)

| Limit | Implication |
|---|---|
| `figma.root` (and most plugin API) is forbidden during widget render | Translations cannot live in a shared root pluginData cache and be read synchronously from each widget render. They must live in `useSyncedState` per widget instance. **Storage scales with instances, not unique keys** — no win vs. today's per-text-node pluginData. |
| Widgets have no native drag-resize handles | Widget bounding-box is determined by the declarative render output. There's no `onResize` event. Width changes require explicit syncedState updates (UI input, not drag). This is a real UX regression vs. TextNode for source-language editing. |
| `<Input>` as root: no `<Span>` children | Inline editing means losing inline formatting during edit. Markup tags `<b>...</b>` would show as raw text. We chose `<Text>+<Span>` (formatted display) + Edit modal (key + translation editor) instead. |
| `setWidgetSyncedState` rejects `undefined` values | Must strip undefined keys before calling; `useSyncedState` falls back to its declared default. Helper `selfUpdate` does this. |
| `setWidgetSyncedState` replaces state, doesn't merge | Always spread current state: `{ ...node.widgetSyncedState, ...patch }`. |
| `documentAccess: "dynamic-page"` is required for new widgets | Forces async plugin API: `figma.getNodeByIdAsync` instead of `figma.getNodeById`, `figma.loadAllPagesAsync()` before cross-page reads. **Virally affects the existing main plugin** if we share the manifest. Estimated 30+ call sites in `src/main/`. |

### ⚠️ Behaviour to know

| Topic | Detail |
|---|---|
| Widget version snapshots | Widget instances embed a snapshot of the widget code at insert time. They do **not** auto-upgrade when a new version is published. Upgrade triggers: user clicks "Update widget" in resource panel, OR plugin code calls `setWidgetSyncedState` on an older instance (auto-upgrades). In practice: any Pull/Push run upgrades all touched widgets. **Architectural consequence**: never make breaking syncedState schema changes; always read defensively (`state.key ?? state.keyName`). |
| `__html__` injection | The default `@create-figma-plugin` build replaces `__html__` with the UI HTML automatically. Our custom esbuild build does it via `define: { __html__: JSON.stringify(html) }`. We use the same trick for a second `EDIT_HTML` constant. |
| `figma.showUI` lifetime | The promise returned from a property-menu callback must stay open until the UI signals close (via `CLOSE` message → `resolve()`). Resolving immediately after `figma.showUI` makes the modal flash and disappear. |
| `figma.ui.onmessage` registration | Must be set up *inside* the `figma.showUI` promise body, not in `useEffect`, because `figma.ui` only exists after `showUI` is called. |

## Architecture decisions for production

If we go ahead with this refactor:

1. **Per-widget `useSyncedState` for translation data**.
   `{ keyName, translation, fontSize, fontFamily, fontWeight, fill, horizontalAlignText, verticalAlignText, widgetWidth }`. Treated as snapshot; written by Pull, read by render.
2. **Combined manifest** with `containsWidget: true`, single `id` matching the
   widget. Widget code carries the `figma.showUI` flow for the existing
   plugin views (Settings, Pull review, Push review, Push diff).
3. **Migration command** in the new plugin UI: convert legacy text nodes
   (with `tolgee_info` pluginData) to widgets. Already prototyped here as
   `convertTextNodes(scope: "selection" | "page")`.
4. **Edit modal** for source-language editing of `keyName + translation` with
   markup support. Inline `<Input>` rejected for v1 due to markup loss.
5. **No per-instance drag-resize**. Width changes via property menu, plugin
   UI (slider/input), or the widget's sub-layer (Figma's native text
   resize on the inner `<Text>` node — see "Resize via sub-layer" below).
6. **Schema discipline**: every `useSyncedState` reads defensively with a
   fallback default; new fields are always optional + additive.

## What this POC actually does

### Widget render (`src/widget.tsx`)

- Root `<Text>` with `<Span>` children parsed from `<b>/<i>/<u>` markup.
- `useEffect` keeps `WidgetNode.name = stripMarkup(translation)` in sync so
  the layer panel shows real text.
- `<Text name={keyName}>` so the sub-layer has the Tolgee key.
- Property menu: Edit text, Open Spike UI, Show info.
- Hover style: pink stroke for visual indication that this is a Tolgee
  widget.

### Spike UI (`src/ui.html` + `src/ui.ts`)

- **Settings**: API URL, API key, language. Persisted in
  `figma.clientStorage` (`tolgee_spike_settings_v1`). Auto-loaded when
  the spike UI opens.
- **Sync**: Pull / Push buttons. Both use the configured language.
- **Migration**: Convert selected TEXT, Convert ALL TEXT on page.
- **Debug**: Dump synced states, Benchmark bump.

### Edit modal (`src/edit.html` + `src/edit.ts`)

- Key input + translation textarea with markup hint.
- Cmd+Enter saves, Escape cancels.
- Pre-populated via `INIT` message from the widget on open.

### Tolgee API calls (in widget code)

```ts
// Pull
GET /v2/projects/translations?languages=<lang>&size=10000
// Push
POST /v2/projects/single-step-import-resolvable
  body: { keys: [{ name, translations: { [lang]: { text, resolution: "OVERRIDE" } } }] }
// Headers (both)
X-API-Key: <token>
Content-Type: application/json
```

`tolgeeFetch(path, init)` wraps these and throws on non-2xx with the body
truncated to 200 chars.

### Convert command (TextNode → widget)

`convertTextNodes(widgetNodeId, scope)` walks the selection or current page,
picks `TEXT` nodes, and for each one:

1. Resolves `keyName` (3-step priority):
   1. `pluginData.tolgee_info.key` (legacy plugin)
   2. Layer name with `t:` prefix (legacy README convention)
   3. Random `key-xxxxxx` placeholder
2. Resolves `translation` from `pluginData.tolgee_info.translation`, falling
   back to `textNode.characters`.
3. Reads `fontSize`, `fontFamily`, `fontWeight`, fill color, horizontal +
   vertical alignment, width (from `textAutoResize`).
4. Calls `myWidgetNode.cloneWidget(state)` and `parent.insertChild(idx, ...)`
   so Auto-Layout takes over positioning.
5. Removes the original TextNode.

## Out of scope for this spike (deferred to v2)

- Namespacing
- Branching
- Cursor-based pagination on Pull (currently `size=10000`)
- Plurals / ICU formatting
- Screenshot upload
- Tags
- Push conflict resolution (currently hardcoded `OVERRIDE`)
- Per-instance language overrides
- Multi-language preview
- `connected` / `isPlural` / `pluralParamValue` / `paramsValues` migration
  fields (read but not used)

## Build

```sh
cd poc/widget-spike
npm install
npm run build      # one-shot
npm run watch      # rebuild on change
```

## Load in Figma

1. Figma Desktop → Plugins → Development → **Import plugin from manifest…**
2. Pick `poc/widget-spike/manifest.json`.
3. Resources panel (Shift+I) → Widgets tab → "Tolgee Widget Spike" → drag
   onto canvas.
4. Property menu → **Open Spike UI**.

## End-to-end test protocol

### S1 — Settings + Pull

1. Open spike UI from a widget property menu.
2. Enter `https://app.tolgee.io` (or your self-hosted URL), a project API
   key, and a language (e.g. `en`). Save.
3. Drop ~3 widgets, give them keys via Edit ("Edit text" → set Key).
4. Click **Pull** → log shows `{updated, unchanged, missing,
   totalKeysOnServer}`. Widgets that have a matching `keyName` on the
   server now show the server's translation. Layer-panel names update.

### S2 — Edit + Push

1. Edit a widget's translation locally (Edit modal, Cmd+Enter saves).
2. Click **Push** → log shows `{pushed: N}`.
3. Verify in the Tolgee web UI that the translation arrived for the
   configured language.

### S3 — Migration from legacy plugin

1. Open a Figma file that already used the legacy Tolgee plugin (TextNodes
   with `tolgee_info` pluginData).
2. Drop one spike widget anywhere (just to access its property menu / spike
   UI).
3. Open spike UI → **Convert ALL TEXT on page**.
4. Verify: widgets carry the Tolgee key from the legacy pluginData (not
   `key-xxxxxx`), translations are pre-populated, alignment / fontSize /
   fontFamily / color are preserved.

### S4 — Auto-Layout fidelity

1. Build a Figma frame with `layoutMode: "VERTICAL"` containing several
   TextNodes with mixed alignments.
2. Convert via spike UI.
3. Verify: layout flows correctly, no x/y shift, alignment respected on
   each widget.

### S5 — Performance baseline

1. Convert ~50 TextNodes (or use the convert + clone-50 from selection
   pattern).
2. Click **Benchmark bump** → log shows ms for full bulk
   `setWidgetSyncedState` round-trip. Sanity-check against the 67ms / 250
   widgets baseline.

## Files

```
poc/widget-spike/
├── manifest.json         # combined widget+plugin (containsWidget + ui)
├── package.json          # esbuild + figma typings
├── tsconfig.json         # references the two below
├── tsconfig.widget.json  # widget compile config (no DOM lib)
├── tsconfig.ui.json      # ui compile config (with DOM lib)
├── build.mjs             # esbuild driver, inlines ui.js+edit.js into HTML
└── src/
    ├── widget.tsx        # widget render + plugin message handlers
    ├── ui.ts / ui.html   # spike UI (settings, pull/push, convert, debug)
    └── edit.ts / edit.html  # inline edit modal (key + translation)
```

## Open questions for production scoping

1. **dynamic-page migration cost**: how much of `src/main/` needs to go
   async? Spike count of `figma.getNodeById` and `figma.currentPage.children`
   call sites would inform this.
2. **Component-instance behaviour**: legacy TextNodes inside Figma
   components — does conversion preserve the master-instance relationship?
   Not yet tested in this spike.
3. **Mixed font runs**: `getRangeAllFontNames` on a TextNode with mixed
   fonts → how do we serialize that into a single `fontFamily` syncedState
   value? Spike currently reads only the font of the first character.
4. **Schema versioning** for the syncedState: introduce `version: 1` field
   from day one to make additive migrations explicit.
5. **Push conflict UX**: today's plugin has a diff view + conflict
   resolution (`SimpleImportConflictResult`). Reproducing that is a
   separate larger task; spike skips it.
