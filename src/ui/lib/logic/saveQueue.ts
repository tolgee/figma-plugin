import type { NodeInfo } from "$shared/types";
import { nextCorrelationId, send } from "$ui/lib/bus";

/**
 * Coalesces per-node plugin-data saves into a single debounced
 * `set-nodes-data` message.
 *
 * Every `NodeListItem` used to run its own 300 ms save timer, so applying the
 * key prefill to a fresh 150-node selection fired ~150 separate writes — and
 * each write made the main thread walk the entire selection again. Queueing
 * through this module turns that burst into ONE message (and one in-place
 * patch back), which is the difference between an instant and a frozen Figma.
 *
 * Later entries for the same node merge over earlier ones, so rapid keystrokes
 * collapse to the final value.
 */
const DEBOUNCE_MS = 300;
// The debounce is shared, so continuous edits across rows could postpone the
// flush indefinitely — cap the total latency from the FIRST queued entry.
const MAX_WAIT_MS = 1000;

const pending = new Map<string, Partial<NodeInfo>>();
let timer: ReturnType<typeof setTimeout> | null = null;
let firstQueuedAt: number | null = null;

export function queueNodeSave(id: string, info: Partial<NodeInfo>): void {
  const existing = pending.get(id);
  pending.set(id, existing ? { ...existing, ...info } : info);
  if (firstQueuedAt === null) firstQueuedAt = Date.now();
  if (Date.now() - firstQueuedAt >= MAX_WAIT_MS) {
    flushNodeSaves();
    return;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(flushNodeSaves, DEBOUNCE_MS);
}

/**
 * Drop a queued save — used when an edit lands back on the persisted value
 * (typing "x" and deleting it must not flush the intermediate "x").
 */
export function cancelNodeSave(id: string): void {
  pending.delete(id);
  if (pending.size === 0) {
    firstQueuedAt = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
}

/**
 * Send everything queued now. Called at action boundaries — route navigation,
 * plugin close (`pagehide`), and before direct writes — so a debounced edit
 * can never be read stale by a follow-up flow (push diffing an old key) or
 * flush AFTER a direct write and resurrect a value the user just replaced.
 */
export function flushNodeSaves(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  firstQueuedAt = null;
  if (pending.size === 0) return;
  const nodes = [...pending.entries()].map(([id, info]) => ({ id, info }));
  pending.clear();
  send({ type: "set-nodes-data", correlationId: nextCorrelationId(), nodes });
}
