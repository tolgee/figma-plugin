import { renderIcuForNode } from "$shared/interpolate";
import type { UiToMain } from "$shared/messages";
import type { NodeInfo } from "$shared/types";
import type { TolgeeClient } from "$ui/lib/api/client";
import { fetchAllTranslations, type PulledKey } from "$ui/lib/api/pull";
import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";
import { nsKeyIndex } from "$ui/lib/logic/namespaces";

/**
 * UI half of the language-copy flow. The main thread only CLONES the page and
 * returns its connected nodes (`create-copy-result.pages`) — it can't render
 * ICU itself, Figma's main-thread sandbox has no `Intl` (plural rules), so
 * every `{param}`/plural render silently failed there and copies came out
 * half in the source language. This module renders each node exactly like
 * the Download flow and writes the results back through the ordinary
 * `apply-translations` request, which also persists the raw `translation`
 * into plugin data — making a fresh copy identical to clone + Download all
 * (an immediate Download afterwards reports "No changes found").
 */

export type CopyTranslations = Record<string, { text: string; isPlural: boolean }>;

/** One freshly cloned page as `create-copy-result.pages` reports it. */
export type CopyPage = { pageId: string; language: string; nodes: NodeInfo[] };

type ApplyUpdate = Extract<UiToMain, { type: "apply-translations" }>["updates"][number];

/**
 * Per-language translations map, keyed by `nsKeyIndex` so each cloned node
 * (which has a fresh ID) is matched back to its Tolgee key + namespace.
 * Carries `isPlural` alongside the raw text — a per-KEY Tolgee property,
 * trusted over the copied node's own (possibly stale) flag. Keys whose
 * translation in a language is empty are left OUT of that language's map, so
 * they count as "no translation yet" downstream instead of writing "".
 */
export function buildTranslationsMap(
  keys: PulledKey[],
  languages: string[],
): Record<string, CopyTranslations> {
  const map: Record<string, CopyTranslations> = {};
  for (const lang of languages) {
    const perLang: CopyTranslations = {};
    for (const k of keys) {
      const text = k.translations[lang]?.text;
      if (text) {
        perLang[nsKeyIndex(k.keyNamespace, k.keyName)] = { text, isPlural: k.isPlural };
      }
    }
    map[lang] = perLang;
  }
  return map;
}

/**
 * Fetch the translations a set of fresh clones needs — by the KEY NAMES the
 * clones actually carry, exactly like Download does, not by paginating the
 * whole project. The clone's key set is only known once the main thread has
 * cloned (`create-copy-result.pages`), which is why the copy flows fetch
 * AFTER cloning: the project-wide pagination that used to run before it was
 * the one place in the plugin still trusting that "every key of the project"
 * is what comes back, and it is also the slowest possible fetch on a large
 * project. One batched, URL-length-safe fetch across every language the
 * clones were made in.
 */
export async function fetchCopyTranslations(
  client: TolgeeClient,
  pages: CopyPage[],
  branch: string | undefined,
): Promise<Record<string, CopyTranslations>> {
  const keyNames = new Set<string>();
  const languages = new Set<string>();
  for (const page of pages) {
    languages.add(page.language);
    for (const n of page.nodes) if (n.connected && n.key) keyNames.add(n.key);
  }
  if (keyNames.size === 0) return {};
  const keys = await fetchAllTranslations(client, {
    languages: [...languages],
    branch: branch || undefined,
    keyNames: [...keyNames],
  });
  return buildTranslationsMap(keys, [...languages]);
}

/**
 * The text to write for each connected node of a fresh language copy: the
 * remote translation for its key, rendered through THIS node's own
 * plural/param samples — same pipeline as the regular Download. `isPlural`
 * comes from the remote key when available (a per-KEY Tolgee property) since
 * it's more trustworthy than the cloned node's own possibly-stale flag.
 *
 * A connected node whose key has no translation in `translationsForLang` (key
 * missing from the response, or empty in that language) is reported in
 * `skipped` and NOT written. It used to fall back to the node's own persisted
 * `translation` — which on a clone is whatever the SOURCE page last pulled,
 * i.e. usually the source-language text — and persist THAT as the copy's
 * translation. The string then looked "copied but untranslated" while the
 * translation existed in Tolgee all along, and the write masked the miss.
 * Skipping leaves the clone's source text in place (visually identical) with
 * nothing persisted, so a later Download still sees the node as outdated and
 * the caller can tell the user how many strings were left behind.
 *
 * An unrenderable ICU is skipped the same way — the clone keeps its source
 * text rather than getting raw ICU dumped onto the canvas.
 */
export function buildCopyUpdates(
  nodes: NodeInfo[],
  translationsForLang: CopyTranslations,
  language: string,
): { updates: ApplyUpdate[]; skipped: NodeInfo[] } {
  const updates: ApplyUpdate[] = [];
  const skipped: NodeInfo[] = [];
  for (const node of nodes) {
    if (!node.connected || !node.key) continue;
    const remote = translationsForLang[nsKeyIndex(node.ns, node.key)];
    if (!remote?.text) {
      skipped.push(node);
      continue;
    }
    const out = renderIcuForNode(remote.text, { ...node, isPlural: remote.isPlural }, language);
    if (out.error) {
      skipped.push(node);
      continue;
    }
    updates.push({ id: node.id, text: out.text, translation: remote.text, isPlural: remote.isPlural });
  }
  return { updates, skipped };
}

/** User-facing tail for a copy notice when some strings could not be written. */
export function copySkippedSuffix(skipped: number): string {
  if (skipped === 0) return "";
  return ` ${skipped} string${skipped === 1 ? "" : "s"} skipped — no translation in Tolgee yet.`;
}

// Same idle-timeout rationale as CopyView's own apply watchdog: progress
// messages keep resetting the clock, so only a genuinely silent write trips
// it — large pages legitimately take a while between pings.
const APPLY_TIMEOUT_MS = 5 * 60_000;

/**
 * Send one `apply-translations` batch and resolve with its result. Mirrors
 * `requestPageConnectedNodes`' promise-wrapper shape (correlation id pairing,
 * idle watchdog touched by progress). `onProgress` forwards the write's
 * done/total (only emitted by the main thread for batches > 100 nodes).
 */
export function applyTranslationsRequest(
  updates: ApplyUpdate[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; errors: string[] }> {
  return new Promise((resolve) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offProgress();
      watchdog.clear();
    };
    const watchdog = createIdleTimeout(APPLY_TIMEOUT_MS, () => {
      cleanup();
      resolve({ ok: false, errors: ["Timed out waiting for the translations to apply."] });
    });
    const offResult = on("apply-translations-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve({ ok: msg.ok, errors: msg.errors });
    });
    const offProgress = on("apply-translations-progress", (msg) => {
      if (msg.correlationId !== correlationId) return;
      watchdog.touch();
      onProgress?.(msg.done, msg.total);
    });
    send({ type: "apply-translations", correlationId, updates });
  });
}

/**
 * Render + apply the translations onto every freshly cloned page, one
 * `apply-translations` batch per page. Pages whose nodes all resolve to
 * "nothing to write" are skipped without a round-trip. Stops at the first
 * failing page and reports its first error — matching how the copy result
 * itself is surfaced (one error message, not a per-node report). `skipped`
 * counts the connected strings across all pages that had no translation to
 * write (see `buildCopyUpdates`), for the completion notice.
 */
export async function applyCopyPages(
  pages: CopyPage[],
  translationsByLang: Record<string, CopyTranslations>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; error?: string; skipped: number }> {
  let skippedTotal = 0;
  for (const page of pages) {
    const { updates, skipped } = buildCopyUpdates(
      page.nodes,
      translationsByLang[page.language] ?? {},
      page.language,
    );
    skippedTotal += skipped.length;
    if (updates.length === 0) continue;
    const result = await applyTranslationsRequest(updates, onProgress);
    if (!result.ok) {
      return {
        ok: false,
        error: result.errors[0] ?? "Failed to write the copy's translations.",
        skipped: skippedTotal,
      };
    }
  }
  return { ok: true, skipped: skippedTotal };
}

const RECREATE_IDLE_TIMEOUT_MS = 5 * 60_000;

/**
 * Correlation id of the recreate currently in flight, or `null`.
 *
 * MODULE-scoped for the same reason the job itself is: recreating unmounts the
 * view that started it, so a "busy" flag held in component state dies with the
 * instance. A second Recreate could then start while the first was still
 * applying — and since recreating DELETES the existing copy page, the second
 * run would remove the fresh page the first one was midway through writing.
 */
let inFlightRecreate: string | null = null;

/** Whether a recreate is still running — including across the unmount of the
 *  view that started it. Callers must check this BEFORE sending `create-copy`;
 *  by the time the job is registered, the main thread is already deleting. */
export function isCopyRecreateInFlight(): boolean {
  return inFlightRecreate !== null;
}

/**
 * MODULE-SCOPED continuation for "Recreate copy": waits for this
 * `create-copy-result`, then renders + applies `translations` onto the fresh
 * clone and toasts "Copy recreated.".
 *
 * Why not in CopyView: recreating deletes the CURRENT page first (main switches
 * to the source page as fallback), and the source page isn't a copy — so
 * App.svelte routes away and CopyView UNMOUNTS mid-flight, tearing down any
 * `$effect`-registered result handler along with the held translations. The
 * clone then completed with nobody left to apply the fetched language onto it,
 * and the "recreated" page silently kept the source-language text. This job
 * lives outside the component lifecycle, so it survives that unmount/remount.
 * (Plain "Create copy" never hit this: it runs from the source page, which is
 * not removed, so CreateCopy stays mounted.)
 *
 * `onProgress`/`onDone` are best-effort UI hooks — after the unmount they
 * update a dead instance's state, which is harmless; the canvas work and the
 * toast don't depend on them.
 */
export function finishCopyRecreate(opts: {
  correlationId: string;
  /** Fetches the per-language map for the FRESH clone's pages (by their key
   *  names — see `fetchCopyTranslations`); null for a keys copy. Runs after
   *  the clone exists, so it must not depend on the initiating view. */
  loadTranslations: ((pages: CopyPage[]) => Promise<Record<string, CopyTranslations>>) | null;
  onProgress?: (current: number, total: number) => void;
  onDone?: (result: { ok: boolean; error?: string; skipped?: number }) => void;
}): void {
  inFlightRecreate = opts.correlationId;
  const cleanup = (): void => {
    offResult();
    offProgress();
    watchdog.clear();
    // Only clear if this job is still the current one — a later recreate that
    // somehow started must not be un-marked by an older job settling.
    if (inFlightRecreate === opts.correlationId) inFlightRecreate = null;
  };
  // Idle timeout, not wall-clock: create-copy-progress pings keep resetting it,
  // so only a genuinely silent recreate trips it (same shape as the apply
  // watchdogs above).
  const watchdog = createIdleTimeout(RECREATE_IDLE_TIMEOUT_MS, () => {
    cleanup();
    opts.onDone?.({ ok: false, error: "Timed out waiting for the copy to be recreated." });
  });
  const offProgress = on("create-copy-progress", (msg) => {
    if (msg.correlationId !== opts.correlationId) return;
    watchdog.touch();
    opts.onProgress?.(msg.current, msg.total);
  });
  const offResult = on("create-copy-result", (msg) => {
    if (msg.correlationId !== opts.correlationId) return;
    cleanup();
    void (async () => {
      if (!msg.ok) {
        opts.onDone?.({ ok: false, error: msg.error ?? "Failed to recreate the copy." });
        return;
      }
      const pages = msg.pages ?? [];
      let skipped = 0;
      if (pages.length > 0 && opts.loadTranslations) {
        const translations = await opts.loadTranslations(pages);
        const applied = await applyCopyPages(pages, translations, opts.onProgress);
        if (!applied.ok) {
          opts.onDone?.({ ok: false, error: applied.error ?? "Failed to recreate the copy." });
          return;
        }
        skipped = applied.skipped;
      }
      send({ type: "notify", text: `Copy recreated.${copySkippedSuffix(skipped)}` });
      opts.onDone?.({ ok: true, skipped });
    })().catch((err: unknown) => {
      // Fire-and-forget, so a throw in here would otherwise surface only as an
      // unhandled rejection — leaving the view stuck on its "recreating" state
      // with no message.
      console.error("[tolgee:ui] copy recreate failed", err);
      opts.onDone?.({
        ok: false,
        error: err instanceof Error ? err.message : "Failed to recreate the copy.",
      });
    });
  });
}
