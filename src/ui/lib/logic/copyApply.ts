import { renderIcuForNode } from "$shared/interpolate";
import type { UiToMain } from "$shared/messages";
import type { NodeInfo } from "$shared/types";
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

type ApplyUpdate = Extract<UiToMain, { type: "apply-translations" }>["updates"][number];

/**
 * The text to write for each connected node of a fresh language copy: the
 * remote translation for its key (falling back to the node's own persisted
 * `translation` on a miss, so the page never ends up empty), rendered through
 * THIS node's own plural/param samples — same pipeline as the regular
 * Download. `isPlural` comes from the remote key when available (a per-KEY
 * Tolgee property) since it's more trustworthy than the cloned node's own
 * possibly-stale flag.
 *
 * Nodes with nothing to write (no remote match and no persisted translation)
 * or an unrenderable ICU are skipped — the clone keeps its source-language
 * text rather than getting raw ICU dumped onto the canvas.
 */
export function buildCopyUpdates(
  nodes: NodeInfo[],
  translationsForLang: CopyTranslations,
  language: string,
): ApplyUpdate[] {
  const updates: ApplyUpdate[] = [];
  for (const node of nodes) {
    if (!node.connected || !node.key) continue;
    const remote = translationsForLang[nsKeyIndex(node.ns, node.key)];
    const rawText = remote?.text ?? node.translation;
    if (!rawText) continue;
    const isPlural = remote?.isPlural ?? node.isPlural;
    const out = renderIcuForNode(rawText, { ...node, isPlural }, language);
    if (out.error) continue;
    updates.push({ id: node.id, text: out.text, translation: rawText, isPlural });
  }
  return updates;
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
 * itself is surfaced (one error message, not a per-node report).
 */
export async function applyCopyPages(
  pages: Array<{ pageId: string; language: string; nodes: NodeInfo[] }>,
  translationsByLang: Record<string, CopyTranslations>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: boolean; error?: string }> {
  for (const page of pages) {
    const updates = buildCopyUpdates(
      page.nodes,
      translationsByLang[page.language] ?? {},
      page.language,
    );
    if (updates.length === 0) continue;
    const result = await applyTranslationsRequest(updates, onProgress);
    if (!result.ok) {
      return { ok: false, error: result.errors[0] ?? "Failed to write the copy's translations." };
    }
  }
  return { ok: true };
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
  /** Per-language map to render onto the clone; null for a keys copy. */
  translations: Record<string, CopyTranslations> | null;
  onProgress?: (current: number, total: number) => void;
  onDone?: (result: { ok: boolean; error?: string }) => void;
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
      if (pages.length > 0 && opts.translations) {
        const applied = await applyCopyPages(pages, opts.translations, opts.onProgress);
        if (!applied.ok) {
          opts.onDone?.({ ok: false, error: applied.error ?? "Failed to recreate the copy." });
          return;
        }
      }
      send({ type: "notify", text: "Copy recreated." });
      opts.onDone?.({ ok: true });
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
