import { nextCorrelationId, on, send } from "$ui/lib/bus";
import type { NodeInfo } from "$shared/types";

/**
 * Round-trip to the main thread for every connected text node on the current
 * page, independent of the user's selection. Cancels the response listener if
 * the caller aborts (svelte-query passes a signal for in-flight cancellation).
 */
export function requestPageConnectedNodes(
  signal?: AbortSignal,
): Promise<NodeInfo[]> {
  return new Promise((resolve, reject) => {
    const correlationId = nextCorrelationId();
    const off = on("page-connected-nodes-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      off();
      signal?.removeEventListener("abort", onAbort);
      resolve(msg.nodes);
    });
    const onAbort = () => {
      off();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    send({ type: "request-page-connected-nodes", correlationId });
  });
}
