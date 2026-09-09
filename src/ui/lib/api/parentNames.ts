import type { KeyParentNames } from "$shared/keyFormat";
import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";

// Single-shot response (no streaming) — a fixed timeout from request time is
// fine, unlike the streamed screenshot/create-copy round-trips.
const TIMEOUT_MS = 30_000;

/**
 * Round-trip to the main thread to resolve the parent placeholder names
 * ({component}/{frame}/…) for specific nodes. Used by the bulk "Generate key
 * names" action when its template references a parent placeholder the selection
 * scan didn't pre-resolve (the saved key format didn't use it). Returns a map
 * keyed by node id; a missing id / field means the node has no such ancestor.
 * Gives up after `TIMEOUT_MS` of no response, rejecting with a descriptive
 * Error — see `busRequest.ts`.
 */
export function resolveParentNames(
  nodeIds: string[],
): Promise<Record<string, KeyParentNames>> {
  return new Promise((resolve, reject) => {
    const correlationId = nextCorrelationId();
    const watchdog = createIdleTimeout(TIMEOUT_MS, () => {
      off();
      reject(new Error("Timed out waiting for parent names to resolve."));
    });
    const off = on("parent-names-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      watchdog.clear();
      off();
      resolve(msg.parents);
    });
    send({ type: "resolve-parent-names", correlationId, nodeIds });
  });
}
