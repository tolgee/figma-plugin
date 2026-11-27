import type { NodeInfo } from "$shared/types";
import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";

// The main thread reports progress via `page-connected-nodes-progress` while
// it scans (only for pages with >100 connected nodes — see `scan.ts`), and
// every such message touches the watchdog below. So this is now a TRUE idle
// timeout: a big-but-alive scan keeps resetting the clock, and only a scan
// that goes silent for the whole 5 minutes trips it. 5 minutes (not 30s)
// because the scan itself reads every connected text node on the page (~5
// bridge calls each) and a page-wide document at a large company can hold
// thousands of them.
const TIMEOUT_MS = 5 * 60_000;

/**
 * Round-trip to the main thread for every connected text node on the current
 * page, independent of the user's selection. Cancels the response listener if
 * the caller aborts (svelte-query passes a signal for in-flight cancellation).
 * Also gives up after `TIMEOUT_MS` of silence, rejecting with a descriptive
 * Error — see `busRequest.ts`. `onProgress`, when given, is called with each
 * `page-connected-nodes-progress` message's `done`/`total` (small pages never
 * send any, so it may never fire).
 */
export function requestPageConnectedNodes(
  signal?: AbortSignal,
  onProgress?: (done: number, total: number) => void,
): Promise<NodeInfo[]> {
  return new Promise((resolve, reject) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offProgress();
      offError();
      watchdog.clear();
      signal?.removeEventListener("abort", onAbort);
    };
    const watchdog = createIdleTimeout(TIMEOUT_MS, () => {
      cleanup();
      reject(new Error("Timed out waiting for the page's connected nodes."));
    });
    const offResult = on("page-connected-nodes-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve(msg.nodes);
    });
    // A handler that THROWS never answers — the bus reports it instead; settle
    // now rather than sitting out the whole idle timeout.
    const offError = on("handler-error", (msg) => {
      if (!isErrorFor(msg, "request-page-connected-nodes", correlationId)) return;
      cleanup();
      reject(new Error(SCAN_FAILED_MESSAGE));
    });
    const offProgress = on("page-connected-nodes-progress", (msg) => {
      if (msg.correlationId !== correlationId) return;
      watchdog.touch();
      onProgress?.(msg.done, msg.total);
    });
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    send({ type: "request-page-connected-nodes", correlationId });
  });
}

/** How long to wait for `request-page-connected-keys`. Same cap as the full
 *  scan: this one is far lighter, but it sends no progress pings, and a false
 *  timeout on a huge page would abort the whole copy. */
const KEYS_TIMEOUT_MS = TIMEOUT_MS;

/**
 * Round-trip for just the (namespace, key) pairs the current page's connected
 * nodes use — the cheap stand-in for `requestPageConnectedNodes` when a
 * caller only needs to know what to pre-fetch from Tolgee (Recreate copy,
 * BEFORE anything is deleted), not full node info. See
 * `collectConnectedKeyRefs` on the main-thread side for why this is so much
 * lighter than a full connected-nodes scan.
 */
export function requestPageConnectedKeys(): Promise<
  Array<{ key: string; ns?: string; paramsValues?: Record<string, string>; pluralParamValue?: string }>
> {
  return new Promise((resolve, reject) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offError();
      watchdog.clear();
    };
    const watchdog = createIdleTimeout(KEYS_TIMEOUT_MS, () => {
      cleanup();
      reject(new Error("Timed out waiting for the page's connected keys."));
    });
    const offResult = on("page-connected-keys-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve(msg.keys);
    });
    const offError = on("handler-error", (msg) => {
      if (!isErrorFor(msg, "request-page-connected-keys", correlationId)) return;
      cleanup();
      reject(new Error(SCAN_FAILED_MESSAGE));
    });
    send({ type: "request-page-connected-keys", correlationId });
  });
}

const SCAN_FAILED_MESSAGE = "Scanning the page failed in Figma. Please try again.";

/** Is this `handler-error` about OUR request? The main bus echoes the failed
 *  request's correlation id when it had one; an uncorrelated report for the
 *  same message type still counts (older builds, or a throw before the id
 *  was read). */
function isErrorFor(
  msg: { forType: string; correlationId?: string },
  forType: string,
  correlationId: string,
): boolean {
  return msg.forType === forType && (msg.correlationId === undefined || msg.correlationId === correlationId);
}
