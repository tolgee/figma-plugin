import type { MainToUi, UiToMain } from "$shared/messages";

type Handler = (msg: MainToUi) => void | Promise<void>;

/**
 * Multiple listeners per message type. Result messages have both a global
 * subscriber (App patches the selection from `nodes-set-result` /
 * `apply-translations-result`) and per-flow ones (Pull awaits its own
 * correlationId), so a single-slot registry would let one silently replace —
 * or worse, unsubscribe — the other.
 */
const handlers = new Map<MainToUi["type"], Set<Handler>>();

/**
 * UI → Main messages are routed through `parent.postMessage`, whose
 * structured-clone algorithm rejects Svelte 5 `$state` proxies with a
 * DataCloneError. Callers tend to pass `$state`-tracked objects directly
 * (config form snapshots, paramsValues, payloads built from reactive state),
 * so we strip the proxy layer here once. JSON-roundtrip is safe for our
 * payloads — we never send `Uint8Array`, `Map`, `Set`, `Date`, or other
 * non-JSON values from the UI; screenshots travel in the opposite direction.
 */
export function send(msg: UiToMain): void {
  const plain = JSON.parse(JSON.stringify(msg)) as UiToMain;
  parent.postMessage({ pluginMessage: plain }, "*");
}

export function on<K extends MainToUi["type"]>(
  type: K,
  handler: (msg: Extract<MainToUi, { type: K }>) => void | Promise<void>,
): () => void {
  let set = handlers.get(type);
  if (!set) {
    set = new Set();
    handlers.set(type, set);
  }
  const h = handler as Handler;
  set.add(h);
  return () => {
    set.delete(h);
  };
}

export function attachBus(): void {
  window.addEventListener("message", async (event) => {
    const msg = event.data?.pluginMessage as MainToUi | undefined;
    if (!msg) return;
    const set = handlers.get(msg.type);
    if (!set) return;
    // Snapshot so a handler that unsubscribes (or subscribes) mid-dispatch
    // doesn't mutate the iteration. Each handler is isolated — one throwing
    // must not skip the others (e.g. a flow-specific result listener failing
    // would otherwise silently drop App's global selection patch).
    for (const handler of [...set]) {
      try {
        await handler(msg);
      } catch (err) {
        console.error(`[tolgee:ui] handler for "${msg.type}" failed`, err);
      }
    }
  });
}

let counter = 0;
export function nextCorrelationId(): string {
  return `c${Date.now()}-${counter++}`;
}
