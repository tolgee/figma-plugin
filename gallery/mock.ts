import { shouldIgnoreNode } from "$main/nodes/filter";
import type { NodeInfo, TolgeeConfig } from "$shared/types";
import { appState } from "$ui/lib/stores/app.svelte";
import { auth } from "$ui/lib/stores/auth.svelte";

/**
 * Seed the singleton stores with believable demo data so the real route
 * components render a fully populated UI in a plain browser — no Figma main
 * thread and no Tolgee backend required.
 *
 * The TanStack queries inside the routes are gated on `authenticated` /
 * `branchingEnabled` / having a selection, so with branching off and a
 * non-empty selection the Index view never hits the network. Routes that *do*
 * fetch (Push/Pull/…) get a Proxy "client" whose every method rejects, which
 * lands them in their normal error/empty state instead of crashing.
 */

/** Sample Tolgee keys so the Connect screen renders real result rows. */
const SAMPLE_KEYS = [
  { id: 1, name: "Component_button_my_string", namespace: null, translation: "Bla bla bla", baseTranslation: "Bla bla bla", plural: false },
  { id: 2, name: "Component_button_save", namespace: null, translation: "My string", baseTranslation: "My string", plural: false },
  { id: 3, name: "Component_button_count", namespace: "common", translation: "My string 2", baseTranslation: "My string 2", plural: true },
  { id: 4, name: "Component_button_save_3", namespace: null, translation: "My string 3", baseTranslation: "My string 3", plural: false },
  // Exact match for the "Submit" sample nodes → "Connect by exact match" links them.
  { id: 5, name: "submit", namespace: "common", translation: "Submit", baseTranslation: "Submit", plural: false },
  // Two keys with the SAME text "Welcome" → ambiguous (skipped & listed).
  { id: 6, name: "page.welcome", namespace: null, translation: "Welcome", baseTranslation: "Welcome", plural: false },
  { id: 7, name: "home.welcome", namespace: "home", translation: "Welcome", baseTranslation: "Welcome", plural: false },
];

/**
 * Client stand-in — a plain object (NOT a Proxy: Svelte's `$state` wraps the
 * stored value and a Proxy's custom traps don't survive that, so methods must
 * be real own-properties). `GET /…/keys/search` returns sample keys so the
 * Connect screen has rows; everything else resolves to an empty/error result.
 */
const mockClient = {
  // biome-ignore lint/suspicious/noExplicitAny: loose mock signature
  GET: async (path: string, opts?: any) => {
    if (typeof path === "string" && path.includes("keys/search")) {
      // Filter the sample keys by the search term (key name + translations) so
      // the Connect screen behaves realistically — and so a non-matching query
      // shows its empty state.
      const search = String(opts?.params?.query?.search ?? "")
        .trim()
        .toLowerCase();
      const keys = search
        ? SAMPLE_KEYS.filter(
            (k) =>
              k.name.toLowerCase().includes(search) ||
              (k.translation ?? "").toLowerCase().includes(search) ||
              (k.baseTranslation ?? "").toLowerCase().includes(search),
          )
        : SAMPLE_KEYS;
      return { data: { _embedded: { keys } } };
    }
    if (typeof path === "string" && path.includes("projects/stats")) {
      // Project-wide key total, so Connect's empty state can say "0 of N keys".
      return { data: { keyCount: 42 } };
    }
    if (typeof path === "string" && path.includes("projects/tags")) {
      // Existing project tags for the Settings → Add tags autocomplete.
      const search = String(opts?.params?.query?.search ?? "")
        .trim()
        .toLowerCase();
      const all = ["mobile", "web", "marketing", "v2", "draft", "legal"];
      const tags = (search
        ? all.filter((t) => t.includes(search))
        : all
      ).map((name, id) => ({ id, name }));
      return { data: { _embedded: { tags } } };
    }
    return { data: null, error: "mock: no backend" };
  },
  POST: async () => ({ data: null, error: "mock: no backend" }),
  PUT: async () => ({ data: null, error: "mock: no backend" }),
  DELETE: async () => ({ data: null, error: "mock: no backend" }),
};

export function makeNode(partial: Partial<NodeInfo> & { id: string }): NodeInfo {
  return {
    name: "",
    characters: "",
    translation: "",
    isPlural: false,
    key: "",
    ns: undefined,
    connected: false,
    visible: true,
    ...partial,
  };
}

/**
 * The full, *unfiltered* selection — what the Figma main thread would scan
 * before applying the ignore rules. Includes a numbers-only layer and an
 * `_`-prefixed layer so the ignore filters have something to act on. The
 * gallery runs these through the real `shouldIgnoreNode` (see `applyFilters`).
 */
export const allSampleNodes: NodeInfo[] = [
  makeNode({
    id: "n1",
    name: "Date label",
    characters: "Wednesday, June 12",
    key: "home.day",
    connected: false,
  }),
  makeNode({
    id: "n2",
    name: "Greeting",
    characters: "Hello, Alex",
    key: "home.intro",
    connected: false,
    isPlural: true,
  }),
  makeNode({
    id: "n3",
    name: "CTA",
    characters: "Get started",
    translation: "Get started",
    key: "home.cta",
    ns: "common",
    connected: true,
  }),
  // Numbers-only (incl. formatting) → hidden while "ignore numbers" is on
  // (default). Matches digits + spaces + . , + - so "1,234.00" counts too.
  makeNode({
    id: "n4",
    name: "Price",
    characters: "1,234.00",
    connected: false,
  }),
  // Layer name starts with the ignore prefix ("_") → hidden once "ignore
  // strings with prefix" is toggled on.
  makeNode({
    id: "n5",
    name: "_internal note",
    characters: "Do not translate",
    connected: false,
  }),
  // Two layers with identical text → each shows a "×2" duplicate badge.
  makeNode({ id: "n6", name: "CTA copy", characters: "Submit", connected: false }),
  makeNode({ id: "n7", name: "CTA copy 2", characters: "Submit", connected: false }),
  // Two layers with the SAME key but DIFFERENT text → push conflict warning.
  makeNode({ id: "n8", name: "Title A", characters: "Welcome", key: "page.title", connected: false }),
  makeNode({ id: "n9", name: "Title B", characters: "Hello there", key: "page.title", connected: false }),
  // Advanced (plural) CONNECTED string the user never edited — its stored ICU
  // Plural with NO stored sample params: the render-compare can't run reliably
  // (it would compare raw `{count, plural, …}` to "10 apples"), so the guard
  // SKIPS it — must NOT be flagged.
  makeNode({
    id: "n10",
    name: "Apples count",
    characters: "10 apples",
    translation: "{count, plural, one {# apple} other {# apples}}",
    pluralParamValue: "count",
    isPlural: true,
    key: "special.apples",
    connected: true,
  }),
  // Plain connected string edited directly in Figma: a normal "changed" push,
  // NOT a manual-change conflict → must NOT be flagged (advanced-only).
  makeNode({
    id: "n11",
    name: "Plain label",
    characters: "Edited in Figma",
    translation: "Saved label",
    key: "home.label",
    connected: true,
  }),
  // ADVANCED string WITH params edited directly in Figma: renders to "Hi, Alex"
  // but the canvas was overwritten → genuinely diverged → SHOULD be flagged.
  makeNode({
    id: "n12",
    name: "Greeting param",
    characters: "manually rewritten",
    translation: "Hi, {name}",
    paramsValues: { name: "Alex" },
    key: "home.greeting",
    connected: true,
  }),
  // Inline markup only (no params) → "Formatted" badge from the <b> tag alone.
  makeNode({
    id: "n15",
    name: "Rich label",
    characters: "Read the terms",
    translation: "Read the <b>terms</b>",
    key: "legal.terms",
    connected: true,
  }),
  // CONNECTED same-key conflict: two strings connected to one key but with
  // DIFFERENT Figma text. They share the Tolgee translation, so a translation
  // compare would miss it — the conflict must be detected on `characters`.
  makeNode({
    id: "n13",
    name: "Brown A",
    characters: "brown 111",
    translation: "brown",
    key: "generatedkey.brown",
    connected: true,
  }),
  makeNode({
    id: "n14",
    name: "Brown B",
    characters: "brown",
    translation: "brown",
    key: "generatedkey.brown",
    connected: true,
  }),
];

/**
 * Replicates the main thread's selection filtering: keep connected nodes
 * always, otherwise drop anything `shouldIgnoreNode` rejects under the current
 * config. NodeInfo carries the same `name`/`characters`/`visible` fields the
 * filter reads, so we can feed it straight in.
 */
function applyFilters(config: Partial<TolgeeConfig>): NodeInfo[] {
  return allSampleNodes.filter(
    (n) =>
      n.connected ||
      !shouldIgnoreNode(n as unknown as TextNode, null, config),
  );
}

/** Mirrors the screenshot: the post-filter view of the selection. */
export const sampleNodes: NodeInfo[] = allSampleNodes;

/** A single node for the node-scoped routes (Connect / String details). */
export const sampleNode: NodeInfo = sampleNodes[0];

/** A plural node (proper ICU plural translation) so the gallery can show the
 *  chip-based PluralEditor + locked Plural checkbox in String details. */
export const samplePluralNode: NodeInfo =
  allSampleNodes.find((n) => n.id === "n10") ?? sampleNodes[0];

// --- Selection scenarios for the gallery's "Empty states" demos -------------
// Index decides what to render from the selection store, so these flip it into
// each state the real plugin can be in. `hasUserSelection` is the second arg:
//   true  = the user has a Figma selection (a frame/layers)
//   false = nothing selected (Index falls back to page-connected nodes)

/** Normal demo: a real selection with translatable strings. */
export function showSampleSelection(): void {
  appState.setSelection(applyFilters(appState.value.config ?? {}), true);
}

/**
 * A selection exists (e.g. a frame) but it has no translatable strings — all
 * text was filtered out, or the frame holds no text. Index shows
 * "No translatable strings in your selection".
 */
export function showEmptySelection(): void {
  appState.setSelection([], true);
}

/**
 * Nothing selected at all and no connected nodes on the page. Index shows
 * "Select texts for translation". (In the gallery the page-node query never
 * resolves, so it stays empty — exactly the empty-page case.)
 */
export function showNoSelection(): void {
  appState.setSelection([], false);
}

// --- Project-feature scenarios ----------------------------------------------
// Flip branching / namespaces on the auth store (and seed branches) so the
// branch picker (header), namespace badges (rows), stale-branch banner (Index)
// and copy branch indicators become visible — none of which show under the
// default "simple" project.

const SAMPLE_BRANCHES = [{ name: "main", isDefault: true }, { name: "feature-x" }];

/** Default: no branching, no namespaces — the plain single-branch project. */
export function showSimpleProject(): void {
  auth.setProjectFeatures({
    branchingEnabled: false,
    namespacesEnabled: false,
    projectName: "Figma 2.0",
  });
  appState.setConfig({ ...(appState.value.config ?? {}), branch: "" });
}

/** Branching + namespaces enabled: header branch picker, row ns badges. */
export function showBranchingProject(): void {
  auth.setProjectFeatures({
    branchingEnabled: true,
    namespacesEnabled: true,
    projectName: "Figma 2.0",
  });
  auth.setBranches(SAMPLE_BRANCHES, "main", true);
  appState.setConfig({ ...(appState.value.config ?? {}), branch: "main" });
}

/** Branching enabled, but the CONFIGURED branch no longer exists on Tolgee →
 *  Index shows the "branch no longer exists" banner + a picker to recover. */
export function showStaleBranchProject(): void {
  auth.setProjectFeatures({
    branchingEnabled: true,
    namespacesEnabled: true,
    projectName: "Figma 2.0",
  });
  auth.setBranches(SAMPLE_BRANCHES, "main", true);
  appState.setConfig({ ...(appState.value.config ?? {}), branch: "old-release" });
}

let seeded = false;
export function seedMockData(): void {
  if (seeded) return;
  seeded = true;

  auth.setAuth({
    // biome-ignore lint/suspicious/noExplicitAny: mock stand-in for TolgeeClient
    client: mockClient as any,
    apiUrl: "https://app.tolgee.io",
    apiKey: "tgpak_demo",
    projectId: 1,
    scopes: ["translations.view", "translations.edit", "keys.edit", "keys.create"],
  });
  auth.setProjectFeatures({
    branchingEnabled: false,
    namespacesEnabled: false,
    projectName: "Figma 2.0",
  });
  auth.setLanguages([
    { tag: "en", name: "English" },
    { tag: "de", name: "German" },
    { tag: "fr", name: "French" },
    { tag: "cs", name: "Czech" },
  ]);
  auth.setNamespaces([{ name: "common" }, { name: "home" }]);

  const initialConfig: Partial<TolgeeConfig> = {
    language: "en",
    namespace: "",
    // Ignore-filter defaults so the demo shows real behaviour: numbers hidden
    // by default; a prefix is set but its toggle starts off.
    ignoreNumbers: true,
    ignoreHiddenLayers: true,
    ignoreTextLayers: false,
    ignorePrefix: "_",
    // Prefill key format on, so keyless unconnected rows get a generated key
    // (which must now PERSIST + reach push, like the old plugin).
    prefillKeyFormat: true,
    keyFormat: "generatedkey.{elementText}",
    variableCasing: "snake_case",
  };
  appState.setConfig(initialConfig);
  appState.setSelection(applyFilters(initialConfig), true);

  // Stand in for the Figma main thread: the UI's `send()` posts UI→main
  // messages to `parent` (== this window in the gallery). We mirror the two
  // main-thread paths the UI relies on so changes are actually reflected:
  //  • save-config → re-run the ignore filter and push the new selection back
  //    (like the real `save-config` → `emitSelection`).
  //  • set-nodes-data → merge the partial info onto the matching nodes and
  //    re-emit the selection (like the real handler), so bulk Connect /
  //    Disconnect / Edit key name visibly update the list.
  window.addEventListener("message", (event) => {
    const msg = event.data?.pluginMessage;
    if (!msg) return;
    if (msg.type === "save-config") {
      const merged = { ...(appState.value.config ?? {}), ...msg.config };
      appState.setConfig(merged);
      appState.setSelection(applyFilters(merged), true);
      return;
    }
    if (msg.type === "set-nodes-data" && Array.isArray(msg.nodes)) {
      for (const upd of msg.nodes) {
        const node = allSampleNodes.find((n) => n.id === upd.id);
        if (node) Object.assign(node, upd.info);
      }
      appState.setSelection(applyFilters(appState.value.config ?? {}), true);
    }
  });
}
