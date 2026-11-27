import { TOLGEE_PLUGIN_CONFIG_NAME } from "$shared/constants";
import type { NodeInfo } from "$shared/types";

import { send } from "$main/bus";
import type { IgnoreSettings } from "$main/nodes/filter";
import {
  type SearchRoot,
  collectConnectedKeyRefs,
  findTaggedTextNodes,
  readConnectedNodeInfo,
} from "$main/nodes/scan";
import { diffCopyFrames, mapCopyChildren } from "$main/handlers/copyFrames";
import { POST_CLONE_YIELD_BUDGET_MS, createYielder, yieldStats } from "$main/nodes/yield";
import { applyRichText } from "$main/text/applyRichText";
import { nsKeyIndex } from "$shared/keyIndex";
import { createPhaseTimer } from "$shared/perf";

/**
 * Options for the `createCopy` handler. The two modes have different payloads
 * but share a `correlationId` so the UI can pair its `create-copy` request
 * with the `create-copy-result` it receives back.
 *
 * `sourcePageId` is only needed for "Recreate copy" (triggered FROM inside an
 * existing copy — `figma.currentPage` is the copy itself there, not the page
 * to clone from). Omitted for the normal Index-invoked "Create page" flow,
 * which defaults to `figma.currentPage` exactly as before.
 */
export type CreateCopyOptions =
  | {
      mode: "keys";
      correlationId: string;
      sourcePageId?: string;
      /** See `UiToMain`'s `create-copy.namespacesEnabled` doc. */
      namespacesEnabled?: boolean;
    }
  | {
      mode: "languages";
      correlationId: string;
      languages: string[];
      sourcePageId?: string;
    };

/** One freshly cloned language page + its connected nodes, handed back to the
 *  UI so IT can render + apply the translations (see `CreateCopyResult`). */
export type CreatedCopyPage = {
  pageId: string;
  language: string;
  nodes: NodeInfo[];
};

export type CreateCopyResult = {
  ok: boolean;
  createdPageIds: string[];
  /**
   * Names of layers a missing font prevented writing. Keys mode only in
   * practice — such a layer keeps its ORIGINAL text instead of the key label,
   * which reads as the copy having quietly not worked there, so the count has
   * to reach the user rather than stopping at a dev-only console line.
   */
  skippedMissingFont?: string[];
  /**
   * Languages mode only. This handler deliberately does NOT write translated
   * text itself: ICU rendering (plurals, params) needs `Intl`, which doesn't
   * exist in Figma's main-thread sandbox — every render of a `{...}` string
   * silently failed here, leaving copies half in the source language. The UI
   * renders these nodes exactly like the Download flow and writes them back
   * via the ordinary `apply-translations` request, which also persists the
   * raw `translation` into plugin data — so a fresh copy is by construction
   * identical to clone + "Download all".
   */
  pages?: CreatedCopyPage[];
  error?: string;
};

// Progress + yields in the per-node loops below are TIME-sliced (see
// `nodes/yield.ts`): right after cloning a huge page every yield handed Figma
// the thread for ~120 ms, so a fixed every-N-nodes cadence (340 yields on a
// 17k-node page) cost 41 s for ~1 s of actual reads.

/**
 * Clone the current page and rewrite every connected text node:
 *
 * - `mode: "keys"` replaces each connected text node's `characters` with the
 *   Tolgee key (prefixed with the namespace when one is set) so the page can
 *   be used as a debug overlay.
 * - `mode: "languages"` clones the page once per language and writes the
 *   provided translation (looked up by `nsKeyIndex`) into every connected
 *   text node. Falls back to the persisted `translation` for any miss so the
 *   page never ends up empty.
 *
 * Every cloned page is marked with `pageCopy: true` in plugin data so the UI
 * routes to the read-only `CopyView` when the user navigates to it. Before each
 * clone, a previous copy with the SAME name (and only one marked `pageCopy`) is
 * removed so repeated copies replace rather than pile up — matching the original
 * plugin.
 *
 * `settings` (hidden layers, digit-only strings, prefixed layer names, …) is
 * applied exactly like the with-selection and page-wide scans — production's
 * `copyPageEndpoint` runs the same filter (`findTextNodes` → `shouldIncludeNode`)
 * before touching a node, so a node the user asked to ignore was never part of
 * the copy in the first place. This handler used to skip that filter entirely
 * (only `findAllWithCriteria`'s pluginData match + `connected && key`), so an
 * ignored node's text got overwritten with its key/translation same as any
 * other connected node — a regression against both production and this app's
 * own Download/Pull, which already respect the setting.
 *
 * Progress is reported via `create-copy-progress` messages keyed by the
 * caller's `correlationId`.
 */
export async function createCopy(
  options: CreateCopyOptions,
  settings: Partial<IgnoreSettings> = {},
): Promise<CreateCopyResult> {
  const sourcePage = await resolveSourcePage(options.sourcePageId);
  if (!sourcePage) {
    return { ok: false, createdPageIds: [], error: "The original page no longer exists." };
  }
  await sourcePage.loadAsync();

  // Matches the guard `request-page-connected-nodes` uses: the ancestor-chain
  // walk only matters (and is only worth its cost) when BOTH the base
  // "hidden layers" filter and its "including children" opt-in are on.
  const needsAncestorHidden = Boolean(
    (settings.ignoreHiddenLayers ?? true) && settings.ignoreHiddenLayersIncludingChildren,
  );

  const createdPageIds: string[] = [];
  // Phases with nothing to count (deleting the old copy, Figma's synchronous
  // clone) still get announced, then the thread is yielded once so the
  // message actually reaches the UI BEFORE the long blocking step — otherwise
  // the bar sat on a bare "Recreating copy…" for ~15 s on a big page with no
  // sign of life. `current`/`total` carry the per-language scale the
  // scanning phase uses so the bar doesn't jump back to indeterminate.
  const announce = async (phase: string, current: number, total: number): Promise<void> => {
    send({
      type: "create-copy-progress",
      correlationId: options.correlationId,
      current,
      total,
      phase,
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  };
  // Layer names a missing font kept us from writing — surfaced in the result
  // rather than dropped, so "Copy created" doesn't overstate what happened.
  const skippedMissingFont: string[] = [];
  // Set when a removed copy turned out to be `figma.currentPage` itself (the
  // "Recreate copy" flow, triggered from inside the copy being replaced) —
  // Figma forbids deleting the active page, so we had to step onto
  // `sourcePage` first. Land back on the fresh replacement afterwards
  // instead of stranding the user on the source page.
  let switchedAwayFromCurrent = false;

  try {
    if (options.mode === "keys") {
      const perf = createPhaseTimer();
      // Matches production's naming exactly (`${name} - keys`, hyphen +
      // lowercase) — `removeExistingCopyPages` below replaces a previous copy
      // by EXACT name match, so a mismatched format (e.g. an em dash or
      // capitalized "Keys") would never find/replace a copy the production
      // plugin created, and vice versa, letting copies pile up instead.
      const targetName = `${sourcePage.name} - keys`;
      switchedAwayFromCurrent ||= (
        await removeExistingCopyPages(
          { name: targetName, sourcePageId: sourcePage.id },
          sourcePage,
          () => announce("removing", 0, 0),
        )
      ).switchedAwayFromCurrent;
      perf.mark("remove old copy");
      await announce("cloning", 0, 0);
      const targetPage = sourcePage.clone();
      targetPage.name = targetName;
      figma.root.appendChild(targetPage);
      createdPageIds.push(targetPage.id);
      // Marked IMMEDIATELY: a run that dies here (Figma out of memory →
      // recovery mode, a crash, the plugin closed) must leave a page the next
      // Create/Recreate recognises and replaces — unmarked, it was taken for
      // the user's own same-named page and lived on as a duplicate.
      markPageAsCopy(targetPage, sourcePage.id);
      perf.mark("clone (Figma)");

      await targetPage.loadAsync();
      mapCopyChildren(sourcePage, targetPage);
      perf.mark("load clone");
      await announce("scanning-keys", 0, 0);
      // Only Tolgee-tagged nodes (engine criteria + instance probe, see
      // `findTaggedTextNodes`), so untagged text never pays the 5-bridge-call
      // `getNodeInfo` just to be skipped.
      const textNodes = await findTaggedTextNodes(targetPage, POST_CLONE_YIELD_BUDGET_MS);
      perf.mark("find tagged", `${textNodes.length} tagged`);
      const total = textNodes.length;
      let processed = 0;
      const yielder = createYielder(POST_CLONE_YIELD_BUDGET_MS);

      for (const node of textNodes) {
        // pluginData-first (see `readConnectedNodeInfo`): the unconnected
        // majority of a big page's tagged nodes is dropped after ONE read.
        const info = readConnectedNodeInfo(node, settings, needsAncestorHidden);
        if (info) {
          // Matches `namespacedKeyLabel`'s gate (Pull/CopyView/StringDetails):
          // a node can carry a real `ns` even when namespaces are toggled
          // off in Settings (e.g. legacy data, or the project disabled the
          // feature after some keys were already namespaced) — without this
          // check the copy would show "ns.key" while every other screen
          // shows plain "key" for that exact node.
          const label =
            info.ns && options.namespacesEnabled ? `${info.ns}.${info.key}` : info.key;
          const written = await writeTextSafely(node, label, { plainOnly: true });
          if (!written) skippedMissingFont.push(node.name);
        }
        processed++;
        if (await yielder.maybeYield()) {
          send({
            type: "create-copy-progress",
            correlationId: options.correlationId,
            current: processed,
            total,
            phase: "writing-keys",
          });
        }
      }

      perf.mark("write key labels", `${skippedMissingFont.length} skipped, ${yieldStats(yielder)}`);
      if (switchedAwayFromCurrent) await figma.setCurrentPageAsync(targetPage);
      console.log(perf.summary("create-copy keys"));
    } else {
      // mode === "languages"
      const totalPages = options.languages.length;
      const pages: CreatedCopyPage[] = [];

      for (let i = 0; i < totalPages; i++) {
        const lang = options.languages[i];
        if (!lang) continue;

        const perf = createPhaseTimer();
        // Matches production's naming exactly — see the "keys" branch above.
        const targetName = `${sourcePage.name} - ${lang}`;
        switchedAwayFromCurrent ||= (
          await removeExistingCopyPages(
            { name: targetName, sourcePageId: sourcePage.id, language: lang },
            sourcePage,
            () => announce("removing", i * 100, totalPages * 100),
          )
        ).switchedAwayFromCurrent;
        perf.mark("remove old copy");
        await announce("cloning", i * 100, totalPages * 100);
        const targetPage = sourcePage.clone();
        targetPage.name = targetName;
        figma.root.appendChild(targetPage);
        createdPageIds.push(targetPage.id);
        // Marked IMMEDIATELY — see the keys branch above.
        markPageAsCopy(targetPage, sourcePage.id, lang);
        perf.mark("clone (Figma)");

        await targetPage.loadAsync();
        mapCopyChildren(sourcePage, targetPage);
        perf.mark("load clone");
        await announce(`scanning-${lang}`, i * 100, totalPages * 100);
        // Engine criteria + instance probe (see `findTaggedTextNodes`): a text
        // whose key lives on the MAIN COMPONENT (instance inherits it) was
        // invisible to the bare criteria, so the copy left it untranslated.
        const textNodes = await findTaggedTextNodes(targetPage, POST_CLONE_YIELD_BUDGET_MS);
        perf.mark("find tagged", `${textNodes.length} tagged`);

        // No text is written here — see `CreateCopyResult.pages`: the UI
        // renders + applies the translations, this side only collects the
        // clone's connected nodes for it.
        const nodes: NodeInfo[] = [];
        const total = textNodes.length;
        let processed = 0;
        const yielder = createYielder(POST_CLONE_YIELD_BUDGET_MS);

        for (const node of textNodes) {
          // pluginData-first (see `readConnectedNodeInfo`): on the measured
          // 17k-tagged / 1.3k-connected page this phase was 55 s of a 76 s
          // Recreate — every stale prefill leftover paid a full `characters`
          // copy just to be thrown away.
          const info = readConnectedNodeInfo(node, settings, needsAncestorHidden);
          if (info) nodes.push(info);
          processed++;
          if (await yielder.maybeYield()) {
            const overall = i * 100 + Math.round((processed / Math.max(total, 1)) * 100);
            send({
              type: "create-copy-progress",
              correlationId: options.correlationId,
              current: overall,
              total: totalPages * 100,
              phase: `scanning-${lang}`,
            });
          }
        }
        perf.mark("collect node info", `${nodes.length} connected, ${yieldStats(yielder)}`);

        pages.push({ pageId: targetPage.id, language: lang, nodes });
        if (switchedAwayFromCurrent) await figma.setCurrentPageAsync(targetPage);
        console.log(perf.summary(`create-copy ${lang}`));
      }

      return { ok: true, createdPageIds, pages, skippedMissingFont };
    }

    return { ok: true, createdPageIds, skippedMissingFont };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    // Roll back the clones this run appended. A page is only stamped by
    // `markPageAsCopy` AFTER its write loop finishes, so one created before the
    // throw carries no marker at all — which makes it invisible to
    // `removeExistingCopyPages` forever. Left in place, every retry would add
    // another half-written orphan the user has to hunt down by hand, and no
    // later run could ever clean them up.
    const orphans = await removeCreatedPages(createdPageIds, sourcePage);
    return { ok: false, createdPageIds: orphans, error };
  }
}

/**
 * Delete pages created by a failed run. Returns the ids it could NOT remove,
 * so the caller reports what actually survived rather than what it attempted.
 *
 * Removal is best-effort per page: one page refusing to go must not strand the
 * rest, and the original error is what the user needs to see, not a rollback
 * failure on top of it.
 */
async function removeCreatedPages(ids: string[], fallback: PageNode): Promise<string[]> {
  const remaining: string[] = [];
  for (const id of ids) {
    try {
      const node = await figma.getNodeByIdAsync(id);
      if (node?.type !== "PAGE") continue;
      const page = node as PageNode;
      // Figma forbids removing the active page — step onto the source first.
      if (page === figma.currentPage) {
        await fallback.loadAsync();
        await figma.setCurrentPageAsync(fallback);
      }
      page.remove();
    } catch {
      remaining.push(id);
    }
  }
  return remaining;
}

/** `sourcePageId` set (the "Recreate copy" flow) resolves that specific page;
 *  otherwise defaults to `figma.currentPage` — the normal Index-invoked flow,
 *  unchanged from before this existed. */
export type CopyPreflight = {
  textCount: number;
  /** Every scene layer on the page — Figma's own memory proxy. */
  layerCount: number;
  existingCopies: number;
  copyNames: string[];
};

/** Every SceneNode type `findAllWithCriteria` can match — one engine-side
 *  search that returns the page's full layer count (what Figma's "Manage
 *  memory" counts), without a JS-side walk. */
const ALL_LAYER_TYPES: NodeType[] = [
  "BOOLEAN_OPERATION",
  "CODE_BLOCK",
  "COMPONENT",
  "COMPONENT_SET",
  "CONNECTOR",
  "ELLIPSE",
  "EMBED",
  "FRAME",
  "GROUP",
  "HIGHLIGHT",
  "INSTANCE",
  "LINE",
  "LINK_UNFURL",
  "MEDIA",
  "POLYGON",
  "RECTANGLE",
  "SECTION",
  "SHAPE_WITH_TEXT",
  "SLICE",
  "STAMP",
  "STAR",
  "STICKY",
  "TABLE",
  "TEXT",
  "VECTOR",
  "WASHI_TAPE",
  "WIDGET",
];

/**
 * Size up a copy BEFORE it is made: the source page's TEXT count (one
 * engine-side search, no per-node reads) and how many plugin-made copies of
 * it the file already holds. The UI turns that into a memory warning — the
 * plugin can't read Figma's per-file memory, but "a huge page that already
 * has copies in this file" is exactly what pushed the customer-sized test
 * file into recovery mode. Only same-named candidates (`<source> - …`) are
 * loaded to read their marker, so a file with many pages stays cheap.
 */
export async function copyPreflight(sourcePageId?: string): Promise<CopyPreflight> {
  const sourcePage = await resolveSourcePage(sourcePageId);
  if (!sourcePage) return { textCount: 0, layerCount: 0, existingCopies: 0, copyNames: [] };
  const perf = createPhaseTimer();
  await sourcePage.loadAsync();
  const textCount = sourcePage.findAllWithCriteria({ types: ["TEXT"] }).length;
  perf.mark("count texts", `${textCount}`);
  const layerCount = sourcePage.findAllWithCriteria({ types: ALL_LAYER_TYPES }).length;
  perf.mark("count layers", `${layerCount}`);
  const copyNames: string[] = [];
  const prefix = `${sourcePage.name} - `;
  for (const page of figma.root.children) {
    if (page.type !== "PAGE" || page === sourcePage) continue;
    if (!page.name.startsWith(prefix)) continue;
    // No `loadAsync`: a page's own pluginData is readable while the page is
    // unloaded (dynamic-page only gates children/find*/export/insert). Loading
    // each copy cost 11–13 s on a 113k-layer file and pinned it in memory.
    const marker = readCopyMarker(page);
    if (marker && (marker.sourcePageId === undefined || marker.sourcePageId === sourcePage.id)) {
      copyNames.push(page.name);
    }
  }
  perf.mark("find copies", `${copyNames.length}`);
  console.log(perf.summary("copy preflight"));
  return { textCount, layerCount, existingCopies: copyNames.length, copyNames };
}

export async function resolveSourcePage(sourcePageId?: string): Promise<PageNode | null> {
  if (!sourcePageId) return figma.currentPage;
  const node = await figma.getNodeByIdAsync(sourcePageId);
  return node?.type === "PAGE" ? node : null;
}

/** The copy marker written by `markPageAsCopy`, or `null` for any page that
 *  isn't a previously-generated Tolgee copy. */
function readCopyMarker(
  page: PageNode,
): { sourcePageId?: string; language?: string } | null {
  const raw = page.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      pageCopy?: boolean;
      sourcePageId?: string;
      copyLanguage?: string;
      language?: string;
    };
    if (parsed.pageCopy !== true) return null;
    return {
      sourcePageId: parsed.sourcePageId,
      // `copyLanguage` is the immutable marker; `language` shares the page
      // scope with the selectable Push/Pull language and can be repointed.
      language: parsed.copyLanguage ?? parsed.language,
    };
  } catch {
    return null;
  }
}

/**
 * Identifies the copy a fresh one REPLACES.
 *
 * A copy's identity is `(source page, language)` — a keys copy carries no
 * language, each language copy carries its own — not its name. Matching on the
 * name alone (which is all this used to do) breaks the moment the naming
 * format changes: this PR aligned the separator with production, so a copy
 * made by an earlier v2 build no longer matched, Recreate appended a SECOND
 * page instead of replacing it, `switchedAwayFromCurrent` never fired, and the
 * user was left looking at the stale one under a "Copy recreated." toast.
 *
 * The name is still accepted as a fallback, because copies made by the
 * published plugin predate `sourcePageId` and have nothing else to match on.
 */
function matchesCopyIdentity(page: PageNode, target: CopyTarget): boolean {
  const marker = readCopyMarker(page);
  if (!marker?.sourcePageId) return false; // pre-tracking copy: name is its only handle
  return marker.sourcePageId === target.sourcePageId && marker.language === target.language;
}

/** The copy a `createCopy` run is about to write, for replacement lookup. */
export type CopyTarget = {
  name: string;
  sourcePageId: string;
  /** Absent for a keys copy; the language tag for a language copy. */
  language?: string;
};

/**
 * Remove any existing copy page with the given name, so a repeated copy
 * replaces the old one instead of accumulating duplicates. Only pages marked
 * `pageCopy: true` are removed — a user's own same-named page is left alone
 * (matches the original plugin). Only pages whose name matches are loaded, so
 * this doesn't force-load the whole document under dynamic-page access.
 *
 * Figma forbids removing the CURRENTLY ACTIVE page — which happens when
 * "Recreate copy" is run from inside the very copy being replaced. When that's
 * the page about to be removed, we step onto `preferredFallback` (the source
 * page, already loaded by the caller) first and report it via
 * `switchedAwayFromCurrent` so the caller can land on the fresh replacement
 * once it exists, instead of stranding the user on the fallback.
 */
export async function removeExistingCopyPages(
  target: CopyTarget,
  preferredFallback?: PageNode,
  /** Called once, right before the FIRST page is removed — never when there
   *  is nothing to remove (a first-time copy), so the UI doesn't announce a
   *  "Removing the old copy…" phase that isn't happening. */
  onBeforeRemove?: () => Promise<void>,
): Promise<{ switchedAwayFromCurrent: boolean }> {
  let switchedAwayFromCurrent = false;
  let removedAny = false;

  const removePage = async (page: PageNode): Promise<void> => {
    if (!removedAny) await onBeforeRemove?.();
    // Only the page actually being removed is loaded — removal behaves exactly
    // as before. The marker checks below read pluginData, which needs no load.
    await page.loadAsync();
    if (page === figma.currentPage) {
      const fallback =
        preferredFallback ?? figma.root.children.find((p) => p !== page && p.type === "PAGE");
      if (fallback) {
        await fallback.loadAsync();
        // The sync `figma.currentPage` setter throws under
        // `documentAccess: "dynamic-page"` — only the async API is allowed.
        await figma.setCurrentPageAsync(fallback as PageNode);
        switchedAwayFromCurrent = true;
      }
    }
    page.remove();
    removedAny = true;
  };

  // Pass 1 — by name. Comparing a name needs no page load, so this stays cheap
  // on a document with many pages, and it is the ONLY handle on copies made by
  // the published plugin (they predate `sourcePageId`). Snapshot the children:
  // `remove()` mutates the live array.
  const others: PageNode[] = [];
  for (const page of [...figma.root.children]) {
    if (page.type !== "PAGE") continue;
    if (page.name !== target.name) {
      others.push(page);
      continue;
    }
    if (readCopyMarker(page) === null) continue; // a user's own same-named page
    await removePage(page);
  }
  if (removedAny) return { switchedAwayFromCurrent };

  // Pass 2 — by identity `(source page, language)`, for a copy whose NAME no
  // longer matches: this PR aligned the naming with production, so a copy made
  // by an earlier v2 build would otherwise go unfound and Recreate would append
  // a duplicate beside it. Reading the marker needs no page load (pluginData
  // on a PageNode is available unloaded under dynamic-page), so this pass no
  // longer pulls every other page of the file into memory.
  for (const page of others) {
    if (!matchesCopyIdentity(page, target)) continue;
    await removePage(page);
  }

  return { switchedAwayFromCurrent };
}

/**
 * Write plugin data onto a freshly cloned page so the UI shows the read-only
 * `CopyView`. Skips `writeConfig` so we don't leak the marker into the
 * global/document scopes. `sourcePageId` lets a later `checkCopyStaleness`
 * find the original page again to compare connected keys.
 */
function markPageAsCopy(page: PageNode, sourcePageId: string, language?: string): void {
  const payload: Record<string, unknown> = {
    pageCopy: true,
    pageInfo: true,
    sourcePageId,
  };
  if (language) {
    payload.language = language;
    // Immutable copy-language marker: `language` shares the page scope with the
    // selectable Push/Pull language and can get repointed, which made Recreate
    // (and Download) fall back to the source/default language. `copyLanguage`
    // is written once here and read first by CopyView so the copy always
    // Recreates/Downloads in the language it was actually made in.
    payload.copyLanguage = language;
  }
  page.setPluginData(TOLGEE_PLUGIN_CONFIG_NAME, JSON.stringify(payload));
}

/**
 * Write `text` into `node` via the shared rich-text applier (bold/italic/
 * underline from inline HTML tags, same as the regular Pull/apply-
 * translations path) — bails out silently when the node has missing or
 * mixed fonts, which are very rare on connected nodes and would otherwise
 * abort the whole copy.
 */
export async function writeTextSafely(
  node: TextNode,
  text: string,
  options?: { plainOnly?: boolean },
): Promise<boolean> {
  // A node whose font isn't available can't be written at all. Report it so
  // the caller can tell the user: on a keys copy such a layer silently keeps
  // its original translated text instead of the key label, which looks like
  // the copy simply didn't work on those layers.
  if (node.hasMissingFont) return false;
  // NO bail on `fontName === figma.mixed`: an advanced string rendered with
  // bold/italic ranges IS mixed, and skipping it left the keys copy showing
  // the original text instead of the key for exactly those nodes (the
  // original plugin wrote keys onto mixed nodes too). `applyRichText`
  // handles mixed safely — it pre-loads every font on the node via
  // `getRangeAllFontNames` before assigning `characters`.
  await applyRichText(node, text, options);
  return true;
}

export type CopyStalenessFrames = {
  added: number;
  removed: number;
  changed: number;
  /** The copy carries the frame↔source mapping "Update changed frames"
   *  needs (false for copies made by the original plugin / older builds). */
  mappable: boolean;
};

export type CopyStalenessResult = {
  ok: boolean;
  /** Connected strings on the source page that this copy doesn't have yet. */
  missingCount?: number;
  /** Connected strings the source page LOST since the copy was made (the
      copy still shows them). */
  removedCount?: number;
  /** Per-frame breakdown, computed only when the page-level check says the
   *  copy is stale (it costs a second pass over both pages). */
  frames?: CopyStalenessFrames;
  error?: string;
};

/**
 * Compares `copyPage`'s connected keys against its recorded SOURCE page's
 * current connected keys, so `CopyView` can warn when the original gained new
 * connections since the copy was made. Download only refreshes text for keys
 * the copy already tracks — it has no way to discover new ones on its own,
 * so a growing gap here would otherwise go unnoticed indefinitely.
 *
 * Fails gracefully (an explanatory `error`, not a throw) whenever the
 * comparison isn't possible: no `sourcePageId` recorded (a copy from before
 * this existed, or from production) or the source page was since deleted.
 */
export async function checkCopyStaleness(copyPage: PageNode): Promise<CopyStalenessResult> {
  const raw = copyPage.getPluginData(TOLGEE_PLUGIN_CONFIG_NAME);
  let sourcePageId: string | undefined;
  try {
    sourcePageId = raw ? (JSON.parse(raw) as { sourcePageId?: string }).sourcePageId : undefined;
  } catch {
    return { ok: false, error: "Could not read this copy's plugin data." };
  }
  if (!sourcePageId) {
    return { ok: false, error: "This copy predates staleness tracking." };
  }

  const sourcePage = await figma.getNodeByIdAsync(sourcePageId);
  if (!sourcePage || sourcePage.type !== "PAGE") {
    return { ok: false, error: "The original page no longer exists." };
  }
  const perf = createPhaseTimer();
  await sourcePage.loadAsync();
  await copyPage.loadAsync();
  perf.mark("load pages");

  // Both directions from the same two scans — deletions cost nothing extra.
  // `missing` = connected strings the source gained since the copy was made;
  // `removed` = connected strings the source lost (the copy still shows
  // them). Per-key maxes, so a surplus on one key never cancels a genuine
  // gap on another.
  const sourceCounts = await collectConnectedKeyCounts(sourcePage);
  perf.mark("scan source", `${sourceCounts.size} keys`);
  const copyCounts = await collectConnectedKeyCounts(copyPage);
  perf.mark("scan copy", `${copyCounts.size} keys`);
  let missingCount = 0;
  for (const [key, srcCount] of sourceCounts) {
    missingCount += Math.max(0, srcCount - (copyCounts.get(key) ?? 0));
  }
  let removedCount = 0;
  for (const [key, copyCount] of copyCounts) {
    removedCount += Math.max(0, copyCount - (sourceCounts.get(key) ?? 0));
  }
  perf.mark("compare", `${missingCount} missing, ${removedCount} removed`);
  let frames: CopyStalenessFrames | undefined;
  if (missingCount + removedCount > 0) {
    const diff = await diffCopyFrames(sourcePage, copyPage);
    frames = {
      added: diff.added.length,
      removed: diff.removed.length,
      changed: diff.changed.length,
      mappable: diff.mappable,
    };
    perf.mark(
      "frames",
      `${frames.added} added, ${frames.changed} changed, ${frames.removed} removed${frames.mappable ? "" : ", not mappable"}`,
    );
  }
  console.log(perf.summary("copy staleness"));
  return { ok: true, missingCount, removedCount, frames };
}

/**
 * Connected string COUNT per `(ns, key)` on `page` — counts, not a set.
 * Node ids differ between a source page and its clone, so nodes can't be
 * matched individually; per-key counts are the closest stable proxy. A set
 * comparison missed the real-world case that surfaced this: connecting an
 * ADDITIONAL node to an already-connected key changes no key set, but the
 * copy's clone of that node predates the connection, so Download will never
 * touch it — the copy is stale all the same.
 */
export async function collectConnectedKeyCounts(page: SearchRoot): Promise<Map<string, number>> {
  // Key identity only (`collectConnectedKeyRefs`: one pluginData read per
  // tagged node, incl. keys inherited from a main component). This check
  // runs TWO scans back-to-back on every CopyView open / page switch — and
  // right after a Recreate lands — so it used to be the hidden tail of every
  // copy on a large page: `getNodeInfo` per node copied `characters`, `name`
  // and `visible` across the bridge just to throw them away.
  const refs = await collectConnectedKeyRefs(page);
  const counts = new Map<string, number>();
  for (const ref of refs) {
    const key = nsKeyIndex(ref.ns, ref.key);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
