import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";
import type { SuggestedKey } from "$ui/lib/logic/prefillKey";

// Idle timeout fed by `nodes-set-progress` (only sent for > 100 nodes), same
// shape as the other bulk-write watchdogs: a large write keeps resetting it,
// only a silent one trips it.
const PERSIST_TIMEOUT_MS = 5 * 60_000;

/**
 * Write the suggested keys of `ids` into the document as ONE batched
 * `set-nodes-data` (with the `prefilledKey` marker, so they stay "auto" —
 * "turn prefill off" can still clear them if the action that needed them
 * never completes). The only place a suggestion reaches the document without
 * the user typing it: Push calls this for the strings it is about to send,
 * because the screenshot capture and the connect-back read keys from
 * pluginData, not from the UI's overlay.
 *
 * Resolves once the main thread confirms (`nodes-set-result`); the selection
 * is patched by App's listener on that same message, after which the written
 * nodes are no longer `pending`. Resolves `ok: false` (never throws) on a
 * failed write or a silent timeout, so the caller can stop instead of pushing
 * keys the document doesn't hold.
 */
export function persistSuggestedKeys(
  pending: ReadonlyMap<string, SuggestedKey>,
  ids: Iterable<string>,
): Promise<{ ok: boolean; count: number }> {
  const nodes: Array<{ id: string; info: SuggestedKey & { connected: false; prefilledKey: string } }> =
    [];
  for (const id of ids) {
    const s = pending.get(id);
    if (s) nodes.push({ id, info: { key: s.key, ns: s.ns, connected: false, prefilledKey: s.key } });
  }
  if (nodes.length === 0) return Promise.resolve({ ok: true, count: 0 });
  return new Promise((resolve) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offProgress();
      watchdog.clear();
    };
    const watchdog = createIdleTimeout(PERSIST_TIMEOUT_MS, () => {
      cleanup();
      resolve({ ok: false, count: nodes.length });
    });
    const offResult = on("nodes-set-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve({ ok: msg.ok, count: nodes.length });
    });
    const offProgress = on("nodes-set-progress", (msg) => {
      if (msg.correlationId === correlationId) watchdog.touch();
    });
    send({ type: "set-nodes-data", correlationId, nodes });
  });
}
