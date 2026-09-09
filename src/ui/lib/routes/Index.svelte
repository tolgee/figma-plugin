<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import type { NodeInfo, Route } from "$shared/types";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { ICON } from "$shared/iconSizes";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { fetchBranches, isConfiguredBranchMissing } from "$ui/lib/api/branches";
  import { hydrateBranches } from "$ui/lib/api/pickers";
  import {
    searchKeys,
    connectInfoFromKey,
    type KeySearchResult,
  } from "$ui/lib/api/keys";
  import { nsKeyIndex } from "$shared/keyIndex";
  import {
    type ConnectedKey,
    fetchMissingKeys,
    connectedKeySig,
    effectiveNs,
  } from "$ui/lib/api/keyExistence";
  import { hasManualChange } from "$ui/lib/logic/manualChange";
  import { conflictText, textOfNode } from "$ui/lib/logic/pushDiff";
  import { hasRichFormat } from "$ui/lib/logic/icuParams";
  import { collectNamespaceNames } from "$ui/lib/logic/namespaces";
  import { formatKey, keyFormatUsesParents } from "$shared/keyFormat";
  import { keyContextForNode, pendingPrefills } from "$ui/lib/logic/prefillKey";
  import { cancelNodeSave, queueNodeSave } from "$ui/lib/logic/saveQueue";
  import { runWithConcurrency } from "$ui/lib/logic/asyncPool";

  // Every bulk write below is the user's NEWER intent for its target rows —
  // drop any still-queued debounced inline edits for them so a later flush
  // can't overwrite the bulk result with stale values.
  function dropQueuedSaves(ids: { id: string }[]): void {
    for (const t of ids) cancelNodeSave(t.id);
  }
  import { resolveParentNames } from "$ui/lib/api/parentNames";
  import Header from "$ui/lib/components/domain/Header.svelte";
  import NodeList from "$ui/lib/components/domain/NodeList.svelte";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Card from "$ui/lib/components/ui/card.svelte";
  import Stat from "$ui/lib/components/ui/stat.svelte";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import NamespaceInput from "$ui/lib/components/ui/namespaceInput.svelte";
  import KeyFormatInput from "$ui/lib/components/ui/keyFormatInput.svelte";
  import SearchInput from "$ui/lib/components/ui/searchInput.svelte";
  import IconButton from "$ui/lib/components/ui/iconButton.svelte";
  import TooltipIconButton from "$ui/lib/components/ui/tooltipIconButton.svelte";
  import FilterChip from "$ui/lib/components/ui/filterChip.svelte";
  import Checkbox from "$ui/lib/components/ui/checkbox.svelte";
  import Message from "$ui/lib/components/ui/message.svelte";
  import EmptyState from "$ui/lib/components/ui/emptyState.svelte";
  import ProgressBar from "$ui/lib/components/ui/progressBar.svelte";
  import * as DropdownMenu from "$ui/lib/components/ui/dropdown-menu";
  import * as Dialog from "$ui/lib/components/ui/dialog";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import SyncButton from "$ui/lib/components/domain/SyncButton.svelte";
  import SearchX from "lucide-svelte/icons/search-x";
  import ListFilter from "lucide-svelte/icons/list-filter";
  import Info from "lucide-svelte/icons/info";
  import Meh from "lucide-svelte/icons/meh";
  import Group from "lucide-svelte/icons/group";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Link2 from "lucide-svelte/icons/link-2";
  import Link2Off from "lucide-svelte/icons/link-2-off";
  import Pencil from "lucide-svelte/icons/pencil";
  import Eraser from "lucide-svelte/icons/eraser";
  import Wand from "lucide-svelte/icons/wand";
  import Tag from "lucide-svelte/icons/tag";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import RefreshCw from "lucide-svelte/icons/refresh-cw";
  import X from "lucide-svelte/icons/x";

  const selectedNodes = $derived(appState.value.selectedNodes);
  // Use the explicit "user selected something" flag, NOT selectedNodes.length:
  // the main thread filters ignored nodes out of the selection, so a real
  // selection can legitimately arrive empty (everything ignored / a text-less
  // frame). Relying on length here would misread those as "no selection".
  const hasSelection = $derived(appState.value.hasUserSelection);

  // Any large `set-nodes-data` write currently in flight (bulk actions,
  // auto-connect, or the save queue's prefill/regen flush) — drives the top
  // progress bar and the busy state of the bulk action bar below.
  const writeProgress = $derived(appState.value.writeProgress);
  const writing = $derived(writeProgress !== null);

  const branchesQuery = createQuery(() => ({
    queryKey: ["branches"],
    queryFn: () => fetchBranches(auth.value.client!),
    enabled: auth.value.authenticated && auth.value.branchingEnabled,
    staleTime: 30 * 1000,
  }));

  // Index is purely selection-driven: we show ONLY the nodes in the user's
  // selection. We deliberately do NOT scan the whole page when nothing is
  // selected — on large files that full scan is a noticeable hit, and silently
  // listing the entire document is rarely what the user wants. No selection →
  // empty state prompting them to pick something. (Page-wide work still exists
  // for the explicit Download/Pull flow, which scans on demand.)
  const nodesToShow = $derived(hasSelection ? selectedNodes : []);

  // ---- Scan loader -----------------------------------------------------------
  // Shown only while the main thread is scanning a new selection AND the scan
  // has taken long enough to be worth signalling (the store delays the flag —
  // see `setScanning`), so ordinary clicks never flash the overlay. The list
  // render itself needs no loader anymore: `NodeList` windows large lists, so
  // first render is cheap regardless of selection size.
  const preparing = $derived(appState.value.scanning);

  // ---- Key prefill -----------------------------------------------------------
  // Apply-and-persist the format-generated key for fresh, key-less unconnected
  // strings — decided HERE, once per node per session (see `pendingPrefills`),
  // not in the rows: the virtualized list re-mounts rows on scroll, so a
  // row-level decision re-applied prefills the user had explicitly cleared.
  // The whole selection lands in the shared save queue as ONE batched write.
  $effect(() => {
    const prefills = pendingPrefills(appState.value.selectedNodes, appState.value.config);
    for (const p of prefills) {
      // `prefilledKey` marks this as an auto value so turning prefill off later
      // clears only untouched auto keys (see `clearPrefilledKeys`); it always
      // equals `key` at write time and re-syncs on every format regeneration.
      queueNodeSave(p.id, { key: p.key, ns: p.ns, connected: false, prefilledKey: p.key });
    }
  });

  // ---- Search & filter -----------------------------------------------------
  let query = $state("");
  // Local-only view filters (not persisted). Two independent axes that AND
  // together (plus the separate, persisted IGNORE rules):
  //   • connection — connected / not connected (or all)
  //   • showOnly   — narrow to ONE subset (plural / formatted / same string /
  //                  same key conflict); single-select keeps the result obvious.
  let connection = $state<"all" | "connected" | "unconnected" | "missing">("all");
  let showOnly = $state<
    null | "plural" | "formatted" | "sameString" | "sameKey"
  >(null);
  function toggleShowOnly(v: NonNullable<typeof showOnly>): void {
    showOnly = showOnly === v ? null : v;
  }
  const SHOW_ONLY_LABELS: Record<NonNullable<typeof showOnly>, string> = {
    plural: "plural",
    formatted: "formatted",
    sameString: "same string",
    sameKey: "same key conflict",
  };
  // Multi-select namespace filter (this session only): show only strings whose
  // namespace is in the set. Empty set = no namespace filter. "" = "<none>".
  let nsFilter = $state<Set<string>>(new Set());
  function toggleNsFilter(ns: string): void {
    const next = new Set(nsFilter);
    if (next.has(ns)) next.delete(ns);
    else next.add(ns);
    nsFilter = next;
  }
  // Namespace options for the filter: "<none>" + every project namespace.
  const nsFilterOptions = $derived([
    { value: "", label: "<none>" },
    ...auth.value.namespaces.map((n) => ({ value: n.name, label: n.name })),
  ]);
  // Exact filters applied by clicking a row marker — each narrows the list to a
  // precise set and shows as a removable chip, independent of the fuzzy search:
  //   • keyFilter  — conflict-warning click → every string on that exact key
  //   • textFilter — duplicate-badge click  → every string with that exact text
  let keyFilter = $state<{ ns: string | undefined; key: string } | null>(null);
  let textFilter = $state<string | null>(null);
  function filterByKey(n: NodeInfo): void {
    keyFilter = { ns: n.ns, key: n.key };
    textFilter = null;
    query = ""; // focus purely on the conflicting key
  }
  function filterByText(n: NodeInfo): void {
    textFilter = (n.characters ?? "").trim();
    keyFilter = null;
    query = ""; // focus purely on the identical strings
  }

  // The filter dot signals the list is being narrowed by a VIEW filter. Ignore
  // rules are deliberately excluded — they live in Settings, are static, and
  // shouldn't light up the dot on every session.
  const filterActive = $derived(
    connection !== "all" || showOnly !== null || nsFilter.size > 0,
  );

  // Local view filters (this session only). "Clear filters" resets just these.
  const anyViewFilter = $derived(
    connection !== "all" || showOnly !== null || nsFilter.size > 0,
  );
  function clearViewFilters(): void {
    connection = "all";
    showOnly = null;
    nsFilter = new Set();
  }

  // ---- Selection stats -------------------------------------------------------
  // Every O(n) aggregation over the shown nodes, fused into one two-pass
  // computation (used to be ~10 separate $derived blocks) and DEFERRED one
  // frame behind the list: rows paint first, the counts/badges tick in right
  // after. The stats decorate (filter counts, banner, badges) — nothing the
  // user is waiting on — so they don't belong in the same synchronous frame
  // as the list render.
  //
  // Conflict semantics (unchanged): `conflictText` compares PLAIN strings by
  // canvas text and ADVANCED strings (plural / params / markup) by the shared
  // Tolgee ICU, so genuine plural variants are not flagged — mirrors pushDiff,
  // so the list and the Push screen agree.
  function computeStats(nodes: NodeInfo[]) {
    const dupCounts = new Map<string, number>();
    const firstTextByKey = new Map<string, string>();
    const totalByKey = new Map<string, number>();
    const conflictedKeys = new Set<string>();
    const keys: { name: string; ns: string | undefined }[] = [];
    let connected = 0;
    let plural = 0;
    let formatted = 0;

    for (const n of nodes) {
      if (n.connected) {
        connected++;
        if (n.key) keys.push({ name: n.key, ns: n.ns });
      }
      if (n.isPlural) plural++;
      if (hasRichFormat(n)) formatted++;
      const text = (n.characters ?? "").trim();
      if (text) dupCounts.set(text, (dupCounts.get(text) ?? 0) + 1);
      const k = (n.key ?? "").trim();
      if (k) {
        const id = `${n.ns ?? ""} ${k}`;
        totalByKey.set(id, (totalByKey.get(id) ?? 0) + 1);
        const t = conflictText(n).trim();
        const seen = firstTextByKey.get(id);
        if (seen === undefined) firstTextByKey.set(id, t);
        else if (seen !== t) conflictedKeys.add(id);
      }
    }

    // Conflicting keys -> how many strings share them (drives the row badge).
    const conflicts = new Map<string, number>();
    let conflictRows = 0;
    for (const id of conflictedKeys) {
      const total = totalByKey.get(id) ?? 0;
      conflicts.set(id, total);
      conflictRows += total;
    }

    // Second pass for aggregates that need the completed maps: duplicate-group
    // row count and the banner labels (in first-appearance order).
    let duplicateRows = 0;
    const labelSeen = new Set<string>();
    const labels: string[] = [];
    for (const n of nodes) {
      if ((dupCounts.get((n.characters ?? "").trim()) ?? 0) > 1) duplicateRows++;
      const k = (n.key ?? "").trim();
      if (!k) continue;
      const id = `${n.ns ?? ""} ${k}`;
      if (conflicts.has(id) && !labelSeen.has(id)) {
        labelSeen.add(id);
        labels.push(n.ns ? `${n.ns}.${k}` : k);
      }
    }

    return {
      connectedNodeCount: connected,
      unconnectedCount: nodes.length - connected,
      pluralCount: plural,
      formattedCount: formatted,
      duplicateCounts: dupCounts,
      duplicateNodeCount: duplicateRows,
      conflictCounts: conflicts,
      conflictKeyLabels: labels,
      conflictNodeCount: conflictRows,
      connectedKeys: keys,
      connectedKeySignature: keys
        .map((k) => connectedKeySig(k.ns, k.name))
        .sort()
        .join(","),
    };
  }

  type SelectionStats = ReturnType<typeof computeStats>;
  const EMPTY_STATS: SelectionStats = {
    connectedNodeCount: 0,
    unconnectedCount: 0,
    pluralCount: 0,
    formattedCount: 0,
    duplicateCounts: new Map(),
    duplicateNodeCount: 0,
    conflictCounts: new Map(),
    conflictKeyLabels: [],
    conflictNodeCount: 0,
    connectedKeys: [],
    connectedKeySignature: "",
  };

  // `$state.raw` + rAF: replaced wholesale after the next paint. Re-running
  // the effect (new selection / patch) cancels a not-yet-fired computation,
  // so bursts coalesce to the latest snapshot.
  let stats = $state.raw<SelectionStats>(EMPTY_STATS);
  $effect(() => {
    const nodes = nodesToShow;
    const raf = requestAnimationFrame(() => {
      stats = computeStats(nodes);
    });
    return () => cancelAnimationFrame(raf);
  });


  // ---- Stale-link detection ------------------------------------------------
  // Verify the connected keys currently shown still exist in Tolgee (a user may
  // have deleted the key on the web). Selection-driven — only what's on screen —
  // and cached by the exact key set, so reselecting the same nodes never
  // refetches. The check itself is cheap: see `fetchMissingKeys`.
  const branch = $derived(
    auth.value.branchingEnabled ? (appState.value.config?.branch ?? "") : "",
  );
  // Debounced snapshot of the connected-key set for the existence check.
  // Connecting/disconnecting keys one by one changes the raw signature on
  // every step, and since it sits in the query key that meant a refetch per
  // click. Snapshotting keys + signature together keeps them consistent.
  // `ConnectedKey`, not a structurally similar shape: its `ns` is REQUIRED but
  // nullable, and an optional `ns?` isn't assignable to that. Same values at
  // runtime — `connectedKeySig` normalises undefined and "" to one signature —
  // so this is about the two declarations agreeing, not about behaviour.
  let checkedKeys = $state<{ keys: ConnectedKey[]; signature: string }>({
    keys: [],
    signature: "",
  });
  $effect(() => {
    const signature = stats.connectedKeySignature;
    const keys = stats.connectedKeys;
    if (signature === checkedKeys.signature) return;
    const timer = setTimeout(() => (checkedKeys = { keys, signature }), 500);
    return () => clearTimeout(timer);
  });
  const missingKeysQuery = createQuery(() => ({
    // The namespaces flag is part of the key: it changes how the check
    // normalises `ns` (see `effectiveNs`), so a flip must refetch.
    queryKey: [
      "connected-keys-existence",
      checkedKeys.signature,
      branch,
      auth.value.namespacesEnabled,
    ],
    queryFn: () =>
      fetchMissingKeys(
        auth.value.client!,
        checkedKeys.keys,
        branch,
        appState.value.config?.language,
        auth.value.namespacesEnabled,
      ),
    enabled: auth.value.authenticated && checkedKeys.keys.length > 0,
    // Keep showing the previous result while the re-keyed query loads, so the
    // stale-link markers don't blink out on every connect.
    placeholderData: (prev: Set<string> | undefined) => prev,
    // Warm window so a key deleted in Tolgee still shows up reasonably quickly,
    // but window-focus flapping (switching to the Tolgee tab and back) doesn't
    // re-hit the API every time. `refetchOnWindowFocus` below still exists for
    // the "actually came back after a while" case — don't remove it.
    staleTime: 45 * 1000,
    // Re-check when the user returns to the plugin (e.g. after deleting a key in
    // the Tolgee web app) or reopens it — otherwise a stale "all present" result
    // would hide a fresh deletion.
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  }));
  const EMPTY_MISSING: ReadonlySet<string> = new Set();
  const missingKeys = $derived(missingKeysQuery.data ?? EMPTY_MISSING);
  // Connected, but the linked key no longer exists in Tolgee (stale link).
  // Lookup sig must use the same ns normalisation the fetch used.
  const isKeyMissing = (n: NodeInfo): boolean =>
    n.connected &&
    !!n.key &&
    missingKeys.has(
      connectedKeySig(effectiveNs(n.ns, auth.value.namespacesEnabled), n.key),
    );
  const missingKeyCount = $derived(nodesToShow.filter(isKeyMissing).length);

  const filteredNodes = $derived.by(() => {
    const q = query.trim().toLowerCase();
    return nodesToShow.filter((n) => {
      // Connection axis.
      if (connection === "connected" && !n.connected) return false;
      if (connection === "unconnected" && n.connected) return false;
      if (connection === "missing" && !isKeyMissing(n)) return false;
      // Namespace axis (multi-select) — "" matches the "<none>" namespace.
      if (nsFilter.size > 0 && !nsFilter.has(n.ns ?? "")) return false;
      // "Show only" — narrow to the one chosen subset.
      if (showOnly) {
        const text = (n.characters ?? "").trim();
        const k = (n.key ?? "").trim();
        const inSet =
          showOnly === "plural"
            ? !!n.isPlural
            : showOnly === "formatted"
              ? hasRichFormat(n)
              : showOnly === "sameString"
                ? (stats.duplicateCounts.get(text) ?? 0) > 1
                : showOnly === "sameKey"
                  ? k !== "" && stats.conflictCounts.has(`${n.ns ?? ""} ${k}`)
                  : true;
        if (!inSet) return false;
      }
      // Exact matches (not substring) — the marker filters must show ONLY the
      // precise set (same key / same text), never fuzzy matches.
      if (keyFilter && !(n.key === keyFilter.key && n.ns === keyFilter.ns))
        return false;
      if (textFilter !== null && (n.characters ?? "").trim() !== textFilter)
        return false;
      if (q) {
        const key = (n.ns ? `${n.ns}.${n.key}` : n.key).toLowerCase();
        if (!key.includes(q) && !(n.characters ?? "").toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  });

  const total = $derived(nodesToShow.length);
  const shown = $derived(filteredNodes.length);

  // How many nodes in the WHOLE selection share each (trimmed) source string,
  // so list rows can flag duplicates with a count badge. Pure frontend — a
  // single pass over the already-loaded selection, no main-thread cost.

  // Manual-change flag (advanced string edited directly in Figma) for a
  // single row. Evaluated per VISIBLE row by the windowed list — the ICU
  // render inside is the priciest per-node work this screen does, and a
  // precomputed whole-selection map paid it for all N nodes on every
  // selection arrival and Index re-mount just to flag ~13 rendered rows.
  // Memoised underneath (`translationDiffersFromNodeCached`), so scrolling
  // back over a row is free.
  function manualChangeFor(n: NodeInfo): boolean {
    return hasManualChange(n, appState.value.config?.language ?? "en");
  }

  // ---- Bulk selection ------------------------------------------------------
  // Row checkboxes are ALWAYS visible; "selection" is simply whichever rows are
  // ticked. When ≥1 is selected the footer turns into a contextual action bar.
  // All frontend: a Set of ids + a few $derived flags. The only main-thread hit
  // is applying an operation — a SINGLE batched `set-nodes-data` (not per node).
  let selectedIds = $state<Set<string>>(new Set());

  // Everything the action bar needs about the selection, derived in ONE pass
  // over the displayed rows (instead of a separate every/some/filter/map per
  // value). Scoped to what's currently DISPLAYED (after search/filter), so the
  // count and every bulk op act on "shown ∩ selected", matching "5 / 5".
  //   - list / count        : the selected, visible nodes
  //   - connectedCount      : how many of them are connected (Disconnect target)
  //   - sameString          : are all selected strings identical (gates Connect
  //                           to key / Edit key name)
  //   - all / someVisible   : select-all checkbox checked / indeterminate
  const selection = $derived.by(() => {
    const list: NodeInfo[] = [];
    let connectedCount = 0;
    let clearableCount = 0;
    let firstText: string | null = null;
    let sameString = true;
    // Same-text check among ONLY the unconnected rows — "Connect to key" maps
    // those to one key and skips already-connected ones, so their texts (not the
    // connected ones') must match.
    let firstUnconnectedText: string | null = null;
    let unconnectedSameString = true;
    for (const n of filteredNodes) {
      if (!selectedIds.has(n.id)) continue;
      list.push(n);
      const text = (n.characters ?? "").trim();
      if (n.connected) connectedCount++;
      else {
        // Unconnected node: track same-text for bulk connect; and whether it
        // has a key to clear (incl. a persisted prefill).
        if (firstUnconnectedText === null) firstUnconnectedText = text;
        else if (text !== firstUnconnectedText) unconnectedSameString = false;
        if ((n.key ?? "").trim()) clearableCount++;
      }
      if (firstText === null) firstText = text;
      else if (text !== firstText) sameString = false;
    }
    return {
      list,
      count: list.length,
      connectedCount,
      clearableCount,
      sameString: list.length > 0 && sameString,
      // ≥1 unconnected row AND they all share the same text.
      connectableSameText: firstUnconnectedText !== null && unconnectedSameString,
      allVisible: shown > 0 && list.length === shown,
      someVisible: list.length > 0,
    };
  });
  const selectedNodesList = $derived(selection.list);
  const selectedCount = $derived(selection.count);
  const connectedSelectedCount = $derived(selection.connectedCount);
  const clearableSelectedCount = $derived(selection.clearableCount);
  // Unconnected selected strings → eligible for "Generate key names".
  const generatableCount = $derived(selection.count - selection.connectedCount);
  // Unconnected rows share one text → "Connect to key" can map them to one key.
  const connectableSameText = $derived(selection.connectableSameText);
  const allVisibleSelected = $derived(selection.allVisible);
  const someVisibleSelected = $derived(selection.someVisible);

  // "Edit key name" / "Generate key names" open an inline input in the action
  // bar (same input + OK system) instead of navigating away. `createKeyMode`
  // types a literal key applied to all; `generateMode` types the FORMAT template,
  // applied per node (each gets its own key from its own text).
  let createKeyMode = $state(false);
  let generateMode = $state(false);
  // Bulk re-assign the namespace of selected unconnected keys — the "Default
  // namespace" only seeds NEW keys, so this is how you change existing ones.
  let setNamespaceMode = $state(false);
  // "Auto-connect by exact match" scope picker (shown as a second select once the
  // action is chosen, when the project uses namespaces).
  let connectExactMode = $state(false);
  let connectScope = $state<"namespace" | "all">("namespace");
  const connectScopeOptions = [
    { value: "namespace", label: "in same namespace" },
    { value: "all", label: "in any namespace" },
  ];
  let newKeyName = $state("");
  let templateInput = $state("");
  // Namespace applied to the keys created/generated by the bulk action, seeded
  // with the configured default when a mode opens. "" = the "<none>" default.
  let bulkNamespace = $state("");
  // Reset the inline inputs whenever the selection empties out.
  $effect(() => {
    if (
      selectedCount === 0 &&
      (createKeyMode || generateMode || setNamespaceMode || connectExactMode)
    ) {
      createKeyMode = false;
      generateMode = false;
      setNamespaceMode = false;
      connectExactMode = false;
      newKeyName = "";
      templateInput = "";
    }
  });

  function toggleMaster(): void {
    if (allVisibleSelected) selectedIds = new Set();
    else selectedIds = new Set(filteredNodes.map((n) => n.id));
  }
  function clearSelection(): void {
    selectedIds = new Set();
  }
  function cancelSelection(): void {
    createKeyMode = false;
    generateMode = false;
    setNamespaceMode = false;
    connectExactMode = false;
    newKeyName = "";
    templateInput = "";
    selectedIds = new Set();
  }
  function toggleOne(id: string): void {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedIds = next;
  }

  // ---- "Auto-connect by exact match" ---------------------------------------
  // Finds, for each unconnected selected string, a Tolgee key whose text EXACTLY
  // matches it — then PREVIEWS the outcome and only connects on confirm (nothing
  // is applied until the user clicks Connect, so Cancel is a true cancel). No
  // match → skipped & listed; multiple matches → skipped & listed (never guess —
  // resolve in Connect, where exact match shows on top).
  let matchOpen = $state(false);
  let matching = $state(false);
  let matchCancelled = $state(false);
  let matchProgress = $state({ done: 0, total: 0 });
  let matchResult = $state<{
    willConnect: number;
    notConnected: { text: string; ns: string; hint: string }[];
  } | null>(null);
  // Matches awaiting the user's confirm (applied by `applyMatches`).
  let pendingMatches: { node: NodeInfo; r: KeySearchResult }[] = [];

  // Decline / abort — nothing has been applied yet, so just close (and stop the
  // search loop if it's still running).
  function cancelMatch(): void {
    matchCancelled = true;
    matchOpen = false;
    matchResult = null;
    pendingMatches = [];
  }

  // Closing via Esc/overlay bypasses the Cancel button — route it through the
  // same teardown so the search loop actually stops instead of running on
  // with a closed dialog. `open` is passed explicitly (not `bind:open`) so
  // this only fires on the dialog's OWN interactions, never when our code
  // sets `matchOpen` directly (e.g. the Cancel/Connect handlers above).
  function handleMatchOpenChange(open: boolean): void {
    matchOpen = open;
    if (!open) cancelMatch();
  }

  // Confirm — apply the previewed matches in one batched message, then close.
  function applyMatches(): void {
    if (pendingMatches.length > 0) {
      dropQueuedSaves(pendingMatches.map(({ node }) => node));
      send({
        type: "set-nodes-data",
        correlationId: nextCorrelationId(),
        nodes: pendingMatches.map(({ node, r }) => ({
          id: node.id,
          info: connectInfoFromKey(r, node, appState.value.config?.language ?? "en"),
        })),
      });
    }
    matchOpen = false;
    matchResult = null;
    pendingMatches = [];
    clearSelection();
  }

  // Entry from the operation menu. With namespaces, reveal the scope picker (a
  // second select) and let the user confirm; without, just run across all.
  function startConnectExact(): void {
    if (auth.value.namespacesEnabled) {
      createKeyMode = false;
      generateMode = false;
      setNamespaceMode = false;
      connectScope = "namespace";
      connectExactMode = true;
    } else {
      void bulkConnectExact("all");
    }
  }
  function runConnectExact(): void {
    connectExactMode = false;
    void bulkConnectExact(connectScope);
  }

  // `scope`:
  //   • "namespace" — only match a key in the SAME namespace as the string
  //     (each string's own `ns`), so a text that exists in several namespaces
  //     resolves to the one you meant.
  //   • "all" — match across every namespace (adopting the found key's ns);
  //     ambiguous when the text exists in more than one.
  async function bulkConnectExact(scope: "namespace" | "all"): Promise<void> {
    const client = auth.value.client;
    if (!client) return;
    const lang = appState.value.config?.language;

    // Dedup the unconnected selection → one search per group. In "all" scope the
    // group is the text; in "namespace" scope also the namespace, so identical
    // text in different namespaces resolves to its own key.
    const groups = new Map<string, { text: string; ns: string; nodes: NodeInfo[] }>();
    for (const n of selectedNodesList) {
      if (n.connected) continue;
      // Match on the AUTHORITATIVE text: a plural / advanced string resolves to
      // its ICU (what Tolgee stores as the source), a plain string to its
      // rendered canvas text — so advanced strings can auto-connect too, not
      // just plain ones. Same `textOfNode` the Connect prefill and Push use.
      const t = textOfNode(n).trim();
      if (!t) continue;
      const ns = n.ns ?? "";
      const gk = scope === "namespace" ? `${ns}\0${t}` : t;
      const g = groups.get(gk);
      if (g) g.nodes.push(n);
      else groups.set(gk, { text: t, ns, nodes: [n] });
    }
    if (groups.size === 0) return;

    matchResult = null;
    matchCancelled = false;
    matchProgress = { done: 0, total: groups.size };
    matching = true;
    matchOpen = true;

    const matches: { node: NodeInfo; r: KeySearchResult }[] = [];
    const notConnected: { text: string; ns: string; hint: string }[] = [];
    const groupList = Array.from(groups.values());

    // Up to 5 searches in flight at once instead of one at a time — a
    // selection with thousands of unconnected strings could otherwise take
    // minutes (one request round-trip per group, back to back). `matches`/
    // `notConnected` are plain arrays, not `$state`, and JS is single-
    // threaded, so concurrent pushes from different workers never race.
    const AUTO_CONNECT_CONCURRENCY = 5;
    await runWithConcurrency(groupList, AUTO_CONNECT_CONCURRENCY, async ({ text, ns, nodes }) => {
      // Cancelled mid-run (taking too long, or user backed out) → don't
      // start new searches. In-flight ones (up to the concurrency limit)
      // still finish, but everything gets discarded below regardless.
      if (matchCancelled) return;
      const v = text.toLowerCase();
      let exact: KeySearchResult[] = [];
      try {
        const res = await searchKeys(client, text, lang, 20, branch);
        exact = res.filter(
          (r) =>
            [r.translation, r.baseTranslation, r.name].some(
              (c) => (c ?? "").trim().toLowerCase() === v,
            ) &&
            // "namespace" scope → only keys in this string's own namespace.
            (scope === "all" || (r.namespace ?? "") === ns),
        );
      } catch {
        // network/search error → treat as no match
      }
      const only = exact.length === 1 ? exact[0] : undefined;
      if (only) {
        for (const n of nodes) matches.push({ node: n, r: only });
      } else if (exact.length === 0) {
        notConnected.push({
          text,
          ns,
          hint: "No exact match in Tolgee — create the key or connect it manually.",
        });
      } else {
        notConnected.push({
          text,
          ns,
          hint: "Several keys match this text exactly — open Connect to pick one.",
        });
      }
      matchProgress = { done: matchProgress.done + 1, total: groupList.length };
    });

    // Aborted → discard (the dialog is already closed by cancelMatch).
    if (matchCancelled) {
      matching = false;
      return;
    }

    // Show the preview; nothing is applied until the user confirms.
    pendingMatches = matches;
    matching = false;
    matchResult = { willConnect: matches.length, notConnected };
  }

  // Connect only the UNCONNECTED selected strings to the chosen key — already
  // connected rows keep their mapping. The connect view's `node` (prefill +
  // connect buttons) is the first unconnected one, so they're never shown as
  // already-connected.
  function bulkConnect(): void {
    const unconnected = selectedNodesList.filter((n) => !n.connected);
    const first = unconnected[0];
    if (!first) return;
    appState.navigate({
      name: "connect",
      node: first,
      bulkNodes: unconnected,
    });
  }
  function bulkDisconnect(): void {
    const connected = selectedNodesList.filter((n) => n.connected);
    if (connected.length === 0) return;
    dropQueuedSaves(connected);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: connected.map((n) => ({
        id: n.id,
        // "" (not undefined) to actually CLEAR the namespace — undefined is
        // dropped by the bus's JSON round-trip, leaving the old ns behind.
        info: { key: "", ns: "", connected: false },
      })),
    });
    clearSelection();
  }
  // Clear the key name of selected UNCONNECTED strings (those that have one,
  // incl. a persisted prefill). A manual clear, so the prefill won't re-apply
  // until the row remounts (matches the in-row delete behaviour).
  function bulkClearKey(): void {
    const targets = selectedNodesList.filter(
      (n) => !n.connected && (n.key ?? "").trim(),
    );
    if (targets.length === 0) return;
    dropQueuedSaves(targets);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((n) => ({
        id: n.id,
        info: { key: "", connected: false },
      })),
    });
    cancelSelection();
  }
  // Open the inline template input for "Generate key names". Pre-fill it with
  // the configured key-format template, or `{elementName}` when none is set, so
  // the user can review / tweak the template before applying. OK runs
  // `bulkGenerateApply`.
  function enterGenerateMode(): void {
    templateInput = appState.value.config?.keyFormat?.trim() || "{elementName}";
    createKeyMode = false;
    generateMode = true;
  }
  // Apply the typed FORMAT template to every selected UNCONNECTED string,
  // generating each key from its own text/name via the shared `formatKey` rule
  // (the same primitive the in-row prefill uses). Persists so the keys count
  // toward push; connected strings are left untouched; empty results skipped.
  async function bulkGenerateApply(): Promise<void> {
    const template = templateInput.trim();
    if (!template) return;
    const casing = appState.value.config?.variableCasing;
    let nodes = selectedNodesList.filter((n) => !n.connected);
    // Parent placeholders ({component}/{frame}/…) are only pre-resolved on the
    // node when the SAVED format uses them. This template is user-editable, so
    // if it references one, resolve it fresh for these nodes right now — one
    // round-trip, and only when the template actually needs it (a plain
    // `test.log-in` or `{elementName}` skips it entirely).
    if (keyFormatUsesParents(template)) {
      const parents = await resolveParentNames(nodes.map((n) => n.id));
      nodes = nodes.map((n) => ({ ...n, ...parents[n.id] }));
    }
    // Key-name op only: keep each node's namespace, defaulting to the configured
    // default for nodes without one. Namespace is changed via "Set namespace".
    const defaultNs = appState.value.config?.namespace ?? "";
    const targets = nodes
      .map((n) => ({
        // Same context builder as the in-row prefill so both stay consistent.
        id: n.id,
        key: formatKey(template, keyContextForNode(n), casing),
        ns: n.ns ?? defaultNs,
      }))
      .filter((t) => t.key);
    if (targets.length === 0) return;
    dropQueuedSaves(targets);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((t) => ({
        id: t.id,
        info: { key: t.key, ns: t.ns, connected: false },
      })),
    });
    cancelSelection();
  }

  // Write the typed name into every selected string's `key` field — fills an
  // empty key or overwrites an existing one. Marks them as local keys
  // (connected:false, created on push) and applies the chosen namespace ("" =
  // the "<none>" default).
  function bulkSetKeyName(): void {
    const name = newKeyName.trim();
    // Only UNCONNECTED strings — writing a key with connected:false to a
    // connected node would silently DISCONNECT it. Connected keys keep their
    // Tolgee link; change them via Connect / Disconnect instead.
    const targets = selectedNodesList.filter((n) => !n.connected);
    if (!name || targets.length === 0) return;
    // Key-name op only: keep each node's namespace (default for those without
    // one). Namespace is changed via the dedicated "Set namespace" action.
    const defaultNs = appState.value.config?.namespace ?? "";
    dropQueuedSaves(targets);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((n) => ({
        id: n.id,
        info: { key: name, ns: n.ns ?? defaultNs, connected: false },
      })),
    });
    cancelSelection();
  }

  // Open the bulk "Set namespace" input, seeded with the configured default.
  function enterSetNamespaceMode(): void {
    bulkNamespace = appState.value.config?.namespace ?? "";
    createKeyMode = false;
    generateMode = false;
    setNamespaceMode = true;
  }
  // Re-assign the namespace of every selected UNCONNECTED key. Connected keys
  // are left untouched — their namespace is owned by Tolgee, not editable here.
  function bulkSetNamespace(): void {
    const targets = selectedNodesList.filter((n) => !n.connected);
    if (targets.length === 0) return;
    const ns = bulkNamespace.trim();
    dropQueuedSaves(targets);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: targets.map((n) => ({
        id: n.id,
        info: { key: n.key ?? "", ns, connected: false },
      })),
    });
    cancelSelection();
  }

  const languageOptions = $derived(
    auth.value.languages.map((l) => ({ value: l.tag, label: l.name })),
  );
  // Namespaces for the bulk "Set namespace" picker: server ones + any used
  // locally (incl. just-created, not-yet-pushed) + the default. Lets a namespace
  // created a moment ago reappear as a suggestion.
  const namespaceNames = $derived(
    collectNamespaceNames(
      auth.value.namespaces,
      appState.value.selectedNodes,
      appState.value.config?.namespace,
    ),
  );
  const branchOptions = $derived(
    (branchesQuery.data ?? []).map((b) => ({ value: b.name, label: b.name })),
  );

  // ---- Missing-branch warning ----------------------------------------------
  // The configured branch was deleted in Tolgee (same warning the original
  // plugin shows on Index) — without a re-pick, every API call silently
  // targets a nonexistent branch. Gated on `branchesLoaded` so a pending or
  // failed branch fetch never fires a false positive.
  const configuredBranch = $derived(
    auth.value.branchingEnabled ? (appState.value.config?.branch ?? "") : "",
  );
  const branchMissing = $derived(
    auth.value.authenticated &&
      isConfiguredBranchMissing(
        configuredBranch,
        auth.value.branches,
        auth.value.branchesLoaded,
      ),
  );
  // Existing branches to re-pick from (from the hydrated store, the same list
  // the missing check trusts). The deleted branch is by definition not in it.
  const repickBranchOptions = $derived(
    auth.value.branches.map((b) => ({ value: b.name, label: b.name })),
  );
  // Persist the newly picked branch the same way the Header picker does —
  // `set-branch` writes the config and echoes `config-changed` back, which
  // clears the warning.
  function handleBranchRepick(v: string): void {
    if (!v) return;
    send({ type: "set-branch", branch: v });
  }
  let refreshingBranches = $state(false);
  // Re-fetch the branch list (the branch may have been restored / renamed in
  // Tolgee) — refreshes both the hydrated store (drives this warning) and the
  // header's query-backed picker.
  async function refreshBranches(): Promise<void> {
    const client = auth.value.client;
    if (!client || refreshingBranches) return;
    refreshingBranches = true;
    try {
      await Promise.all([hydrateBranches(client), branchesQuery.refetch()]);
    } finally {
      refreshingBranches = false;
    }
  }

  function go(route: Route): void {
    appState.navigate(route);
  }
</script>

<Tooltip.Provider delayDuration={0} disableHoverableContent>
<div class="relative flex h-full flex-col">
  <!-- Select-all / none master checkbox — shared by the count bar and the
       footer action bar so the two never drift. -->
  {#snippet masterCheckbox()}
    <button
      type="button"
      aria-label="Select all / none"
      onclick={toggleMaster}
      class="rounded-sm focus:outline-none"
    >
      <Checkbox
        checked={allVisibleSelected}
        indeterminate={someVisibleSelected && !allVisibleSelected}
      />
    </button>
  {/snippet}

  <!-- A single-select filter row: radio dot + label + optional count. The
       radio shape (vs the IGNORE checkboxes) signals "pick one". -->
  {#snippet radioItem(
    active: boolean,
    label: string,
    count: number | null,
    onSelect: () => void,
  )}
    <DropdownMenu.Item closeOnSelect={false} {onSelect}>
      <span
        class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border {active
          ? 'border-checkbox'
          : 'border-border'}"
      >
        {#if active}
          <span class="h-1.5 w-1.5 rounded-full bg-checkbox"></span>
        {/if}
      </span>
      <span class="flex-1">{label}</span>
      {#if count !== null}
        <span class="tabular-nums text-text-secondary">{count}</span>
      {/if}
    </DropdownMenu.Item>
  {/snippet}

  <!-- Sticky, non-scrolling header area. Wraps the title/language row plus —
       while a selection is active — the search/filter row and the count row,
       so the top-to-bottom gradient reads as ONE continuous transition
       instead of separate gradients stacked per row (which banded/striped). -->
  <div
    class="sticky top-0 z-10 border-b border-border bg-linear-to-b from-bg to-header-gradient-end"
  >
    <Header
      languages={languageOptions}
      branches={branchOptions}
      branchingEnabled={auth.value.branchingEnabled}
    />

    {#if writeProgress !== null}
      <!-- Bulk-write progress — appears only while a large `set-nodes-data`
           write is in flight (small writes never send progress messages) and
           is always cleared by `nodes-set-result`, so it never lingers. -->
      <div class="px-3 pt-1.5">
        <ProgressBar loaded={writeProgress.done} total={writeProgress.total} />
      </div>
    {/if}

    {#if branchMissing}
      <!-- The configured branch was deleted in Tolgee — same warning + inline
           re-pick the original plugin shows on Index. Lives outside the
           hasSelection gate: the broken branch matters even with nothing
           selected (Pull/Push/Copy all target it). -->
      <div class="flex flex-col gap-1.5 px-3 pt-1.5 pb-0.5">
        <Message variant="warning">
          Branch "{configuredBranch}" no longer exists. Please select a
          different branch.
        </Message>
        <div class="flex items-center gap-2">
          <Select
            value=""
            options={repickBranchOptions}
            placeholder="Select branch"
            onChange={handleBranchRepick}
            class="flex-1"
          />
          <TooltipIconButton
            label="Refresh branches"
            disabled={refreshingBranches}
            onclick={refreshBranches}
          >
            <RefreshCw
              size={ICON.inline}
              class={refreshingBranches ? "animate-spin" : ""}
            />
          </TooltipIconButton>
        </div>
      </div>
    {/if}

    {#if auth.value.authenticated && hasSelection}
      <!-- Search + filter -->
      <div class="flex items-center gap-2 px-3 pt-0 pb-0.5">
        <SearchInput
          bind:value={query}
          placeholder="Search by string (key)…"
          class="flex-1"
        />

        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props: tooltipProps })}
              <!-- A plain span carries the tooltip's hover/focus behavior;
                   DropdownMenu.Trigger keeps its own untouched button inside.
                   Putting BOTH sets of trigger props on the SAME button (via
                   `{...tooltipProps} {...menuProps}`) silently broke the
                   dropdown's floating-ui positioning — its content rendered
                   off-screen (verified: y: -568) even though its open state
                   was correctly true. Each trigger needs its own element. -->
              <span {...tooltipProps} class="inline-flex">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props: menuProps })}
                      <IconButton {...menuProps} size="md" aria-label="Filter">
                        <span class="relative">
                          <ListFilter size={ICON.action} />
                          {#if filterActive}
                            <span
                              class="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-bg-brand"
                            ></span>
                          {/if}
                        </span>
                      </IconButton>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content
                    align="end"
                    class="flex max-h-[var(--bits-dropdown-menu-content-available-height)] min-w-[13rem] flex-col overflow-hidden"
                  >
                    <!-- Scrollable section list — can outgrow the plugin window, so
                         it gets its own scroll instead of the whole dropdown running
                         off screen. "Clear filters" below stays pinned, outside this
                         div. -->
                    <div class="min-h-0 flex-1 overflow-y-auto">
                      <!-- CONNECTION: one axis (pick one). Replaces the old "hide
                           connected" — clearer as a positive choice. -->
                      <div
                        class="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
                      >
                        Connection
                      </div>
                      {@render radioItem(
                        connection === "all",
                        "All",
                        null,
                        () => (connection = "all"),
                      )}
                      {@render radioItem(
                        connection === "connected",
                        "Connected",
                        stats.connectedNodeCount,
                        () => (connection = "connected"),
                      )}
                      {@render radioItem(
                        connection === "unconnected",
                        "Not connected",
                        stats.unconnectedCount,
                        () => (connection = "unconnected"),
                      )}
                      {#if missingKeyCount > 0}
                        {@render radioItem(
                          connection === "missing",
                          "Missing in Tolgee",
                          missingKeyCount,
                          () => (connection = "missing"),
                        )}
                      {/if}

                      <!-- ADVANCED + GROUPED: "show only" subsets — a single active
                           choice across both, so the result is always predictable. -->
                      <DropdownMenu.Separator />
                      <div
                        class="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
                      >
                        Advanced
                      </div>
                      {@render radioItem(
                        showOnly === "plural",
                        "Plural",
                        stats.pluralCount,
                        () => toggleShowOnly("plural"),
                      )}
                      {@render radioItem(
                        showOnly === "formatted",
                        "Formatted",
                        stats.formattedCount,
                        () => toggleShowOnly("formatted"),
                      )}

                      <DropdownMenu.Separator />
                      <div
                        class="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
                      >
                        Grouped
                      </div>
                      {@render radioItem(
                        showOnly === "sameString",
                        "Same string",
                        stats.duplicateNodeCount,
                        () => toggleShowOnly("sameString"),
                      )}
                      {@render radioItem(
                        showOnly === "sameKey",
                        "Same key (conflict)",
                        stats.conflictNodeCount,
                        () => toggleShowOnly("sameKey"),
                      )}

                      {#if auth.value.namespacesEnabled}
                        <!-- NAMESPACE: multi-select — show only strings in the picked
                             namespaces ("<none>" = no namespace). -->
                        <DropdownMenu.Separator />
                        <div
                          class="px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
                        >
                          Namespace
                        </div>
                        {#each nsFilterOptions as o (o.value)}
                          <DropdownMenu.Item
                            closeOnSelect={false}
                            onSelect={() => toggleNsFilter(o.value)}
                          >
                            <Checkbox checked={nsFilter.has(o.value)} />
                            <span class="flex-1">{o.label}</span>
                          </DropdownMenu.Item>
                        {/each}
                      {/if}
                    </div>

                    {#if anyViewFilter}
                      <DropdownMenu.Separator class="shrink-0" />
                      <DropdownMenu.Item
                        closeOnSelect={false}
                        onSelect={clearViewFilters}
                        class="shrink-0"
                      >
                        <X size={ICON.inline} class="text-icon" />
                        <span class="flex-1">Clear filters</span>
                      </DropdownMenu.Item>
                    {/if}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Filter strings</Tooltip.Content>
        </Tooltip.Root>
      </div>

      {#if stats.conflictKeyLabels.length > 0}
        <!-- Same-key conflict: two+ different Figma texts mapped to one key.
             Only one would upload, so warn up front (like the old plugin's
             "multiple different translations for single key" message).
             Symmetric padding → uniform ~8px gaps to the search above and the
             chip/count below (matches the filter-chip row). -->
        <div class="px-3 pt-1.5 pb-0.5">
          <Message variant="error">
            Multiple different texts use the same key ({stats.conflictKeyLabels.join(
              ", ",
            )}). Only one will upload — give each a different key.
          </Message>
        </div>
      {/if}

      {#if keyFilter || textFilter !== null || connection !== "all" || showOnly || nsFilter.size > 0}
        <!-- Active view filters as removable chips (connection, the "show only"
             subset, plus the exact-key/text filters from marker clicks).
             Independent of the text search; each ✕ clears just that filter.
             Symmetric padding so the gaps above/below match the no-chip gap. -->
        <div class="flex flex-wrap items-center gap-1.5 px-3 pt-1.5 pb-0.5">
          {#if keyFilter}
            <FilterChip clearLabel="Clear key filter" onclear={() => (keyFilter = null)}>
              {keyFilter.ns ? `${keyFilter.ns}.${keyFilter.key}` : keyFilter.key}
            </FilterChip>
          {/if}
          {#if textFilter !== null}
            <FilterChip clearLabel="Clear text filter" onclear={() => (textFilter = null)}>
              "{textFilter}"
            </FilterChip>
          {/if}
          {#if connection !== "all"}
            <FilterChip
              clearLabel="Show all"
              onclear={() => (connection = "all")}
            >
              {connection === "connected"
                ? "connected"
                : connection === "missing"
                  ? "missing in Tolgee"
                  : "not connected"}
            </FilterChip>
          {/if}
          {#if showOnly}
            <FilterChip clearLabel="Show all" onclear={() => (showOnly = null)}>
              {SHOW_ONLY_LABELS[showOnly]}
            </FilterChip>
          {/if}
          {#each [...nsFilter] as ns (ns)}
            <FilterChip clearLabel="Clear namespace filter" onclear={() => toggleNsFilter(ns)}>
              ns:{ns || "<none>"}
            </FilterChip>
          {/each}
        </div>
      {/if}

      {#if total !== 0}
        <!-- Count + master select-all checkbox. Row checkboxes are always on,
             so this is just a select-all / none toggle; bulk actions live in
             the footer once something is selected. -->
        <div
          class="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary"
        >
          {@render masterCheckbox()}

          <!-- Always just the count of strings currently shown ("5 strings").
               The slash form ("N/M") is reserved for the selection count in
               the footer, so the two never get confused. -->
          <span>{shown} {shown === 1 ? "string" : "strings"}</span>
        </div>
      {/if}
    {/if}
  </div>

  {#if !auth.value.authenticated}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center"
    >
      <p class="text-sm">Sign in to connect this document with Tolgee.</p>
      <Button onclick={() => go({ name: "settings" })}>Open Settings</Button>
    </div>
  {:else}
    {#if preparing}
      <!-- Preloader OVERLAY: shown while the main thread scans the new
           selection and through the first render of a large list. Rendered on
           top of the list instead of replacing it, so an incoming selection
           doesn't unmount + remount every row (the swap forced a full re-render
           and stole input focus on large selections). -->
      <div
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-bg px-6 text-center"
      >
        <LoaderCircle size={ICON.hero} class="animate-spin text-secondary" />
        <div class="space-y-0.5 text-text-secondary">
          <p class="text-sm">Loading strings…</p>
          <p class="text-xs">Select less to load faster.</p>
        </div>
      </div>
    {/if}
    {#if !hasSelection}
      <EmptyState
        icon={Group}
        title="Select strings for translation"
        description="Pick frames or texts. Fewer runs smoother."
      />
    {:else if total === 0}
      <!-- Selection has no translatable strings — either it holds no text at
           all, or everything was filtered out. The search/filter bar stays
           above (inside the sticky header) so the user can loosen a filter
           right here. -->
      <EmptyState icon={Meh} title="Nothing to translate here" />
    {:else if shown === 0}
      <EmptyState
        icon={SearchX}
        title="No strings match your search"
        description="Try another word."
      />
    {:else}
      <!-- NodeList owns the scrolling (it windows large lists off its own
           viewport), so this wrapper only reserves the flex space. -->
      <div class="min-h-0 flex-1">
        <NodeList
          nodes={filteredNodes}
          emptyText=""
          duplicateCounts={stats.duplicateCounts}
          conflictCounts={stats.conflictCounts}
          getManualChange={manualChangeFor}
          {missingKeys}
          onFilterText={filterByText}
          onFilterKey={filterByKey}
          {selectedIds}
          onToggleSelect={toggleOne}
          {namespaceNames}
        />
      </div>
    {/if}

    <div class="flex flex-col gap-2 border-t border-border p-2">
      {#if selectedCount > 0}
        <!-- Contextual action bar: replaces Upload/Download while rows are
             selected. Left → right: select-all checkbox + count, the operation
             chooser, then (for "Create key name") the name field + OK, and ✕ to
             cancel the whole selection. -->
        <div class="flex items-center gap-2">
          {@render masterCheckbox()}
          <span class="flex items-center gap-1.5 text-text-secondary">
            {selectedCount}/{shown}
            {#if writing}
              <LoaderCircle size={ICON.inline} class="animate-spin" />
            {/if}
          </span>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger disabled={writing}>
              {#snippet child({ props })}
                <button
                  {...props}
                  disabled={writing}
                  class="flex h-7 shrink-0 items-center gap-1.5 rounded border border-border bg-bg px-2 text-xs text-text transition-colors hover:border-text/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createKeyMode
                    ? "Edit key name"
                    : generateMode
                      ? "Generate key names"
                      : setNamespaceMode
                        ? "Set namespace"
                        : connectExactMode
                          ? "Auto-connect by exact match"
                          : "Choose operation…"}
                  <ChevronDown size={ICON.inline} class="text-icon" />
                </button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start" class="min-w-[12rem]">
              {#if connectableSameText}
                <DropdownMenu.Item onSelect={bulkConnect}>
                  <Link2 size={ICON.inline} /> Connect to key ({generatableCount})
                </DropdownMenu.Item>
              {/if}
              {#if generatableCount > 0}
                <DropdownMenu.Item onSelect={startConnectExact}>
                  <Link2 size={ICON.inline} /> Auto-connect by exact match ({generatableCount})
                </DropdownMenu.Item>
              {/if}
              {#if connectedSelectedCount === 0 && connectableSameText}
                <!-- Only when the selection is ENTIRELY unconnected — writing a
                     key to connected rows would disconnect them. -->
                <DropdownMenu.Item
                  onSelect={() => {
                    generateMode = false;
                    createKeyMode = true;
                  }}
                >
                  <Pencil size={ICON.inline} /> Edit key name
                </DropdownMenu.Item>
              {/if}
              {#if generatableCount > 0}
                <DropdownMenu.Item onSelect={enterGenerateMode}>
                  <Wand size={ICON.inline} /> Generate key names ({generatableCount})
                </DropdownMenu.Item>
              {/if}
              {#if auth.value.namespacesEnabled && generatableCount > 0}
                <DropdownMenu.Item onSelect={enterSetNamespaceMode}>
                  <Tag size={ICON.inline} /> Set namespace ({generatableCount})
                </DropdownMenu.Item>
              {/if}
              {#if connectedSelectedCount > 0}
                <DropdownMenu.Item onSelect={bulkDisconnect}>
                  <Link2Off size={ICON.inline} /> Disconnect connected keys ({connectedSelectedCount})
                </DropdownMenu.Item>
              {/if}
              {#if clearableSelectedCount > 0}
                <DropdownMenu.Item onSelect={bulkClearKey}>
                  <Eraser size={ICON.inline} /> Clear key name ({clearableSelectedCount})
                </DropdownMenu.Item>
              {/if}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {#if createKeyMode}
            <!-- The key name is applied to the `key` field of every selected
                 string. -->
            <Input
              bind:value={newKeyName}
              placeholder="Key name"
              class="flex-1"
              onkeydown={(e) => e.key === "Enter" && bulkSetKeyName()}
            />
            <Button
              size="sm"
              disabled={writing || !newKeyName.trim()}
              onclick={bulkSetKeyName}
            >
              OK
            </Button>
          {:else if generateMode}
            <!-- The FORMAT template, edited with the same chip + autocomplete
                 field as Settings → Key format. Each selected string gets its
                 own key generated from its own text/name. -->
            <KeyFormatInput
              value={templateInput}
              onChange={(v) => (templateInput = v)}
              onSubmit={bulkGenerateApply}
              placeholder={"{elementName}"}
              class="flex-1"
            />
            <Button
              size="sm"
              disabled={writing || !templateInput.trim()}
              onclick={bulkGenerateApply}
            >
              OK
            </Button>
          {:else if setNamespaceMode}
            <!-- Re-assign the namespace of the selected unconnected keys. -->
            <NamespaceInput
              value={bulkNamespace}
              options={namespaceNames}
              onChange={(v) => (bulkNamespace = v)}
              class="flex-1"
            />
            <Button size="sm" disabled={writing} onclick={bulkSetNamespace}>
              OK
            </Button>
          {:else if connectExactMode}
            <!-- Scope picker for the exact-match auto-connect. -->
            <Select
              value={connectScope}
              options={connectScopeOptions}
              onChange={(v) => (connectScope = v as "namespace" | "all")}
              class="flex-1"
            />
            <Button size="sm" disabled={writing} onclick={runConnectExact}>
              OK
            </Button>
          {/if}

          <div class={createKeyMode || generateMode ? "" : "ml-auto"}>
            <TooltipIconButton
              label="Cancel selection"
              side="top"
              disabled={writing}
              onclick={cancelSelection}
            >
              <X size={ICON.inline} />
            </TooltipIconButton>
          </div>
        </div>
      {:else}
        <!-- Dev Mode: Download opens Pull (design-only route) — hidden, same
             as production hides its Pull there. Upload STAYS: production's
             dev keeps Push, and it's metadata/read-only per messagePolicy. -->
        <div class="grid gap-2 {appState.value.editorType === 'dev' ? 'grid-cols-1' : 'grid-cols-2'}">
          <!-- TEMP Upload count badge hidden 2026-06 (remove later); was
               badge={pushKeyCount}. -->
          <SyncButton
            direction="upload"
            onclick={() => go({ name: "push" })}
          />
          {#if appState.value.editorType !== "dev"}
            <SyncButton
              direction="download"
              onclick={() =>
                go({
                  name: "pull",
                  lang: appState.value.config?.language ?? "",
                })}
            />
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- "Connect by exact match" progress + result. -->
<Dialog.Root open={matchOpen} onOpenChange={handleMatchOpenChange}>
  <Dialog.Content class="max-w-sm">
    <Dialog.Title class="text-sm font-semibold text-text">
      Auto-connect by exact match
    </Dialog.Title>

    {#if matching}
      <p class="mt-3 text-xs text-text-secondary">
        Matching {matchProgress.done}/{matchProgress.total}…
      </p>
      <div class="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onclick={cancelMatch}>
          Cancel
        </Button>
      </div>
    {:else if matchResult}
      <!-- Preview before applying: scannable summary (like the Push stats), then
           the detail list of the ones that would be skipped. -->
      <Card class="mt-3 border-0 bg-bg-secondary">
        <div class="grid grid-cols-2 gap-2">
          <Stat
            value={matchResult.willConnect}
            label="To connect"
            tone="secondary"
          />
          <Stat
            value={matchResult.notConnected.length}
            label="Skipped"
            tone="muted"
          />
        </div>
      </Card>

      {#if matchResult.notConnected.length > 0}
        <div class="mt-3 border-t border-border pt-3">
          <p
            class="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            Skipped
          </p>
          <!-- pr-2 so the scrollbar doesn't overlap the trailing (i) icons. -->
          <ul class="max-h-44 space-y-1 overflow-auto pr-2 text-xs">
            {#each matchResult.notConnected as item (nsKeyIndex(item.ns, item.text))}
            <li class="flex items-center gap-1.5">
              <span
                class="min-w-0 flex-1 truncate text-text-secondary"
                title={item.text}
              >
                {item.text}
              </span>
              <Tooltip.Root>
                <Tooltip.Trigger>
                  {#snippet child({ props })}
                    <span
                      {...props}
                      class="shrink-0 text-text-secondary transition-colors hover:text-text-brand"
                      role="button"
                      tabindex={-1}
                      aria-label="Why this wasn't connected"
                    >
                      <Info size={ICON.inline} />
                    </span>
                  {/snippet}
                </Tooltip.Trigger>
                <Tooltip.Content side="left" class="max-w-[14rem] leading-snug">
                  {item.hint}
                </Tooltip.Content>
              </Tooltip.Root>
            </li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onclick={cancelMatch}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={matchResult.willConnect === 0}
          onclick={applyMatches}
        >
          Connect ({matchResult.willConnect})
        </Button>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
</Tooltip.Provider>
