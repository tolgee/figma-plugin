import type { MainToUi, UiToMain } from "$shared/messages";

type Handlers = {
  [K in MainToUi["type"]]?: (msg: Extract<MainToUi, { type: K }>) => void | Promise<void>;
};

const handlers: Handlers = {};

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
  handlers[type] = handler as Handlers[K];
  return () => {
    delete handlers[type];
  };
}

export function attachBus(): void {
  window.addEventListener("message", async (event) => {
    const msg = event.data?.pluginMessage as MainToUi | undefined;
    if (!msg) return;
    const handler = handlers[msg.type] as ((m: MainToUi) => void | Promise<void>) | undefined;
    if (handler) await handler(msg);
  });
}

let counter = 0;
export function nextCorrelationId(): string {
  return `c${Date.now()}-${counter++}`;
}
